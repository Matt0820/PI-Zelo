# Propostas de melhoria de legibilidade

**Objetivo:** registrar mudanças de organização que podem facilitar manutenção, sem executá-las nesta tarefa.

| Proposta | Por quê | Risco | Arquivos afetados | Esforço |
|---|---|---|---|---|
| Consolidar ou retirar a árvore de chatbot não ativa depois de validar equivalência clínica. | Há duas árvores/duas telas e só `features/chatbot/ChatbotZelo.tsx` está conectada à navegação atual. | Pode remover comportamento ainda acessado por integração ou rota não encontrada na revisão. | `frontend/src/chatbot/*`, `frontend/src/features/chatbot/*`, `frontend/src/features/patient/PatientArea.tsx` | Médio |
| Substituir criação/alteração de schema no startup por migrações versionadas. | `create_all` e `ALTER TABLE` pontual não registram uma trilha de versão do banco. | Requer estratégia de adoção para bancos locais existentes. | `backend/app/main.py`, `backend/app/database.py`, novas migrações | Médio/alto |
| Unificar modelo de páginas do portal e rotas. | Hoje `App.tsx` faz navegação por condições e mistura carregamento, sessão e seleção de página. | Mudança ampla de fluxo, histórico e comportamento mobile. | `frontend/src/App.tsx`, `frontend/src/features/*` | Alto |
| Definir contratos API compartilhados/gerados em vez de repetir tipos web e Expo. | `frontend/src/api.ts` e `mobile-app/api.ts` mantêm modelos correspondentes manualmente. | Divergência temporária de tipos e necessidade de pipeline de geração. | `backend/app/schemas.py`, clientes web/mobile, configuração de geração | Médio |
| Centralizar configuração de execução e reduzir divergência dos inicializadores. | Shell e batch têm checagens, detecção de IP e abertura de processo diferentes. | Paridade entre Windows e Linux/macOS pode regredir. | `iniciar_zelo.sh`, `iniciar_zelo.bat`, docs | Médio |
| Centralizar autorização por perfil e ampliar os testes de matriz. | O guard ainda combina prefixos e verificações por método; `medico` tem leitura de prontuário e gestão de alertas, com escrita de prontuário restrita. | Mudanças na matriz podem expor dados clínicos ou bloquear condutas. | `backend/app/security.py`, `backend/app/routers/*`, `backend/tests/test_auth.py`, `backend/tests/test_esas_and_alerts.py`, `frontend/src/App.tsx` | Médio |

As propostas restantes são sugestões para tarefas futuras; a implementação HTML/CSS/JS anterior foi removida após confirmação de que a SPA Vite é a interface ativa. O utilitário de capturas que ainda referencia as telas removidas permanece como pendência.

Consulte também [Arquitetura](ARQUITETURA.md), [Frontend](FRONTEND.md), [Backend](BACKEND.md) e as prioridades atuais em [Pendências](PENDENCIAS.md).
