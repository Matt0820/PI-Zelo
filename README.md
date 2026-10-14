# Zelo

Plataforma acadêmica de acompanhamento de pessoas em cuidados paliativos, com um site voltado a acompanhantes e um aplicativo mobile. Os clientes compartilham uma única API e um único banco de dados; nenhum cliente deve manter uma cópia própria dos dados clínicos.

## Estrutura

```text
PI-Zelo/
├── backend/       API FastAPI e configuração única do MySQL
├── frontend/      Site para acompanhantes, feito em HTML, CSS e JavaScript
└── mobile-app/    Aplicativo Expo/React Native
```

O site ainda é um protótipo e não está conectado à API. O app mobile já usa a API compartilhada. A integração web deve consumir a mesma API em `backend/`, sem criar outro banco.

## Backend compartilhado

Requisitos: Python 3.11 ou superior e Docker com Docker Compose.

No PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API fica em `http://localhost:8000`; a documentação interativa está em `http://localhost:8000/docs`. O MySQL compartilhado usa a base `zelo_db`. O phpMyAdmin local fica em `http://localhost:8080`.

Para Linux/macOS, ative o ambiente com `source .venv/bin/activate` e copie a configuração com `cp .env.example .env`.

## Site

Abra `frontend/index.html` no navegador ou use o Live Server do VS Code. O conteúdo e as instruções específicas estão em [frontend/README.md](frontend/README.md).

## Aplicativo mobile

```powershell
cd mobile-app
npm ci
npm start
```

O app lê `EXPO_PUBLIC_API_URL` para escolher o endereço da API. Em dispositivos físicos, configure essa variável com o endereço IP da máquina que executa o backend. Consulte [mobile-app/README.md](mobile-app/README.md) para detalhes.

## Dados e segurança

O banco local é iniciado apenas pelo Docker Compose de `backend/`. Não versionar arquivos `.env`, credenciais ou dados reais de pacientes. Este projeto acadêmico não deve ser usado para decisões clínicas nem para armazenar informações reais de saúde em produção.