# Design Document

## How to ingest data

1. Read message from SQS
2. Extract the actual message from the SNS message
3. Store in S3 on path `openaq/locationId/parameter/YYYY/MM/DD/HHmmss.json` (UTC time)

## How to process data

Use S3 events to trigger a Lambda function when new data is ingested in S3. Based on the S3 path, fetch the data and the 2 previous data points. Data is stored in a rolling window of 7 days.

| Field           | Description                                            | Example                                                                          |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| locationId (PK) | Unique identifier of the location                      | 6311                                                                             |
| location        | Name of the location                                   | Mehaigne                                                                         |
| coordinates     | Latitude and longitude of the location                 | 50.59443, 4.87607                                                                |
| parameter (SK)  | Pollutant type                                         | pm10                                                                             |
| values          | List of pollutant concentration values with timestamps | [{ "value": 49.1649997356631, "date": "2026-07-11 10:40:39.272756", "aqi": 50 }] |

Values: Based on the formula in the AQI document, calculate the AQI for each pollutant before storing the data. For the timestamp, use the UTC timestamp from the source data.

## How to visualize data

To visualize data on a map, we need following data:
- Coordinates of relevant location
- Historical data on pollutant concentration for that location
- AQI that translates to color based on breakpoints
