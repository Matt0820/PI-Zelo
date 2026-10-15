# Backend compartilhado Zelo

Este módulo é a camada central do projeto. Ele expõe a API REST em FastAPI, conecta-se ao banco MySQL e serve de fonte única de dados para o protótipo web e para o aplicativo mobile.

## Objetivo

O backend centraliza as operações relacionadas a:

- usuários
- sintomas
- medicamentos
- orientações
- autenticação simples de acesso

A arquitetura foi pensada para evitar duplicação de dados e garantir que todos os clientes consultem a mesma base de informações.

## Estrutura da pasta

```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── README.md
└── .venv/   # gerado localmente
```

### Descrição dos módulos

- `app/main.py`: endpoints da API e configuração do FastAPI
- `app/models.py`: modelos SQLAlchemy para usuários, sintomas, medicações e orientações
- `app/schemas.py`: validações de entrada e saída dos dados
- `app/database.py`: conexão com o banco e criação da sessão
- `app/config.py`: leitura de variáveis de ambiente

## Tecnologias

- Python 3.11+
- FastAPI
- SQLAlchemy
- PyMySQL
- MySQL 8
- Docker Compose

## Requisitos

- Python instalado
- Docker instalado e em execução
- acesso ao port 8000 e 3306 em localhost

## Preparação do ambiente

A partir da pasta `backend`, execute:

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
```

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
docker compose up -d
```

## Inicialização da API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endereços locais

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- MySQL: localhost:3306
- phpMyAdmin: http://localhost:8080

## Banco de dados

A base de desenvolvimento é `zelo_db`. O arquivo `docker-compose.yml` inicializa:

- container MySQL com usuário `zelo_user`
- container phpMyAdmin para inspeção visual do banco

Os valores padrões de conexão são:

```text
mysql+pymysql://zelo_user:Zelo123!@localhost:3306/zelo_db?charset=utf8mb4
```

## Variáveis de ambiente

O arquivo `.env` deve conter as configurações locais usadas pela aplicação. O exemplo base está em `.env.example`.

Exemplo:

```env
DATABASE_URL=mysql+pymysql://zelo_user:Zelo123!@localhost:3306/zelo_db?charset=utf8mb4
APP_NAME=Zelo API
APP_VERSION=1.0.0
APP_DESCRIPTION=Backend do app Zelo para cuidado e acompanhamento.
```

> Nunca versionar arquivos `.env` com credenciais reais ou dados sensíveis.

## Principais rotas da API

### Saúde da aplicação

- GET /health

### Usuários

- POST /api/users
- GET /api/users
- GET /api/users/{user_id}
- POST /api/auth/login

### Sintomas

- POST /api/users/{user_id}/symptoms
- GET /api/users/{user_id}/symptoms

### Medicamentos

- POST /api/users/{user_id}/medications
- GET /api/users/{user_id}/medications

### Orientações

- POST /api/users/{user_id}/orientations
- GET /api/users/{user_id}/orientations

## Fluxo de dados

```text
Cliente (web/mobile)
       |
       v
   Requisição HTTP
       |
       v
   FastAPI
       |
       v
 SQLAlchemy + MySQL
```

A API valida a entrada, realiza a operação no banco e devolve os dados em formato JSON. Isso mantém todas as operações centralizadas e reduz inconsistências entre clientes.

## Observações importantes

- o backend é o único serviço responsável pela persistência
- o protótipo web não deve inserir uma cópia separada do banco
- o app mobile deve consumir a mesma API do backend
- não use esta configuração em produção com dados reais de pacientes sem adequação de segurança e conformidade

## Desenvolvimento recomendado

- sempre validar a API pelo Swagger antes de integrar novas telas
- manter o `.env` fora do controle de versão
- documentar qualquer nova rota ou mudança de schema
- manter a estrutura de modelos e endpoints consistentes com o restante do projeto

