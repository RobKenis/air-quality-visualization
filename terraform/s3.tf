resource "aws_s3_bucket" "this" {
  bucket           = format("%s-%s-%s-an", local.prefix, data.aws_caller_identity.current.account_id, data.aws_region.current.region)
  bucket_namespace = "account-regional"
}
