#!/bin/sh

printf '%s\n' '====================================================================='
printf '%s\n' '                 INICIANDO O SISTEMA ZELO'
printf '%s\n' '            Website React/Vite + API FastAPI'
printf '%s\n' '====================================================================='
printf '\n'

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
BACKEND_PID=
WEB_PID=

stop_services() {
    if [ -n "$WEB_PID" ]; then
        kill "$WEB_PID" 2>/dev/null || true
        wait "$WEB_PID" 2>/dev/null || true
    fi
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
}

trap stop_services EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [ ! -x "$PYTHON" ] || ! "$PYTHON" -m pip --version >/dev/null 2>&1; then
    printf '%s\n' 'Criando ambiente virtual Python...'
    if ! python3 -m venv "$VENV_DIR"; then
        printf '%s\n' 'Erro: não foi possível criar o ambiente virtual.' >&2
        printf '%s\n' 'Instale o pacote de venv do Python e execute novamente.' >&2
        exit 1
    fi
fi

printf '%s\n' 'Verificando e instalando dependências do backend...'
if ! "$PYTHON" -m pip install -r "$BACKEND_DIR/requirements.txt"; then
    printf '%s\n' 'Erro ao instalar as dependências do backend.' >&2
    exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    printf '%s\n' 'Erro: Node.js e npm são necessários para iniciar o website.' >&2
    exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    printf '%s\n' 'Instalando dependências do website React/Vite...'
    if ! (cd "$FRONTEND_DIR" && (npm ci || npm install)); then
        printf '%s\n' 'Erro ao instalar as dependências do website.' >&2
        exit 1
    fi
fi

if "$PYTHON" -c 'import socket, sys; s = socket.socket(); s.settimeout(1); result = s.connect_ex(("127.0.0.1", 8000)); s.close(); sys.exit(0 if result == 0 else 1)'; then
    printf '%s\n' 'Erro: a porta 8000 já está em uso.' >&2
    printf '%s\n' 'Encerre o backend anterior e execute este script novamente.' >&2
    exit 1
fi

if "$PYTHON" -c 'import socket, sys; s = socket.socket(); s.settimeout(1); result = s.connect_ex(("127.0.0.1", 5173)); s.close(); sys.exit(0 if result == 0 else 1)'; then
    printf '%s\n' 'Erro: a porta 5173 já está em uso.' >&2
    printf '%s\n' 'Encerre o servidor Vite anterior e execute este script novamente.' >&2
    exit 1
fi

printf '%s\n' 'Iniciando backend FastAPI em http://0.0.0.0:8000 ...'
(
    cd "$BACKEND_DIR" || exit 1
    exec "$PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!

printf '%s\n' 'Iniciando website React/Vite em http://localhost:5173 ...'
(
    cd "$FRONTEND_DIR" || exit 1
    exec ./node_modules/.bin/vite --host 0.0.0.0
) &
WEB_PID=$!

printf '%s\n' 'Website: http://localhost:5173'
printf '%s\n' 'Pressione Ctrl+C para encerrar os serviços.'
printf '\n'
wait
