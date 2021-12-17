#!/bin/bash

# Sets up the s3 lambda bucket with blue and green files for seal-in-lower code

# Usage
#   ./setup-s3-seal-in-lower-file.sh dev

./check-env-variables.sh \
  "ENV" \
  "EFCMS_DOMAIN" \
  "AWS_ACCOUNT_ID" \
  "AWS_ACCESS_KEY_ID" \
  "AWS_SECRET_ACCESS_KEY"

ENV=$1
BUCKET_NAME_EAST="${EFCMS_DOMAIN}.efcms.${ENV}.us-east-1.lambdas"
BUCKET_NAME_WEST="${EFCMS_DOMAIN}.efcms.${ENV}.us-west-1.lambdas"

DEPLOYING_COLOR=$(./scripts/get-deploying-color.sh ${ENV})
CURRENT_COLOR=$(./scripts/get-current-color.sh ${ENV})

aws s3 cp s3://${BUCKET_NAME_EAST}/seal_in_lower_${DEPLOYING_COLOR}.js.zip s3://${BUCKET_NAME_EAST}/seal_in_lower_${CURRENT_COLOR}.js.zip
