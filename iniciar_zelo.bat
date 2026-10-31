@echo off
title Sistema Zelo - Website, API e aplicativo
set ROOT=%~dp0

echo =====================================================================
echo          INICIANDO WEBSITE ZELO, API E APLICATIVO EXPO
echo =====================================================================
echo.

if not exist "%ROOT%frontend\node_modules" (
  echo Instalando dependencias do website React/Vite...
  pushd "%ROOT%frontend"
  call npm ci
  if errorlevel 1 exit /b 1
  popd
)

start "Website Zelo" cmd /k "cd /d "%ROOT%frontend" && npm run dev"
timeout /t 2 /nobreak >nul
start "" http://localhost:5173

echo Iniciando API FastAPI em http://localhost:8000 ...
pushd "%ROOT%backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
popd
pause
