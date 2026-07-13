# OpenAQ

The data is available on various sources, for this application, only SQS is relevant. Messages on the queue look as follows:

```json
{
  "Type" : "Notification",
  "MessageId" : "5ae33ea1-ba12-5825-b1e4-5c6da384b446",
  "TopicArn" : "arn:aws:sns:us-east-1:287820185021:openaq-simulator",
  "Message" : "{\"locationId\": 6311, \"location\": \"Mehaigne\", \"parameter\": \"pm10\", \"value\": 49.1649997356631, \"date\": {\"utc\": \"2026-07-11 10:40:39.272756\", \"local\": \"2026-07-11 10:40:39.272756+02:00\"}, \"unit\": \"\\u00b5g/m\\u00b3\", \"coordinates\": {\"latitude\": 50.59443, \"longitude\": 4.87607}, \"country\": \"BE\", \"city\": \"Mehaigne\", \"isMobile\": false, \"isAnalysis\": true, \"entity\": \"past\", \"sensorType\": \"reference grade\"}",
  "Timestamp" : "2026-07-11T10:13:42.597Z",
  "SignatureVersion" : "1",
  "Signature" : "XkGB64p7xRpiX8j/fVgb27DMbyNKxlmAvOD/wEo+ysEvAnLkycyaGRZOd+wqN+kjqb6FdhPqh/6sfL6HAoqLfal/9tnx3EN2DzqCnJ9iSqtvRV0oZolihjpbI0EKp3wAoJgRWY1CP2zmmNCEbThq9bGJ4WzSd5OizVhTDl+if9YG76IIvWn2UgkfoEGNlKf25Udh+VjkO/0VhO5IXOOTTH5VZHg/4HMsuByVys2SCL6F0w6Fu7LE2qXGyxRGw8/UGFGzMUvqSEWUKGpu/AFSA/7zdbAhdXwh0dKS8RcLU0cEgpJQE33XI6ALUzwg6orrq4gMWpAqZ/CAUEe25J5RZw==",
  "SigningCertURL" : "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-7506a1e35b36ef5a444dd1a8e7cc3ed8.pem",
  "UnsubscribeURL" : "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:287820185021:openaq-simulator:1b12e0e9-cd68-49f7-b1fd-8c1aa8955b54"
}

As you can see, the data is an SNS message wrapped into an SQS message. The content of the SNS message looks as follows:

```json
{
  "locationId": 6311,
  "location": "Mehaigne",
  "parameter": "pm10",
  "value": 49.1649997356631,
  "date": {
    "utc": "2026-07-11 10:40:39.272756",
    "local": "2026-07-11 10:40:39.272756+02:00"
  },
  "unit": "\u00b5g/m\u00b3",
  "coordinates": {
    "latitude": 50.59443,
    "longitude": 4.87607
  },
  "country": "BE",
  "city": "Mehaigne",
  "isMobile": false,
  "isAnalysis": true,
  "entity": "past",
  "sensorType": "reference grade"
}
```
