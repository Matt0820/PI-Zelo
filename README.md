# Zelo

**Objetivo:** apresentar o projeto, iniciar o ambiente local e encaminhar cada pessoa à documentação técnica específica.

Zelo é uma plataforma de telessaúde e acompanhamento domiciliar em cuidados paliativos oncológicos. O sistema é composto por uma API FastAPI compartilhada e uma aplicação web completa (portal assistencial e área do paciente/cuidador) desenvolvida com React, TypeScript e Vite, totalmente responsiva e acessível para uso em computadores, tablets e smartphones via navegador.

## Stack e pastas principais

- `backend/`: API FastAPI, modelos SQLAlchemy, autenticação JWT, regras de cuidados paliativos e suíte de testes `pytest`.
- `frontend/`: aplicação web completa (Área do Paciente e Portal Assistencial Médico), implementada em `src/` com React, TypeScript, Vite e sistema de acessibilidade multitema.
- `iniciar_zelo.sh` e `iniciar_zelo.bat`: inicializadores locais automáticos para Linux/macOS e Windows.
- O portal web fica em `frontend/src/` e é compilado pelo Vite a partir de `frontend/index.html`.

## Início rápido em quatro passos

1. Tenha Python com suporte a `venv`, Node.js/npm e um terminal.
2. Opcionalmente copie `backend/.env.example` para `backend/.env`. Sem configuração manual, o backend inicializa automaticamente com SQLite local e dados clínicos pré-populados.
3. No Linux/macOS, execute `./iniciar_zelo.sh` na raiz. No Windows, execute `iniciar_zelo.bat`. O script verifica dependências, cria os ambientes virtuais e inicia os serviços da API e da Aplicação Web.
4. Abra a aplicação web em `http://localhost:5173` e a documentação interativa da API em `http://localhost:8000/docs`.

## Documentação

- [Como rodar](docs/COMO-RODAR.md): instalação, variáveis, banco, comandos e problemas comuns.
- [Arquitetura](docs/ARQUITETURA.md): fluxo web → API → banco e responsabilidade das pastas.
- [Backend](docs/BACKEND.md): autenticação, permissões, endpoints, modelos e regras clínicas implementadas.
- [Frontend web](docs/FRONTEND.md): páginas, estado, componentes e estilos.
- [Acessibilidade](docs/ACESSIBILIDADE.md): modos disponíveis e como verificar cada um.
- [Chatbot](docs/CHATBOT.md): árvore ativa, formato dos nós e triagem clínica.
- [Como contribuir](docs/COMO-CONTRIBUIR.md): roteiro para mudanças comuns e revisão.
- [Glossário](docs/GLOSSARIO.md): termos usados no sistema.

## Limites de uso

Consulte a documentação técnica para limites éticos e escopo assistencial da plataforma.
