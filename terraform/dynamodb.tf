resource "aws_dynamodb_table" "this" {
  name           = local.prefix
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "locationId"
  range_key      = "pollutant"

  attribute {
    name = "locationId"
    type = "S"
  }

  attribute {
    name = "pollutant"
    type = "S"
  }
}