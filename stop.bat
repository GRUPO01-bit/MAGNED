@echo off
title MAGNED - Parando Servidor...
color 0C

echo.
echo  ==========================================
echo   MAGNED - Encerrando Servidor Node.js
echo  ==========================================
echo.

echo  Procurando processo na porta 3333...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333"') do (
    echo  Encerrando PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo  Servidor encerrado com sucesso!
echo  ==========================================
echo.
timeout /t 2 /nobreak >nul
