#!/bin/sh

printf '%s\n' '====================================================================='
printf '%s\n' '                 INICIANDO O SISTEMA ZELO'
printf '%s\n' '     Cuidados Paliativos Oncológicos - Plataforma Web Integrada'
printf '%s\n' '====================================================================='
printf '\n'
printf '%s\n' 'Iniciando servidor FastAPI e banco de dados...'

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
BACKEND_DIR="$SCRIPT_DIR/backend"
cd "$BACKEND_DIR" || exit 1

VENV_DIR="$BACKEND_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
if [ ! -x "$PYTHON" ] || ! "$PYTHON" -m pip --version >/dev/null 2>&1; then
    printf '%s\n' 'Criando ambiente virtual Python...'
    if ! python3 -m venv "$VENV_DIR"; then
        printf '%s\n' 'Erro: não foi possível criar o ambiente virtual.' >&2
        printf '%s\n' 'Instale o pacote: python3-venv' >&2
        printf '%s\n' 'Depois, execute este script novamente.' >&2
        exit 1
    fi
fi

printf '%s\n' 'Verificando e instalando dependências do backend...'
if ! "$PYTHON" -m pip install -r "$BACKEND_DIR/requirements.txt"; then
    printf '%s\n' 'Erro ao instalar as dependências. Verifique sua conexão e o arquivo requirements.txt.' >&2
    exit 1
fi

if "$PYTHON" -c 'import socket, sys; s = socket.socket(); s.settimeout(1); result = s.connect_ex(("127.0.0.1", 8000)); s.close(); sys.exit(0 if result == 0 else 1)'; then
    printf '%s\n' 'Erro: a porta 8000 já está em uso; não vou abrir uma instância antiga por engano.' >&2
    printf '%s\n' 'Encerre o servidor anterior (Ctrl+C no terminal dele) e execute este script novamente.' >&2
    exit 1
fi

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:8000 >/dev/null 2>&1 &
else
    printf '%s\n' 'Aviso: xdg-open não está instalado; abra http://localhost:8000 no navegador.'
fi

exec "$PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
