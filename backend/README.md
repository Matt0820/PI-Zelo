# Backend compartilhado Zelo

API REST em Python/FastAPI e banco MySQL centralizados para os clientes web e mobile. Este é o único serviço de persistência do repositório; os clientes acessam os dados pela API, sem conexões diretas ao banco.

## Componentes

- `app/`: rotas da API, modelos, esquemas e conexão com o banco.
- `docker-compose.yml`: MySQL e phpMyAdmin para desenvolvimento local.
- `requirements.txt`: dependências Python.
- `.env.example`: modelo de configuração local.

## Executar localmente

Requisitos: Python 3.11 ou superior e Docker com Docker Compose.

No PowerShell, a partir desta pasta:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

No Linux/macOS, ative o ambiente com `source .venv/bin/activate` e copie a configuração com `cp .env.example .env`.

## Endereços locais

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- MySQL: `localhost:3306`, banco `zelo_db`
- phpMyAdmin: `http://localhost:8080`

O arquivo `.env` contém configuração local e não deve ser versionado. Os dados e credenciais padrão do Compose são somente para desenvolvimento; não use esta configuração com dados reais de saúde ou em produção.
