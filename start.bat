@echo off
title MAGNED - Iniciando...
color 0A

echo.
echo  ==========================================
echo   MAGNED - Iniciando Servidor e Aplicacao
echo  ==========================================
echo.

:: Mata qualquer instancia anterior do Node na porta 3333
echo  [1/3] Parando instancias anteriores...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333"') do taskkill /f /pid %%a >nul 2>&1

:: Inicia o servidor Node em background
echo  [2/3] Iniciando servidor Node.js na porta 3333...
cd /d "%~dp0backend_scraper"
start "" /B cmd /c "node server.js > ..\server.log 2>&1"

:: Aguarda o servidor subir
echo  [3/3] Aguardando servidor iniciar (3 segundos)...
timeout /t 3 /nobreak >nul

:: Abre o index.html no navegador padrao
echo.
echo  Abrindo MAGNED no navegador...
start "" "%~dp0Aplicacao\index.html"

echo.
echo  ==========================================
echo   MAGNED rodando! Porta 3333 ativa.
echo   Para parar, execute stop.bat
echo  ==========================================
echo.
