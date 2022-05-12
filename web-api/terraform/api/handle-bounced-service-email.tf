resource "aws_lambda_function" "zip_handle_bounce" {
  count            = var.create_bounce_handler
  depends_on       = [var.bounce_handler_object]
  s3_bucket        = var.lambda_bucket_id
  s3_key           = "bounce_handler_${var.current_color}.js.zip"
  source_code_hash = var.bounce_handler_object_hash
  function_name    = "bounce_handler_${var.environment}_${var.current_color}"
  role             = "arn:aws:iam::${var.account_id}:role/lambda_role_${var.environment}"
  handler          = "handle-bounced-service-email.handler"
  timeout          = "60"
  memory_size      = "768"

  runtime = "nodejs14.x"

  environment {
    variables = var.lambda_environment
  }

  layers = [
    aws_lambda_layer_version.puppeteer_layer.arn
  ]
}