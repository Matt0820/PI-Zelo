# Como rodar o Zelo

**Objetivo:** preparar e iniciar os três componentes locais do projeto, sem depender de serviços externos além das instalações de ferramentas descritas aqui.

## Pré-requisitos

- Python com `venv` e `pip`.
- Node.js e npm compatíveis com as versões declaradas em `frontend/package.json` e `mobile-app/package.json`.
- Git para obter o repositório.
- Docker Compose é opcional; só é necessário para usar o MySQL definido em `backend/docker-compose.yml`.

## Inicializador do projeto

Na raiz do repositório:

```sh
./iniciar_zelo.sh
```

No Windows, execute `iniciar_zelo.bat`. Os scripts verificam ou criam o ambiente Python, instalam `backend/requirements.txt`, instalam as dependências npm quando `node_modules` ainda não existe, iniciam FastAPI e Vite e, ao final, iniciam Expo. O script Linux/macOS recusa as portas 8000 e 5173 se já estiverem ocupadas. No Windows, os serviços abrem em janelas separadas.

**Estado de verificação:** os dois inicializadores não foram executados nesta tarefa. Eles podem instalar dependências e criar arquivos locais, portanto valide-os em uma cópia de desenvolvimento antes de depender deles.

## Execução manual

Os comandos abaixo refletem os arquivos e scripts do projeto. A instalação limpa e a inicialização completa não foram testadas nesta tarefa; veja o estado detalhado em [Relatório](RELATORIO-DOCUMENTACAO.md).

### Backend

No terminal do backend:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

No PowerShell, a ativação é `\.venv\Scripts\Activate.ps1`; copie o exemplo com `Copy-Item .env.example .env`. O backend carrega `.env` de `backend/`. Sem `DATABASE_URL`, usa SQLite no arquivo `backend/zelo.db`. A inicialização cria tabelas via SQLAlchemy, aplica uma adaptação pontual de coluna em `users` e chama a rotina de dados iniciais.

Para MySQL local, o compose de desenvolvimento está em `backend/docker-compose.yml`. Configure `DATABASE_URL` no `.env` para apontar ao serviço. Os valores do compose são apenas para desenvolvimento; não os reutilize em ambientes expostos.

### Portal web

Em outro terminal:

```sh
cd frontend
npm ci
npm run dev
```

O Vite serve em `http://localhost:5173` e encaminha `/api` e `/health` para `http://127.0.0.1:8000`. Para criar a build:

```sh
npm run build
```

A build é criada em `frontend/dist`; quando presente, o backend a serve sob `/frontend/` e redireciona a raiz para a página compilada. A variável opcional `VITE_API_URL` substitui a base de API vazia usada pelo cliente web. Para deploy estático na raiz de um domínio (como Vercel), configure `VITE_BASE_PATH=/`; no deploy integrado ao backend, deixe essa variável vazia para manter o prefixo `/frontend/`.

### App Expo

Em outro terminal:

```sh
cd mobile-app
npm ci
npm start
```

O app usa `EXPO_PUBLIC_API_URL` quando definido. Sem ela, `mobile-app/api.ts` usa `10.0.2.2` no Android e `127.0.0.1` nos demais destinos. Para celular físico, informe o IP acessível do computador, por exemplo `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:8000`, ou use o inicializador da raiz, que tenta detectar o endereço local.

## Variáveis de ambiente

Os modelos `.env.example` não contêm credenciais reais. Copie cada um apenas para o arquivo `.env` correspondente, que é ignorado pelo Git.

| Variável | Arquivo/cliente | Função observada |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | URL do banco SQLAlchemy; padrão do código é SQLite local. |
| `APP_NAME` | backend | Título da API e do Swagger. |
| `APP_VERSION` | backend | Versão exibida pela API. |
| `APP_DESCRIPTION` | backend | Descrição do Swagger. |
| `APP_ENV` | backend | Define modo de desenvolvimento ou produção para validação do segredo. |
| `ZELO_AUTH_SECRET` | backend | Segredo HMAC dos tokens; em produção exige ao menos 32 caracteres e rejeita valores fracos/de exemplo. Em desenvolvimento ausente, o código gera um segredo temporário e as sessões deixam de valer após reiniciar. |
| `ZELO_AUTH_TOKEN_TTL_SECONDS` | backend | Duração do token; o padrão do código é 28800 segundos. |
| `ZELO_CORS_ORIGINS` | backend | Lista de origens permitidas separadas por vírgula. |
| `VITE_API_URL` | frontend | Prefixo opcional da URL de API do portal web. Vazio usa mesma origem/proxy do Vite. |
| `EXPO_PUBLIC_API_URL` | Expo | URL da API embutida no bundle do app; não é segredo. |

Variáveis lidas por código foram conferidas em `backend/app/config.py`, `frontend/src/api.ts`, `frontend/vite.config.ts`, `mobile-app/api.ts` e nos inicializadores.

## Testes e qualidade

- Web: `cd frontend && npm run lint`, `npx tsc --noEmit` e `npm run build`.
- Expo: `cd mobile-app && npx tsc --noEmit`; `npx expo install --check` verifica versões conhecidas pelo mapa local do Expo, mas pode depender de rede para consultar a lista oficial.
- Backend: `cd backend && python -m pip install -r requirements-dev.txt && python -m pytest`.

O resultado desta tarefa não substitui uma execução de instalação limpa: `pytest` não estava instalado no `.venv` durante a baseline e, por isso, a suíte não foi executada.

## Endereços locais

- Portal Vite: `http://localhost:5173`
- API: `http://127.0.0.1:8000`
- Swagger/OpenAPI: `http://127.0.0.1:8000/docs` e `/openapi.json`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Saúde: `/health`

## Problemas comuns

- **Porta ocupada:** encerre o processo existente em 8000 ou 5173 antes de usar `iniciar_zelo.sh`.
- **Web não conecta:** confirme que FastAPI está ativo e que o Vite encaminha `/api` para a porta 8000.
- **Celular não alcança a API:** configure `EXPO_PUBLIC_API_URL` com o IP da máquina, use a mesma rede e libere a porta 8000 no firewall.
- **Token inválido depois de reiniciar:** sem `ZELO_AUTH_SECRET` fixo, o segredo de desenvolvimento é temporário e invalida sessões quando o processo reinicia.
- **Erro de banco:** verifique `DATABASE_URL` e se o banco correspondente está disponível. O endpoint `/health` consulta `SELECT 1`.
