# Pendências técnicas

**Objetivo:** registrar riscos e pontos que precisam de decisão ou validação. Nenhum item abaixo foi corrigido nesta tarefa.

## Alta

- **Divergência do papel `medico` — `[VERIFICAR]`**: `frontend/src/App.tsx:72` renderiza portal de equipe para `medico`; `backend/app/security.py:98` considera equipe apenas `admin` e `assistencial`. Confirmar papéis oficiais e alinhar UI e API em mudança funcional separada. Pode bloquear o acesso do perfil médico a listas/alertas.
- **Credenciais de desenvolvimento no compose — `[VERIFICAR]`**: `backend/docker-compose.yml` declara valores de autenticação do MySQL no próprio arquivo e publica portas ao host. Revisar proteção de ambiente e mecanismo de segredos antes de uso fora da máquina local. Valores não foram copiados para esta documentação.

## Média

- **Token web em `localStorage`**: `frontend/src/api.ts` guarda token Bearer no armazenamento acessível a JavaScript. Avaliar mitigação de XSS/CSP e estratégia de sessão adequada a dados de saúde antes de produção.
- **Migração de schema manual**: `backend/app/main.py:68-78` cria tabelas e aplica uma alteração pontual de coluna durante o startup. Sem migrações versionadas, mudanças futuras podem divergir entre bancos existentes.
- **Chatbot web duplicado**: `frontend/src/features/chatbot/` é o fluxo importado pela área do paciente; `frontend/src/chatbot/` mantém uma segunda árvore/máquina e `ChatbotZeloScreen.tsx`, sem referência de uso na navegação atual. Decidir se arquiva, remove ou integra em tarefa própria; código não foi apagado.
- **Exceção do banco devolvida ao cliente**: `backend/app/main.py:84-90` inclui o texto da exceção de conexão no detalhe HTTP 503. Avaliar se respostas de produção devem ocultar detalhes internos.
- **Suíte de testes indisponível na baseline**: há testes em `backend/tests/` e `pytest` em `requirements-dev.txt`, mas o módulo não estava instalado no `.venv`; não foi possível executar os testes da baseline sem instalar ferramenta.

## Baixa

- **Captura de telas antiga**: `capture_system_screenshots.py` ainda aponta para páginas estáticas removidas. Atualizar o utilitário para capturar as telas da SPA ou removê-lo em uma tarefa própria.
- **Alegações dos documentos acadêmicos — `[VERIFICAR]`**: DOCX relata validação clínica/IVC, auditoria WCAG, HTTPS/TLS, pseudonimização e pontuação SUS. Esses resultados não podem ser provados pelo código consultado; solicitar fonte/relatório de auditoria e revisão clínica antes de divulgá-los como propriedade do produto.
- **Inicializadores sem validação nesta tarefa**: `iniciar_zelo.sh` e `.bat` instalam dependências e iniciam vários serviços. Testar em ambiente limpo de cada sistema operacional e revisar mensagens/encerramento de processos.

## Varredura de marcadores

A busca por `TODO`, `FIXME`, `XXX` e `HACK` em `backend/`, `frontend/src/`, `mobile-app/` e inicializadores não encontrou marcadores existentes na data desta revisão. Os itens acima são achados desta leitura; não alteram comportamento.
