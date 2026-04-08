#!/bin/bash
PROFILE=${1:-dev}

if [ "$PROFILE" = "prod" ]; then
  echo "Starting PROD profile"
  docker compose --profile prod --env-file .env --env-file .env.prod up --build
else
  echo "Starting DEV profile"
  docker compose --profile dev --env-file .env --env-file .env.dev up --build
fi