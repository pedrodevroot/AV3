#!/bin/bash
PASTA="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo " Parando banco de dados..."
cd "$PASTA/api"
docker compose down

echo " Encerrando processos..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo " Tudo parado!"
echo ""
