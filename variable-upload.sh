#!/bin/bash

# Set GitLab access token
export GITLAB_ACCESS_TOKEN="glpat-8Nd3P7ckan7JQnQJx24b"

# Define the project ID for the GitLab repository
PROJECT_ID="58611307"

# Define the environment variables to add
VARIABLES=(
  "SHOPIFY_CLI_TTY=1"
  "SHOPIFY_FLAG_STORE=cellcosmet-us-dev.myshopify.com"
  "SHOPIFY_CLI_THEME_TOKEN=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"
  "THEME_LIVE=168283439426"
  "THEME_STAGING=168283439426"
  "THEME_QA=168283439426"
  "STORE_DEV=cellcosmet-us-dev.myshopify.com"
  "TOKEN_DEV=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"
  "STORE_PROD=cellcosmet-us-dev.myshopify.com"
  "TOKEN_PROD=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"
  "ACCESS_TOKEN=$GITLAB_ACCESS_TOKEN"
  "STORE_STAGE_LIVE=cellcosmet-us-dev.myshopify.com"
  "TOKEN_STAGE_LIVE=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"
  "LIVE=true"
)

# Function to add a variable to the GitLab repository
add_gitlab_variable() {
  local project_id=$1
  local key=$2
  local value=$3
  local protected=${4:-false}

  curl --request POST "https://gitlab.com/api/v4/projects/$project_id/variables" \
    --header "PRIVATE-TOKEN: $GITLAB_ACCESS_TOKEN" \
    --header "Content-Type: application/json" \
    --data "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"protected\": $protected
    }"
}

# Iterate over the variables and add each one to the GitLab repository
for var in "${VARIABLES[@]}"; do
  IFS="=" read -r key value <<< "$var"
  add_gitlab_variable $PROJECT_ID $key $value
done

echo "Environment variables have been added to the GitLab repository."