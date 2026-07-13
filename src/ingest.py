def handler(event, context):
    print("Received event: " + str(event))
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }