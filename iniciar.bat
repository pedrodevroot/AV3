@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo ============================================
echo        AEROCODE - INICIANDO
echo ============================================
echo.

:: Verifica Docker
docker info > nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando.
    echo.
    echo Solucao: Abra o Docker Desktop e aguarde
    echo o icone ficar verde na barra de tarefas.
    echo Depois execute este arquivo novamente.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker esta rodando.

:: Verifica Node.js
node --version > nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js encontrado.

:: Dependencias da API
echo.
echo [1/7] Instalando dependencias da API...
cd api
if not exist node_modules (
    call npm install --silent
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias da API.
        pause
        exit /b 1
    )
)
echo [OK] Dependencias da API prontas.

:: Arquivo .env
echo.
echo [2/7] Configurando variaveis de ambiente...
if not exist .env (
    copy .env.example .env > nul
    echo [OK] Arquivo .env criado.
) else (
    echo [OK] Arquivo .env ja existe.
)

:: MySQL via Docker
echo.
echo [3/7] Iniciando banco de dados MySQL...
docker compose up -d
if errorlevel 1 (
    echo [ERRO] Falha ao iniciar o MySQL.
    pause
    exit /b 1
)
echo [OK] Container MySQL iniciado.

:: Aguarda MySQL ficar pronto
echo.
echo [4/7] Aguardando MySQL ficar pronto...
:aguarda
docker compose exec -T mysql mysqladmin ping -h localhost -uroot -proot123 --silent > nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak > nul
    goto aguarda
)
echo [OK] MySQL pronto!

:: Aplica schema no banco
echo.
echo [5/7] Criando tabelas no banco de dados...
call npx prisma db push --skip-generate --accept-data-loss > nul 2>&1
call npx prisma generate > nul 2>&1
echo [OK] Tabelas criadas.

:: Seed
echo.
echo [6/7] Criando usuario administrador...
call npm run prisma:seed
echo [OK] Admin criado. Login: admin / admin123

:: Dependencias do Frontend
echo.
echo [7/7] Instalando dependencias do Frontend...
cd ..\frontend
if not exist node_modules (
    call npm install --silent
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do Frontend.
        pause
        exit /b 1
    )
)
echo [OK] Dependencias do Frontend prontas.

cd ..

:: Abre a API em novo terminal
echo.
echo Iniciando API na porta 3333...
start "Aerocode API" cmd /k "cd /d "%~dp0api" && npm run dev"
timeout /t 4 /nobreak > nul

:: Abre o Frontend em novo terminal
echo Iniciando Frontend na porta 5173...
start "Aerocode Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 6 /nobreak > nul

:: Abre o navegador
start http://localhost:5173

echo.
echo ============================================
echo   Projeto rodando com sucesso!
echo.
echo   Acesse: http://localhost:5173
echo   API:    http://localhost:3333
echo.
echo   Login:  admin
echo   Senha:  admin123
echo.
echo   Para parar: execute parar.bat
echo ============================================
echo.
pause
