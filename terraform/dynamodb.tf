resource "aws_dynamodb_table" "this" {
  name             = local.prefix
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "locationId"
  range_key        = "pollutant"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "locationId"
    type = "S"
  }

  attribute {
    name = "pollutant"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
