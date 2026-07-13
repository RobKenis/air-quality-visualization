data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  prefix      = "openaq-rob"
  lambda_role = "arn:aws:iam::287820185021:role/lambda-execution-role"
}
