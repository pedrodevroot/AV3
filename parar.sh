#!/bin/bash
PASTA="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo " Parando banco de dados..."
cd "$PASTA/api"

if docker compose version > /dev/null 2>&1; then
    docker compose down
elif command -v docker-compose > /dev/null 2>&1; then
    docker-compose down
fi

echo " Encerrando processos..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo " Tudo parado!"
echo ""
