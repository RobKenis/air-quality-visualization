def handler(event, context):
    for record in event.get('Records', []):
        locationId = record.get('dynamodb').get('Keys').get('locationId').get('S')
        print(f"New measurement inserted for {locationId}")