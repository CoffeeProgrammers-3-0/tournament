#!/bin/sh

KEYCLOAK_HOST=localhost
KEYCLOAK_PORT=8080
MAX_RETRIES=100
SLEEP_TIME=10

echo "Waiting for Keycloak at $KEYCLOAK_HOST:$KEYCLOAK_PORT..."

retries=0
while ! curl --silent --fail http://$KEYCLOAK_HOST:$KEYCLOAK_PORT; do
  retries=$((retries+1))
  if [ $retries -ge $MAX_RETRIES ]; then
    echo "Keycloak is not available after $((MAX_RETRIES * SLEEP_TIME)) seconds. Exiting."
    exit 1
  fi
  echo "Keycloak not available yet. Waiting..."
  sleep $SLEEP_TIME
done

echo "Keycloak is up! Starting backend..."
exec "$@"
