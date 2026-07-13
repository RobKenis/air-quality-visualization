from datetime import datetime, timezone
import json
import math

import boto3

EXPIRATION_PERIOD_IN_SECONDS = 604800

AQI_BREAKPOINTS = {
    "pm25": [
        (0.0, 9.0, 0, 50),
        (9.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 125.4, 151, 200),
        (125.5, 225.4, 201, 300),
        (225.5, 325.4, 301, 400),
        (325.5, 500.4, 401, 500),
    ],
    "pm10": [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 504, 301, 400),
        (505, 604, 401, 500),
    ],
    "o3": [
        (0.000, 0.054, 0, 50),
        (0.055, 0.070, 51, 100),
        (0.071, 0.085, 101, 150),
        (0.086, 0.105, 151, 200),
        (0.106, 0.200, 201, 300),
    ],
    "co": [
        (0.0, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
    ],
    "so2": [
        (0, 35, 0, 50),
        (36, 75, 51, 100),
        (76, 185, 101, 150),
        (186, 304, 151, 200),
        (305, 604, 201, 300),
    ],
    "no2": [
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
    ],
}


MOLECULAR_WEIGHTS = {
    "o3": 48.00,
    "co": 28.01,
    "so2": 64.07,
    "no2": 46.01,
}


def ugm3_to_ppm(value, molecular_weight):
    """
    Convert µg/m³ to ppm at 25°C and 1 atm.
    """
    return value * 24.45 / (molecular_weight * 1000)


def ugm3_to_ppb(value, molecular_weight):
    """
    Convert µg/m³ to ppb at 25°C and 1 atm.
    """
    return value * 24.45 / molecular_weight


def truncate(value, pollutant):
    """
    EPA truncation rules.
    """
    if pollutant in ("pm25", "co"):
        return math.floor(value * 10) / 10

    if pollutant == "o3":
        return math.floor(value * 1000) / 1000

    if pollutant in ("so2", "no2", "pm10"):
        return math.floor(value)

    raise ValueError(f"Unknown pollutant: {pollutant}")


def convert_measurement(value_ugm3, pollutant):
    """
    Convert OpenAQ µg/m³ values into AQI breakpoint units.
    """

    if pollutant in ("pm25", "pm10"):
        return value_ugm3

    if pollutant in ("o3", "co"):
        return ugm3_to_ppm(
            value_ugm3,
            MOLECULAR_WEIGHTS[pollutant],
        )

    if pollutant in ("so2", "no2"):
        return ugm3_to_ppb(
            value_ugm3,
            MOLECULAR_WEIGHTS[pollutant],
        )

    raise ValueError(f"Unknown pollutant: {pollutant}")


def calculate_aqi(value_ugm3, pollutant):
    pollutant = pollutant.lower()

    concentration = convert_measurement(value_ugm3, pollutant)
    concentration = truncate(concentration, pollutant)

    for low, high, aqi_low, aqi_high in AQI_BREAKPOINTS[pollutant]:
        if low <= concentration <= high:
            return round(
                (aqi_high - aqi_low) / (high - low) * (concentration - low) + aqi_low
            )

    return 500


def handler(event, context):
    dynamodb = boto3.client("dynamodb")

    for record in event.get("Records", []):
        sns_message = record.get("body", {})
        message = json.loads(sns_message).get("Message", "{}")
        content = json.loads(message)
        print(
            f"Received [{content.get('parameter')}] measurements for [{content.get('locationId')}]"
        )

        timestamp = content.get("date", {}).get("utc")
        timestamp_epoch = int(
            datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S.%f")
            .replace(tzinfo=timezone.utc)
            .timestamp()
        )
        dynamodb.put_item(
            TableName="openaq-rob",
            Item={
                "locationId": {"S": str(content.get("locationId"))},
                "location": {"S": content.get("location")},
                "pollutant": {"S": f"{content.get('parameter')}#{timestamp_epoch}"},
                "timestamp": {"S": timestamp},
                "longitude": {"S": str(content.get("coordinates").get("longitude"))},
                "latitude": {"S": str(content.get("coordinates").get("latitude"))},
                "value": {"N": str(content.get("value"))},
                "aqi": {
                    "N": str(
                        calculate_aqi(content.get("value"), content.get("parameter"))
                    )
                },
                "ttl": {"N": str(timestamp_epoch + EXPIRATION_PERIOD_IN_SECONDS)},
            },
        )

    return {"statusCode": 200}
