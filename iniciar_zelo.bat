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

echo Verificando dependencias da API...
"%PYTHON%" -c "import uvicorn, fastapi, sqlalchemy, pydantic, email_validator, pytest, httpx" >nul 2>nul
if errorlevel 1 (
  echo Instalando ou atualizando dependencias da API...
  "%PYTHON%" -m pip install --disable-pip-version-check -r "%BACKEND%\requirements.txt"
  if errorlevel 1 (echo Erro nas dependencias da API.& pause& exit /b 1)
)

if not exist "%FRONTEND%\node_modules" (
  echo Instalando dependencias do website...
  pushd "%FRONTEND%"
  call npm install
  if errorlevel 1 (popd& echo Erro nas dependencias do website.& pause& exit /b 1)
  popd
)

if not exist "%MOBILE%\node_modules" (
  echo Instalando dependencias do aplicativo Expo...
  pushd "%MOBILE%"
  call npm install
  if errorlevel 1 (popd& echo Erro nas dependencias do Expo.& pause& exit /b 1)
  popd
)

:: Deteccao de IP local via Python (evita falhas de escape de PowerShell)
set "LAN_IP="
pushd "%BACKEND%"
.\.venv\Scripts\python.exe -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); open(r'..\.lan_ip.tmp','w').write(s.getsockname()[0]); s.close()" 2>nul
popd
if exist "%ROOT%.lan_ip.tmp" (
  set /p LAN_IP=<"%ROOT%.lan_ip.tmp"
  del "%ROOT%.lan_ip.tmp" >nul 2>nul
)
if not defined LAN_IP set "LAN_IP=127.0.0.1"
set "EXPO_PUBLIC_API_URL=http://%LAN_IP%:8000"

:: Verificacao preventiva de portas ocupadas
"%PYTHON%" -c "import socket, sys; s=socket.socket(); res=s.connect_ex(('127.0.0.1', 8000)); s.close(); sys.exit(0 if res==0 else 1)" >nul 2>nul
if not errorlevel 1 (
  echo [AVISO] A porta 8000 ja esta em uso. Se houver outra instancia da API rodando, encerre-a.
)

"%PYTHON%" -c "import socket, sys; s=socket.socket(); res=s.connect_ex(('127.0.0.1', 5173)); s.close(); sys.exit(0 if res==0 else 1)" >nul 2>nul
if not errorlevel 1 (
  echo [AVISO] A porta 5173 ja esta em uso. Se houver outra instancia do Frontend rodando, encerre-a.
)

echo.
echo =====================================================================
echo API para dispositivos Expo: %EXPO_PUBLIC_API_URL%
echo Website Zelo:               http://localhost:5173
echo Documentacao da API:        http://localhost:8000/docs
echo =====================================================================
echo.

echo Iniciando API Zelo (FastAPI / Uvicorn)...
start "API Zelo" /d "%BACKEND%" cmd /k ""%PYTHON%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo Iniciando Website Zelo (React / Vite)...
start "Website Zelo" /d "%FRONTEND%" cmd /k "npm run dev"

echo Iniciando Aplicativo Mobile (Expo)...
start "Aplicativo Expo Zelo" /d "%MOBILE%" cmd /k "set EXPO_PUBLIC_API_URL=%EXPO_PUBLIC_API_URL%&& npm start"

timeout /t 3 /nobreak >nul
start "" http://localhost:5173

echo Servicos iniciados com sucesso!
echo Feche as janelas "API Zelo", "Website Zelo" e "Aplicativo Expo Zelo" para encerrar.
echo.
pause
