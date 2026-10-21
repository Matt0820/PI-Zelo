@echo off
title Sistema Zelo - Servidor e Banco de Dados
echo =====================================================================
echo                  INICIANDO O SISTEMA ZELO
echo      Cuidados Paliativos Oncologicos - Plataforma Web Integrada
echo =====================================================================
echo.
echo Iniciando servidor FastAPI e Banco de Dados SQLite...
cd /d "%~dp0backend"
start http://localhost:8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
