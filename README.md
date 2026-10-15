# Zelo

O Zelo é um projeto acadêmico para acompanhar pacientes em cuidados paliativos, centralizando informações de sintomas, medicamentos e orientações em uma única plataforma compartilhada entre web e mobile.

A ideia principal é reduzir a fragmentação de dados e permitir que diferentes clientes acessem a mesma fonte de verdade, em vez de manter cópias locais do banco de dados.

## Visão geral

Este repositório contém três partes principais:

- Backend compartilhado em Python com FastAPI
- Prototipo web em HTML, CSS e JavaScript
- Aplicativo mobile em Expo + React Native

O backend atua como a camada de dados e regras de negócio. O protótipo web e o app mobile consultam o mesmo serviço, usando a mesma API e o mesmo banco MySQL.

> Importante: o site ainda é um protótipo e não está integrado ao backend. O aplicativo mobile já comunica com a API compartilhada.

## Problema que o projeto resolve

Em cenários de acompanhamento clínico domiciliar, muitas informações ficam espalhadas em planilhas, ligações e registros manuais. O Zelo busca organizar esses dados em uma experiência digital mais simples, acessível e centralizada, especialmente para pacientes, acompanhantes e profissionais de saúde.

## Objetivos

- registrar sintomas com frequencia e gravidade
- acompanhar medicamentos e horários
- disponibilizar orientações de cuidado
- facilitar a visualização de informações relevantes
- manter os dados em um único backend compartilhado
- reduzir duplicação de informações entre clientes

## Arquitetura do projeto

```text
Usuário / acompanhante / paciente
            |
            v
   frontend (protótipo web)
   mobile-app (Expo / React Native)
            |
            v
       API FastAPI
            |
            v
      Banco MySQL
```

### Componentes

- backend/: API principal, modelos SQLAlchemy, schemas e configuração do banco
- frontend/: protótipo web para acompanhantes e usuários
- mobile-app/: aplicativo mobile para uso em paciente/cuidador

## Estrutura do repositório

```text
PI-Zelo/
├── backend/
│   ├── app/
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── index.html
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   ├── images/
│   └── README.md
├── mobile-app/
│   ├── App.tsx
│   ├── pages/
│   ├── api.ts
│   ├── types.ts
│   ├── package.json
│   └── README.md
├── README.md
└── .gitignore
```

## Requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- Python 3.11 ou superior
- Docker e Docker Compose
- Node.js e npm
- Expo Go ou emulador Android/iOS
- Git

## Como o sistema funciona

### 1. Backend compartilhado

O backend é responsável por:

- autenticar usuários
- armazenar registros de sintomas, medicamentos e orientações
- expor endpoints REST para web e mobile
- manter a persistência centralizada em MySQL

### 2. Frontend web

O frontend é um protótipo navegável em HTML, CSS e JavaScript. Ele representa fluxos de uso e dinâmicas da interface, especialmente para acompanhantes. Ainda não está completamente integrado à API, mas deve seguir o mesmo modelo de dados e arquitetura do backend.

### 3. Mobile app

O aplicativo usa a API compartilhada e é o cliente que já está conectado ao backend. Ele permite interações com os dados do usuário e consulta endpoints como sintomas, medicações e orientações.

## Execução rápida

### Backend

No Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

No Linux/macOS:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Após a inicialização:

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- phpMyAdmin: http://localhost:8080
- MySQL: localhost:3306, banco: zelo_db

### Frontend web

Basta abrir o arquivo abaixo no navegador ou usar o Live Server do VS Code:

```bash
frontend/index.html
```

Detalhes específicos do protótipo estão em [frontend/README.md](frontend/README.md).

### Aplicativo mobile

```powershell
cd mobile-app
npm ci
npm start
```

O app usa a variável de ambiente `EXPO_PUBLIC_API_URL` para apontar para a API. Em emuladores Android, normalmente o valor padrão é `http://10.0.2.2:8000`.

Para detalhes completos, consulte [mobile-app/README.md](mobile-app/README.md).

## Variáveis de ambiente

O backend usa um arquivo `.env`, baseado em [backend/.env.example](backend/.env.example). Esse arquivo guarda as configurações locais do ambiente e não deve ser versionado.

Principais valores:

- DATABASE_URL: string de conexão com MySQL
- APP_NAME: nome da aplicação
- APP_VERSION: versão atual
- APP_DESCRIPTION: descrição da API

## Endpoints principais da API

A API expõe rotas relacionadas a usuários, sintomas, medicações e orientações. Alguns exemplos:

- GET /health
- POST /api/users
- POST /api/auth/login
- GET /api/users/{user_id}
- POST /api/users/{user_id}/symptoms
- GET /api/users/{user_id}/symptoms
- POST /api/users/{user_id}/medications
- GET /api/users/{user_id}/medications
- POST /api/users/{user_id}/orientations
- GET /api/users/{user_id}/orientations

A documentação interativa Swagger pode ser acessada em `/docs` após subir a API.

## Dados e segurança

- O banco local é criado e mantido pelo Docker Compose do backend
- Não versionar arquivos `.env`, credenciais ou dados reais de pacientes
- Não usar este projeto em produção com informações reais de saúde sem revisão clínica e adequação de segurança
- Este repositório foi concebido como um projeto acadêmico e não substitui decisões médicas

## Boas práticas para desenvolvimento

- mantenha o backend como fonte única de dados
- evite criar bancos separados para web ou mobile
- teste a API com o Swagger antes de integrar novas telas
- use variáveis de ambiente para configuração local
- documente qualquer novo endpoint ou mudança no comportamento do sistema

## Roadmap e status

- backend compartilhado implementado
- API REST com FastAPI funcionando
- MySQL e phpMyAdmin configurados para desenvolvimento
- aplicativo mobile conectado à API
- protótipo web em desenvolvimento
- integração completa do site com a API pendente

## Conclusão

O Zelo foi organizado para funcionar como um ecossistema de três camadas: interface web, app mobile e backend compartilhado. Essa abordagem ajuda a manter consistência dos dados e simplifica a evolução do projeto ao conectar todos os clientes à mesma fonte de verdade.

Para detalhes de cada módulo, consulte:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
- [mobile-app/README.md](mobile-app/README.md)


