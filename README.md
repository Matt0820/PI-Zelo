# Zelo

**Objetivo:** apresentar o projeto, iniciar o ambiente local e encaminhar cada pessoa à documentação técnica específica.

Zelo é um protótipo para acompanhamento domiciliar em cuidados paliativos. O repositório contém uma API FastAPI compartilhada, um portal web React/Vite e um aplicativo Expo/React Native. O conteúdo clínico e os registros persistidos ficam no backend; cada cliente consome a mesma API.

## Stack e pastas principais

- `backend/`: API FastAPI, modelos SQLAlchemy, autenticação e testes.
- `frontend/`: portal web para paciente/cuidador e equipe, implementado em `src/` com React, TypeScript e Vite.
- `mobile-app/`: cliente Expo/React Native para paciente e cuidador.
- `iniciar_zelo.sh` e `iniciar_zelo.bat`: inicializadores locais para Linux/macOS e Windows.
- `frontend/pages/`, `frontend/paciente/`, `frontend/assistencial/`, `frontend/styles/` e `frontend/scripts/`: telas e assets HTML legados; a build Vite parte de `frontend/index.html` e usa a SPA em `frontend/src/`.

## Início rápido em cinco passos

1. Tenha Python com suporte a `venv`, Node.js/npm e um terminal. Docker só é necessário se optar pelo MySQL de `backend/docker-compose.yml`.
2. Opcionalmente copie `backend/.env.example` para `backend/.env` e ajuste as variáveis descritas em [Como rodar](docs/COMO-RODAR.md). Sem configuração, o backend usa SQLite local.
3. No Linux/macOS, execute `./iniciar_zelo.sh` na raiz. No Windows, execute `iniciar_zelo.bat`. O script verifica dependências ausentes, inicia a API, o site e o Expo; a primeira execução pode instalar pacotes.
4. Abra o site em `http://localhost:5173` e a documentação da API em `http://localhost:8000/docs`.
5. Para testar no celular, use o Expo Go, mantenha celular e computador na mesma rede e permita a porta 8000 no firewall. Consulte [Como rodar](docs/COMO-RODAR.md) se usar emulador ou iniciar os serviços separadamente.

> **Verificação desta documentação:** os inicializadores e a instalação em clone limpo não foram executados nesta tarefa. Confira [Relatório de documentação](docs/RELATORIO-DOCUMENTACAO.md) para os comandos de verificação que foram executados e os limites encontrados.

## Documentação

- [Como rodar](docs/COMO-RODAR.md): instalação, variáveis, banco, comandos e problemas comuns.
- [Arquitetura](docs/ARQUITETURA.md): fluxo browser/app → API → banco e responsabilidade das pastas.
- [Backend](docs/BACKEND.md): autenticação, permissões, endpoints, modelos e regras clínicas implementadas.
- [Frontend web](docs/FRONTEND.md): páginas, estado, componentes, estilos e pontos legados.
- [Acessibilidade](docs/ACESSIBILIDADE.md): modos disponíveis e como verificar cada um.
- [Chatbot](docs/CHATBOT.md): árvore ativa, formato dos nós e fluxo mobile.
- [Como contribuir](docs/COMO-CONTRIBUIR.md): roteiro para mudanças comuns e revisão.
- [Glossário](docs/GLOSSARIO.md): termos usados no sistema.
- [Pendências](docs/PENDENCIAS.md): riscos, dívidas e pontos que precisam de validação.
- [Propostas de melhoria](docs/PROPOSTAS-DE-MELHORIA.md): sugestões que exigiriam mudança de código.
- [Relatório desta tarefa](docs/RELATORIO-DOCUMENTACAO.md): baseline, escopo e resultado das verificações.

## Limites de uso

Este repositório não deve ser tratado como sistema clínico de produção sem uma avaliação de segurança, privacidade, conteúdo clínico, infraestrutura e operação. O artigo e o catálogo de telas incluem requisitos e alegações de validação que não são comprovados apenas pela leitura do código. O estado observado da implementação está descrito nos documentos técnicos e as lacunas estão em [Pendências](docs/PENDENCIAS.md).
