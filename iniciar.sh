#!/bin/bash
# ─── Aerocode — Script de inicialização (Linux) ───────────────────────────────

set -e
PASTA="$(cd "$(dirname "$0")" && pwd)"

# Cores
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
RESET='\033[0m'

echo ""
echo " ╔═══════════════════════════════════════════╗"
echo " ║          AEROCODE — INICIANDO             ║"
echo " ╚═══════════════════════════════════════════╝"
echo ""

# ─── Verifica Docker ──────────────────────────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
    echo -e " ${VERMELHO}[ERRO] Docker não está rodando.${RESET}"
    echo ""
    echo " Solução: execute o comando abaixo e tente de novo:"
    echo "   sudo systemctl start docker"
    echo ""
    exit 1
fi

# ─── Verifica Node.js ─────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e " ${VERMELHO}[ERRO] Node.js não encontrado.${RESET}"
    echo " Instale com:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
    echo "   sudo apt install -y nodejs"
    exit 1
fi

# ─── Dependências da API ──────────────────────────────────────────────────────
echo " [1/7] Verificando dependências da API..."
cd "$PASTA/api"
if [ ! -d "node_modules" ]; then
    echo "        Instalando pacotes... aguarde."
    npm install --silent
fi
echo "        OK"

# ─── Arquivo .env ─────────────────────────────────────────────────────────────
echo " [2/7] Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "        Arquivo .env criado."
else
    echo "        Arquivo .env já existe."
fi

# ─── MySQL via Docker ─────────────────────────────────────────────────────────
echo " [3/7] Iniciando banco de dados MySQL..."
docker compose up -d > /dev/null 2>&1
echo "        Container iniciado."

# ─── Aguarda MySQL ficar pronto ───────────────────────────────────────────────
echo " [4/7] Aguardando MySQL ficar pronto..."
until docker compose exec -T mysql mysqladmin ping -h localhost -uroot -proot123 --silent > /dev/null 2>&1; do
    sleep 3
done
echo -e "        ${VERDE}MySQL pronto!${RESET}"

# ─── Aplica schema no banco ───────────────────────────────────────────────────
echo " [5/7] Criando tabelas no banco de dados..."
npx prisma db push --skip-generate --accept-data-loss > /dev/null 2>&1
npx prisma generate > /dev/null 2>&1
echo "        Tabelas criadas."

# ─── Seed ─────────────────────────────────────────────────────────────────────
echo " [6/7] Criando usuário administrador..."
npm run prisma:seed 2>/dev/null || true
echo "        Pronto. Login: admin / admin123"

# ─── Dependências do Frontend ─────────────────────────────────────────────────
echo " [7/7] Verificando dependências do Frontend..."
cd "$PASTA/frontend"
if [ ! -d "node_modules" ]; then
    echo "        Instalando pacotes... aguarde."
    npm install --silent
fi
echo "        OK"

# ─── Inicia API e Frontend ────────────────────────────────────────────────────
echo ""
echo " Iniciando API e Frontend..."
echo ""

# Inicia API em background
cd "$PASTA/api"
npm run dev > /tmp/aerocode-api.log 2>&1 &
PID_API=$!

sleep 3

# Inicia Frontend em background
cd "$PASTA/frontend"
npm run dev > /tmp/aerocode-frontend.log 2>&1 &
PID_FRONTEND=$!

sleep 4

# Abre o navegador
xdg-open http://localhost:5173 > /dev/null 2>&1 || \
sensible-browser http://localhost:5173 > /dev/null 2>&1 || true

echo " ╔═══════════════════════════════════════════╗"
echo " ║   Projeto rodando com sucesso!            ║"
echo " ║                                           ║"
echo " ║   Navegador: http://localhost:5173        ║"
echo " ║   API:       http://localhost:3333        ║"
echo " ║                                           ║"
echo " ║   Login:  admin                           ║"
echo " ║   Senha:  admin123                        ║"
echo " ║                                           ║"
echo -e " ║   ${AMARELO}Pressione Ctrl+C para parar tudo${RESET}       ║"
echo " ╚═══════════════════════════════════════════╝"
echo ""
echo " Logs em tempo real:"
echo "   API:      /tmp/aerocode-api.log"
echo "   Frontend: /tmp/aerocode-frontend.log"
echo ""

# Para tudo quando o usuário pressionar Ctrl+C
cleanup() {
    echo ""
    echo " Parando API e Frontend..."
    kill $PID_API 2>/dev/null || true
    kill $PID_FRONTEND 2>/dev/null || true
    echo " Parando banco de dados..."
    cd "$PASTA/api"
    docker compose down > /dev/null 2>&1
    echo " Tudo parado. Até mais!"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Mantém o script rodando
wait
