#!/bin/bash
PASTA="$(cd "$(dirname "$0")" && pwd)"

VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
RESET='\033[0m'

echo ""
echo " ╔═══════════════════════════════════════════╗"
echo " ║          AEROCODE — INICIANDO             ║"
echo " ╚═══════════════════════════════════════════╝"
echo ""

# ─── Captura o docker ANTES de mexer no PATH (pode estar em /mnt/wsl) ────────
DOCKER_BIN="$(command -v docker || true)"
if [ -z "$DOCKER_BIN" ]; then
    echo -e " ${VERMELHO}[ERRO] Docker nao encontrado.${RESET}"
    echo " No Linux Mint:  sudo apt install -y docker.io docker-compose-plugin"
    echo " No Windows:     abra o Docker Desktop e ative a integracao com o WSL."
    exit 1
fi

# ─── Detecta o comando de compose: 'docker compose' (v2) ou 'docker-compose' (v1)
if "$DOCKER_BIN" compose version > /dev/null 2>&1; then
    COMPOSE="$DOCKER_BIN compose"
elif command -v docker-compose > /dev/null 2>&1; then
    COMPOSE="$(command -v docker-compose)"
else
    echo -e " ${VERMELHO}[ERRO] Docker Compose nao encontrado.${RESET}"
    echo " No Linux Mint:  sudo apt install -y docker-compose-plugin"
    exit 1
fi

# ─── Prioriza binarios Linux (sem remover /mnt, para nao quebrar o docker) ───
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# ─── Garante Node.js Linux nativo ────────────────────────────────────────────
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ] || echo "$NODE_BIN" | grep -q '/mnt/'; then
    echo " Node.js Linux nao encontrado. Instalando (pode pedir sua senha)..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
    NODE_BIN="/usr/bin/node"
fi
NPM_BIN="$(dirname "$NODE_BIN")/npm"

echo " Node: $($NODE_BIN --version)  |  npm: $($NPM_BIN --version)"
echo ""

# ─── Verifica se o Docker esta rodando ───────────────────────────────────────
if ! "$DOCKER_BIN" info > /dev/null 2>&1; then
    echo -e " ${VERMELHO}[ERRO] Docker nao esta rodando.${RESET}"
    echo " Abra o Docker Desktop no Windows e aguarde ficar verde."
    exit 1
fi

# ─── [1/7] Dependencias da API ───────────────────────────────────────────────
echo " [1/7] Instalando dependencias da API..."
cd "$PASTA/api"
if [ -f "node_modules/.bin/prisma" ] && ! head -1 "node_modules/.bin/prisma" 2>/dev/null | grep -q "^#!"; then
    echo "        Binarios Windows detectados. Reinstalando..."
    rm -rf node_modules
fi
"$NPM_BIN" install --silent 2>/dev/null
echo "        OK"

# ─── [2/7] .env ──────────────────────────────────────────────────────────────
echo " [2/7] Configurando variaveis de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "        Arquivo .env criado."
else
    echo "        Arquivo .env ja existe."
fi

set -o allexport
source .env
set +o allexport

# ─── [3/7] MySQL ─────────────────────────────────────────────────────────────
echo " [3/7] Iniciando banco de dados MySQL..."
$COMPOSE up -d > /dev/null 2>&1
echo "        Container iniciado."

# ─── [4/7] Aguarda MySQL ─────────────────────────────────────────────────────
echo " [4/7] Aguardando MySQL ficar pronto..."
until $COMPOSE exec -T mysql mysqladmin ping -h localhost -uroot -proot123 --silent > /dev/null 2>&1; do
    sleep 3
done
echo -e "        ${VERDE}MySQL pronto!${RESET}"

# ─── [5/7] Cria tabelas (chamando o prisma via node Linux explicito) ─────────
echo " [5/7] Criando tabelas no banco de dados..."
if ! "$NODE_BIN" node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss 2>&1; then
    echo -e " ${VERMELHO}[ERRO] Falha ao criar tabelas. Verifique o .env${RESET}"
    exit 1
fi
"$NODE_BIN" node_modules/prisma/build/index.js generate > /dev/null 2>&1 || true
echo "        Tabelas criadas."

# ─── [6/7] Seed ──────────────────────────────────────────────────────────────
echo " [6/7] Criando usuario administrador..."
"$NODE_BIN" node_modules/tsx/dist/cli.mjs prisma/seed.ts 2>/dev/null || true
echo "        Pronto. Login: admin / admin123"

# ─── [7/7] Dependencias do Frontend ──────────────────────────────────────────
echo " [7/7] Instalando dependencias do Frontend..."
cd "$PASTA/frontend"
"$NPM_BIN" install --silent 2>/dev/null
echo "        OK"

# ─── Inicia API e Frontend ───────────────────────────────────────────────────
echo ""
echo " Iniciando API e Frontend..."
echo ""

cd "$PASTA/api"
"$NODE_BIN" node_modules/tsx/dist/cli.mjs watch src/server.ts > /tmp/aerocode-api.log 2>&1 &
PID_API=$!

sleep 5

cd "$PASTA/frontend"
"$NODE_BIN" node_modules/vite/bin/vite.js > /tmp/aerocode-frontend.log 2>&1 &
PID_FRONTEND=$!

sleep 5

xdg-open http://localhost:5173 > /dev/null 2>&1 || \
sensible-browser http://localhost:5173 > /dev/null 2>&1 || \
"$DOCKER_BIN" --version > /dev/null 2>&1 || true

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
echo " Logs:"
echo "   API:      /tmp/aerocode-api.log"
echo "   Frontend: /tmp/aerocode-frontend.log"
echo ""

cleanup() {
    echo ""
    echo " Parando API e Frontend..."
    kill $PID_API 2>/dev/null || true
    kill $PID_FRONTEND 2>/dev/null || true
    echo " Parando banco de dados..."
    cd "$PASTA/api"
    $COMPOSE down > /dev/null 2>&1
    echo " Tudo parado."
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
