#!/bin/bash

# Set environment variables for development, production, and staging
export SHOPIFY_CLI_TTY=1
export SHOPIFY_FLAG_STORE="cellcosmet-us-dev.myshopify.com"
export SHOPIFY_CLI_THEME_TOKEN="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"
export THEME_LIVE="168283439426"
export THEME_STAGING="168283439426"
export THEME_QA="168283439426"
export STORE_DEV="cellcosmet-us-dev.myshopify.com"
export TOKEN_DEV="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"
export STORE_PROD="cellcosmet-us-dev.myshopify.com"
export TOKEN_PROD="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"
export ACCESS_TOKEN="glpat-8Nd3P7ckan7JQnQJx24b"

# Additional variables for stage live
export STORE_STAGE_LIVE="cellcosmet-us-dev.myshopify.com"
export TOKEN_STAGE_LIVE="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"
export LIVE="true"

echo "Environment variables have been set."

# Optional: Save these environment variables to a .env file
cat <<EOL > .env
SHOPIFY_CLI_TTY=1
SHOPIFY_FLAG_STORE=cellcosmet-us-dev.myshopify.com
SHOPIFY_CLI_THEME_TOKEN=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
THEME_LIVE=168283439426
THEME_STAGING=168283439426
THEME_QA=168283439426
STORE_DEV=cellcosmet-us-dev.myshopify.com
TOKEN_DEV=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
STORE_PROD=cellcosmet-us-dev.myshopify.com
TOKEN_PROD=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
ACCESS_TOKEN=glpat-8Nd3P7ckan7JQnQJx24b
STORE_STAGE_LIVE=cellcosmet-us-dev.myshopify.com
TOKEN_STAGE_LIVE=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
LIVE=true
EOL

echo "Environment variables have been saved to .env file."