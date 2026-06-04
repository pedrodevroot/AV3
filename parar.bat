@echo off
cd /d "%~dp0"

echo.
echo Parando banco de dados MySQL...
cd api
docker compose down
echo [OK] MySQL parado.
echo.
echo Feche as janelas da API e do Frontend manualmente.
echo.
pause
