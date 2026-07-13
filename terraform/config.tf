terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  backend "s3" {
    bucket = "openaq-rob-287820185021-eu-west-1-an"
    key    = "terraform/terraform.tfstate"
    region = "eu-west-1"
    profile = "dataminded"
  }
}

provider "aws" {
  region = "eu-west-1"
  profile = "dataminded"
  default_tags {
    tags = {
        "Owner" = "Rob Kenis"
    }
  }
}