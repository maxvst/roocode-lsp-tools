#!/bin/bash
# Скрипт для запуска тестов
set -e

echo "Building test framework..."
cd "$(dirname "$0")"
npm run build

echo "Running tests..."
node cli.js test --verbose "$@"
