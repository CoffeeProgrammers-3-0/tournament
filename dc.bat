@echo off
SET PROFILE=%1
IF "%PROFILE%"=="" SET PROFILE=dev

IF /I "%PROFILE%"=="prod" (
    echo Starting PROD profile
    docker compose --profile prod --env-file .env --env-file .env.prod up --build
) ELSE (
    echo Starting DEV profile
    docker compose --profile dev --env-file .env --env-file .env.dev up --build
)