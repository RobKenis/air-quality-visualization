import boto3
import json

client = boto3.client('s3')

BUCKET='openaq-rob-287820185021-eu-west-1-an'
KEY='processed/locations.json'

def handler(event, context):
    for record in event.get('Records', []):
        locationId = record.get('dynamodb').get('Keys').get('locationId').get('S')
        print(f"New measurement inserted for {locationId}")

        current = client.get_object(
            Bucket=BUCKET,
            Key=KEY,
        )
        content = current.get('Body').read().decode('utf-8')
        locations = json.loads(content)
        
        locations[locationId] = {}

        client.put_object(
            Bucket=BUCKET,
            Key=KEY,
            Body=json.dumps(locations).encode('utf-8')
        )
