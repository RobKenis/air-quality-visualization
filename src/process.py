import boto3
import json

from functools import reduce

s3_client = boto3.client("s3")
dynamodb_client = boto3.client("dynamodb")

BUCKET = "openaq-rob-287820185021-eu-west-1-an"
KEY = "processed/locations.json"

POLLUTANTS = ["pm25", "pm10", "o3", "no2", "so2", "co"]


class Location:
    def __init__(self, id: str, name: str, longitude: str, latitude: str):
        self.id = id
        self.name = name
        self.longitude = longitude
        self.latitude = latitude


class Measurements:
    measurements = {}

    def __init__(self, locationId: str):
        for pollutant in POLLUTANTS:
            response = dynamodb_client.query(
                TableName="openaq-rob",
                KeyConditionExpression="locationId = :loc AND begins_with(pollutant, :prefix)",
                ExpressionAttributeValues={
                    ":loc": {"S": locationId},
                    ":prefix": {"S": pollutant},
                },
                ScanIndexForward=False,
            )
            items = response.get("Items", [])
            # print(f"Found {len(items)} measurements for {pollutant}")
            self.measurements[pollutant] = list(map(self._map, items))

    def _map(self, input):
        return {
            "value": float(input.get("value").get("N")),
            "timestamp": input.get("timestamp").get("S"),
            "aqi": int(input.get("aqi").get("N")),
        }

    def _get_air_quality(self):
        worst_air_quality = 0
        for pollutant_values in self.measurements.values():
            latest_measurement = next(iter(pollutant_values), {})
            latest_aqi = latest_measurement.get("aqi", 0)
            if latest_aqi > worst_air_quality:
                worst_air_quality = latest_aqi
        return worst_air_quality

    def to_dict(self):
        return {
            "measurements": self.measurements,
            "air_quality": self._get_air_quality(),
        }


def handler(event, context):
    current = s3_client.get_object(
        Bucket=BUCKET,
        Key=KEY,
    )
    content = current.get("Body").read().decode("utf-8")
    locations = json.loads(content)

    for record in event.get("Records", []):
        locationId = record.get("dynamodb").get("Keys").get("locationId").get("S")
        print(f"New measurement inserted for {locationId}")

        location = Location(
            id=locationId,
            name=record.get("dynamodb").get("NewImage").get("location").get("S"),
            longitude=record.get("dynamodb").get("NewImage").get("longitude").get("S"),
            latitude=record.get("dynamodb").get("NewImage").get("latitude").get("S"),
        )

        measurements = Measurements(locationId=location.id)

        locations[locationId] = location.__dict__

        s3_client.put_object(
            Bucket=BUCKET,
            Key=f"processed/{location.id}.json",
            Body=json.dumps(measurements.to_dict()).encode("utf-8"),
            ACL="public-read",
        )

    s3_client.put_object(
        Bucket=BUCKET,
        Key=KEY,
        ACL="public-read",
        Body=json.dumps(locations).encode("utf-8"),
    )
