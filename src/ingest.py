import json
import math

import boto3

AQI_BREAKPOINTS = {
    "o3": [
        (0.000, 0.054, 0, 50),
        (0.055, 0.070, 51, 100),
        (0.071, 0.085, 101, 150),
        (0.086, 0.105, 151, 200),
        (0.106, 0.200, 201, 300),
    ],
    "pm25": [
        (0.000, 9.0, 0, 50),
        (9.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 125.4, 151, 200),
        (125.5, 225.4, 201, 300),
    ],
    "pm10": [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
    ],
    "co": [
        (0.000, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
    ],
    "so2": [
        (0.000, 0.035, 0, 50),
        (0.036, 0.145, 51, 100),
        (0.146, 0.225, 101, 150),
        (0.226, 0.385, 151, 200),
        (0.386, 0.604, 201, 300),
    ],
    "no2": [
        (0.000, 0.053, 0, 50),
        (0.054, 0.100, 51, 100),
        (0.101, 0.360, 101, 150),
        (0.361, 0.649, 151, 200),
        (0.650, 1.249, 201, 300),
    ],
}


def _round_measurement(value, pollutant):
    if pollutant == "pm25":
        return math.floor(value * 10) / 10
    elif pollutant == "pm10":
        return math.floor(value)
    elif pollutant in ["o3", "co", "so2", "no2"]:
        return math.floor(value * 1000) / 1000
    else:
        raise ValueError(f"Unknown pollutant: {pollutant}")


def calculate_aqi(value, pollutant):
    breakpoints = AQI_BREAKPOINTS.get(pollutant)
    if not breakpoints:
        raise ValueError(f"Unknown pollutant: {pollutant}")

    concentration = _round_measurement(value, pollutant)

    for c_low, c_high, aqi_low, aqi_high in breakpoints:
        if c_low <= concentration <= c_high:
            aqi = (
                ((aqi_high - aqi_low) / (c_high - c_low))
                * (concentration - c_low)
                + aqi_low
            )
            return int(round(aqi))

    return 301  # Default to 301 if value is above the highest breakpoint


def handler(event, context):
    dynamodb = boto3.client("dynamodb")

    sns_message = event.get("Message", {})
    content = json.loads(sns_message)
    print(
        f"Received [{content.get('parameter')}] measurements for [{content.get('locationId')}]"
    )

    dynamodb.put_item(
        TableName="openaq-rob",
        Item={
            "locationId": {"S": content.get("locationId")},
            "pollutant": {
                "S": f"{content.get('parameter')}#{content.get('timestamp')}"
            },
            "timestamp": {"S": content.get("date").get("utc")},
            "longitude": {"S": str(content.get("coordinates").get("longitude"))},
            "latitude": {"S": str(content.get("coordinates").get("latitude"))},
            "value": {"N": str(content.get("value"))},
            "aqi": {
                "N": str(calculate_aqi(content.get("value"), content.get("parameter")))
            },
        },
    )

    return {"statusCode": 200}
