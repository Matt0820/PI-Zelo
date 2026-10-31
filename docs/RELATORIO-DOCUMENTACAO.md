# Relatório de documentação e comentários

**Objetivo:** registrar baseline, decisões documentais, verificações e limitações da tarefa de documentação do Zelo.

## Estado inicial e branch

- Branch base: `feature/zelo-melhorias-2026-10`.
- A árvore estava limpa antes da tarefa.
- Branch de trabalho: `docs/documentacao-e-comentarios`, criada a partir da base limpa.
- Nenhum arquivo `.env` local foi encontrado pelo inventário de nomes. O único modelo existente era `backend/.env.example`; o conteúdo de `.env` não foi aberto. O banco local `backend/zelo.db` não foi lido.
- `pandoc` não está instalado. DOCX foi extraído por leitura XML local da estrutura OpenXML, sem instalar ferramenta.

## Baseline executada

| Verificação | Resultado |
|---|---|
| Árvore Git | Limpa antes da branch. |
| `npm ls --depth=0` em `frontend/` | Passou; dependências existentes resolvidas. Não executou instalação. |
| `npm run lint` em frontend, cópia temporária do commit | Passou; script executa `tsc --noEmit`. |
| `npx tsc --noEmit` em frontend, cópia temporária | Passou. |
| `npm run build` em cópia temporária | Passou com Vite; assets JS/CSS de baseline anotados fora do repositório para comparação. |
| `pip check` no `.venv` backend | Passou, sem dependências quebradas. |
| `pytest` | Não executado: `pytest` não estava instalado no `.venv` nem no Python global. Não foram instaladas dependências na baseline. |
| `npx tsc --noEmit` em `mobile-app/` | Passou. |
| `npx expo install --check` | Reportou dependências atualizadas usando mapa local; avisou que a consulta online estava indisponível e a validação é limitada sem rede. |
| Instalação limpa (`npm ci`/`pip install`) | Não executada: o inventário já tinha dependências locais e a baseline foi mantida sem instalação/modificação de ambiente do projeto. |

A build frontend da baseline gerou SHA-256 `543052294cbf3d2bf2986a4f7e0d7275397529a67fd5fd9a53b36ee965c6903e` para JavaScript e `91c58b3f34fe6bf1942841556a8dfc83f08c62552cb442565d0b065074251dba` para CSS. Impressões AST dos 21 módulos Python estão em artefato temporário durante a tarefa e serão comparadas antes da entrega.

## Inventário técnico resumido

- API FastAPI com SQLAlchemy; SQLite é padrão no código e MySQL está disponível pelo compose.
- Portal web React 19, TypeScript e Vite, com SPA e navegação por estado.
- App Expo/React Native independente, compartilhando API e modelos lógicos.
- Autenticação própria com token HMAC, dependência global, regras por papel/ID; detalhes em [Backend](BACKEND.md).
- Registros clínicos principais: ESAS, triagem, alertas, mapa corporal, medicações, orientações e evoluções.
- Modos web/mobile e fluxos de chatbot estão descritos em seus guias. A implementação do chatbot do Expo é separada da árvore ativa do web.

## Arquivos documentados

Esta lista será completada após a fase de comentários e conferência final:

- Documentação nova em `docs/` e modelos de ambiente em backend/frontend/mobile.
- Comentários/docstrings somente; arquivos alterados serão listados após conferência final.

## Pontos `[VERIFICAR]` e pendências

Consulte [Pendências](PENDENCIAS.md). Prioridades principais: divergência de perfil `medico`, credenciais de desenvolvimento no compose, token web em `localStorage` e alegações clínicas/normativas dos DOCX sem auditoria associada no repositório.

## Verificação final

A preencher após a fase de comentários: comandos antes/depois, igualdade da impressão AST sem docstrings, igualdade dos bundles do frontend, links e blocos de código e teste de leitura por novo desenvolvedor. A suíte backend não tinha `pytest` instalado na baseline e seu resultado final dependerá da disponibilidade da ferramenta.
