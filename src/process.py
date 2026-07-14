import boto3
import json

s3_client = boto3.client("s3")
dynamodb_client = boto3.client("dynamodb")

BUCKET = "openaq-rob-287820185021-eu-west-1-an"
KEY = "processed/locations.json"


class Location:
    def __init__(self, id: str, name: str, longitude: str, latitude: str):
        self.id = id
        self.name = name
        self.longitude = longitude
        self.latitude = latitude


class Measurements:
    def __init__(self):
        pass


class Statistics:
    def __init__(self):
        pass


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

        locations[locationId] = location.__dict__

    s3_client.put_object(
        Bucket=BUCKET, Key=KEY, Body=json.dumps(locations).encode("utf-8")
    )
