@echo off
setlocal
title Inicializador Zelo
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "MOBILE=%ROOT%mobile-app"
set "PYTHON=%BACKEND%\.venv\Scripts\python.exe"

echo =====================================================================
echo          INICIANDO WEBSITE ZELO, API E APLICATIVO EXPO
echo =====================================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo Erro: instale Python 3 e adicione-o ao PATH.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo Erro: instale Node.js LTS, que inclui npm, e adicione-o ao PATH.
  pause
  exit /b 1
)

if not exist "%PYTHON%" (
  echo Criando ambiente virtual do backend...
  python -m venv "%BACKEND%\.venv"
  if errorlevel 1 (echo Erro ao criar ambiente Python.& pause& exit /b 1)
)
echo Instalando ou atualizando dependencias da API...
"%PYTHON%" -m pip install -r "%BACKEND%\requirements.txt"
if errorlevel 1 (echo Erro nas dependencias da API.& pause& exit /b 1)

if not exist "%FRONTEND%\node_modules" (
  echo Instalando dependencias do website...
  pushd "%FRONTEND%"
  call npm ci
  if errorlevel 1 (popd& echo Erro nas dependencias do website.& pause& exit /b 1)
  popd
)
if not exist "%MOBILE%\node_modules" (
  echo Instalando dependencias do aplicativo Expo...
  pushd "%MOBILE%"
  call npm ci
  if errorlevel 1 (popd& echo Erro nas dependencias do Expo.& pause& exit /b 1)
  popd
)

set "LAN_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$a=Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue ^| Where-Object {$_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet'} ^| Sort-Object InterfaceMetric ^| Select-Object -First 1; if($a){$a.IPAddress}"`) do set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=127.0.0.1"
set "EXPO_PUBLIC_API_URL=http://%LAN_IP%:8000"

echo API para dispositivos Expo: %EXPO_PUBLIC_API_URL%
start "API Zelo" cmd /k "cd /d ""%BACKEND%"" && ""%PYTHON%"" -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
start "Website Zelo" cmd /k "cd /d ""%FRONTEND%"" && npm run dev"
start "Aplicativo Expo Zelo" cmd /k "cd /d ""%MOBILE%"" && set ""EXPO_PUBLIC_API_URL=%EXPO_PUBLIC_API_URL%"" && npm start"
timeout /t 3 /nobreak >nul
start "" http://localhost:5173
echo Website: http://localhost:5173
echo API:     http://localhost:8000/docs
echo.
echo Feche as janelas "API Zelo", "Website Zelo" e "Aplicativo Expo Zelo" para encerrar os servicos.
pause
