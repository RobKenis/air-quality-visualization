data "archive_file" "ingest" {
  type        = "zip"
  source_file = "${path.module}/../src/ingest.py"
  output_path = "${path.module}/dist/ingest.zip"
}

resource "aws_cloudwatch_log_group" "ingest" {
  name              = "/aws/lambda/${local.prefix}-ingest"
  retention_in_days = 7
}

resource "aws_lambda_function" "ingest" {
  filename      = data.archive_file.ingest.output_path
  function_name = "${local.prefix}-ingest"
  role          = local.lambda_role
  handler       = "ingest.handler"
  code_sha256   = data.archive_file.ingest.output_base64sha256
  runtime       = "python3.14"
}

resource "aws_lambda_event_source_mapping" "trigger_ingest" {
  event_source_arn = "arn:aws:sqs:eu-west-1:287820185021:openaq-rob-test"
  enabled          = true
  function_name    = aws_lambda_function.ingest.arn
  batch_size       = 1
}