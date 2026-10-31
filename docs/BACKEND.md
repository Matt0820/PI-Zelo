# Backend FastAPI

**Objetivo:** descrever os pontos de entrada, autenticação, autorização, endpoints, modelos e regras clínicas que o código executa hoje.

## Inicialização e módulos

- `app/main.py`: configura FastAPI, CORS, routers, dependência global `get_current_user`, inicialização do banco e entrega da build web.
- `app/config.py`: lê configurações do ambiente e valida/genera o segredo de autenticação conforme `APP_ENV`.
- `app/database.py`: engine SQLAlchemy e sessão por requisição.
- `app/models.py`: entidades ORM.
- `app/schemas.py`: contratos Pydantic.
- `app/security.py`: senha, token HMAC e regras de acesso.
- `app/routers/auth.py`: cadastro e login.
- `app/routers/users.py`: seed, listagem e consulta de usuário.
- `app/routers/clinical.py`: ESAS, triagem, alertas, evoluções, mapa de dor e sintomas legados.
- `app/routers/medications.py`: medicações, confirmação de dose, resgate e orientações.

A API documenta os schemas completos em Swagger (`/docs`) e OpenAPI (`/openapi.json`).

## Autenticação e papéis

O cadastro público aceita apenas o perfil `paciente`. O login aceita email, prontuário ou CPF como identificador, verifica a conta ativa e retorna um token Bearer assinado com HMAC-SHA256. O token próprio do projeto inclui `sub`, papel e expiração; não é uma sessão OAuth externa. Senhas novas usam PBKDF2-HMAC-SHA256; senhas legadas em SHA-256 são migradas após um login válido.

`get_current_user` permite cadastro/login e requisições `OPTIONS` sem autenticação. Para demais rotas `/api/`, exige token e valida usuário ativo. `admin` e `assistencial` são tratados como equipe pelo guard atual: podem consultar usuários e alertas; `admin` pode acionar `/api/seed`. Usuários não pertencentes à equipe só acessam o próprio `user_id`. Escritas em evolução, medicação, orientação e dose de resgate têm regras adicionais, com exceções para registro de dose de resgate e confirmação/desfazer de medicação do próprio paciente.

> A interface web também trata o papel `medico` como equipe, mas o guard atual não o inclui em `is_team`. Essa divergência está registrada em [Pendências](PENDENCIAS.md); não foi corrigida nesta tarefa.

## Endpoints principais

| Método e caminho | Uso | Acesso observado |
|---|---|---|
| `GET /health` | Consulta `SELECT 1` e informa estado/tipo do banco. | Público. |
| `GET /api` | Retorna identificação/links da API. | O código não exige sessão fora de rotas `/api/` com prefixo; `/api` sem barra não entra no guard. |
| `POST /api/users` | Cadastro público de paciente; retorna usuário e token. | Público; rejeita perfil diferente de `paciente`. |
| `POST /api/auth/login`, `POST /api/login` | Login e emissão de token. | Público. |
| `POST /api/seed` | Popula/verifica dados iniciais. | Apenas `admin`. |
| `GET /api/users?perfil=...` | Lista usuários com filtro opcional por perfil. | Equipe segundo `security.py`. |
| `GET /api/users/{user_id}` | Consulta usuário. | Equipe ou o próprio usuário. |
| `POST/GET /api/users/{user_id}/esas` | Salva avaliação e lista histórico. | Sessão; paciente limitado ao próprio ID. |
| `POST/GET /api/users/{user_id}/triagem-dor` | Salva triagem e lista histórico. | Sessão; paciente limitado ao próprio ID. |
| `GET /api/alertas`, `PATCH /api/alertas/{alerta_id}` | Lista/atualiza estado de alertas. | Equipe. |
| `POST/GET /api/users/{user_id}/evolucoes` | Cria/lista evolução clínica. | Consulta segue o escopo do usuário; gravação restrita à equipe. |
| `POST/GET /api/users/{user_id}/locais-dor` | Salva/lista mapa corporal. | Sessão; paciente limitado ao próprio ID. |
| `POST/GET /api/users/{user_id}/symptoms` | Sintoma genérico legado. | Sessão; paciente limitado ao próprio ID. |
| `POST/GET /api/users/{user_id}/medications` | Cria/lista prescrição. | Criação restrita à equipe; listagem respeita o `user_id`. |
| `POST /api/users/{user_id}/medications/{med_id}/confirm` | Confirma que tomou. | Paciente pode confirmar o próprio registro; equipe também pode atuar. |
| `POST /api/users/{user_id}/medications/{med_id}/undo-confirmation` | Desfaz confirmação. | Paciente pode desfazer no próprio registro; equipe também pode atuar. |
| `PATCH /api/users/{user_id}/medications/{med_id}` | Atualiza prescrição. | Escrita restrita à equipe. |
| `POST/GET /api/users/{user_id}/orientations` | Cria/lista orientação. | Criação restrita à equipe; leitura segue o escopo do usuário. |
| `POST /api/users/{user_id}/rescue-doses` | Registra uma dose de resgate já tomada, sem criar prescrição. | Paciente pode registrar para si; valida nome não vazio. |

A lista é um resumo dos decorators de `app/main.py` e `app/routers/`; confira os payloads e status atuais no Swagger.

## Regras clínicas implementadas

- ESAS aceita nove escores centrais entre 0 e 10 (`dor`, `cansaco`, `nausea`, `depressao`, `ansiedade`, `sonolencia`, `apetite`, `mal_estar`, `falta_de_ar`) e um campo opcional `constipacao` também limitado a 0–10.
- `gravidade_maxima` usa o maior dos nove escores centrais: `0–3` leve, `4–6` moderada, `7–10` grave.
- A triagem de dor é acionada por `dor >= 7`, não por qualquer sintoma grave. Esse registro ESAS cria um alerta `dor_grave` em estado `Novo`.
- Payload de triagem valida intensidade da dor entre 7 e 10, calcula `tipo_dor` como crônica quando `mais_de_duas_semanas` for verdadeiro e cria alerta `triagem_dor_concluida` em estado `Novo`.
- O backend persiste respostas e estados; não executa prescrição nem substitui avaliação profissional.

Os valores 7, 4 e 0–10 vêm dos limites definidos em `schemas.py` e do cálculo em `routers/clinical.py`. O artigo e o catálogo DOCX trazem afirmações adicionais sobre validação clínica; essas afirmações não são tratadas como comportamento comprovado pela API.

## Dados e persistência

`models.py` define `User`, `Symptom`, `ESASAssessment`, `PainTriageSession`, `ClinicalAlert`, `Medication`, `ClinicalNote`, `PainMapEntry` e `Orientation`. Relações clínicas pertencem a `User` e usam `user_id`. A URL de conexão vem de `DATABASE_URL`; o padrão do código é SQLite em `backend/zelo.db`, e o compose oferece MySQL para desenvolvimento.

Na inicialização, o app chama `Base.metadata.create_all`, verifica e adiciona uma coluna específica em `users` quando ausente e executa `seed_initial_data`. Não foi encontrada ferramenta de migração como Alembic no código inventariado.

## Segurança e limites

O ambiente de produção requer `ZELO_AUTH_SECRET` forte. O token é enviado pelo cliente como Bearer; o portal web armazena sessão/token em `localStorage`. CORS usa origens configuradas e não habilita credenciais de cookie. O ambiente local e o compose não configuram HTTPS. Leia [Pendências](PENDENCIAS.md) antes de expor a API ou usar dados reais.
