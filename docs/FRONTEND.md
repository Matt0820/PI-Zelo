# Frontend web

**Objetivo:** orientar quem vai navegar ou alterar o portal web sem confundir a SPA ativa com as páginas HTML anteriores.

## Entrada e navegação

`frontend/index.html` carrega `src/main.tsx`, que monta React e `AccessibilityProvider`. `App.tsx` mantém usuário, token através do cliente API, dados carregados e estados de página. Não há biblioteca de roteamento: as áreas e telas são selecionadas por `PatientPage` e `TeamPage`.

- Paciente/cuidador: início, avaliação ESAS, chatbot, mapa corporal, medicações, orientações e acessibilidade.
- Equipe: painel, lista de pacientes, alertas, acessibilidade e prontuário selecionado.
- O cliente HTTP em `src/api.ts` envia Bearer token, converte erros da API para mensagens e tipa entidades de resposta.

## Pastas ativas

- `src/features/auth/`: login e criação de conta.
- `src/features/patient/`: páginas do paciente; `PatientArea` decide a tela exibida.
- `src/features/team/`: visão da equipe, cards de alertas/pacientes, prontuário e modais.
- `src/features/chatbot/`: árvore de fluxo usada pela tela do paciente.
- `src/features/accessibility/`: configuração dos modos visuais.
- `src/chatbot/`: outra máquina/script de chatbot; a tela `ChatbotZeloScreen` não é importada pelo fluxo atual, segundo as referências do código.
- `src/components/`: controles e padrões compartilhados.
- `src/context/`: contexto de acessibilidade.
- `src/styles.css`: tokens CSS, layout responsivo e regras de temas.

As pastas HTML `pages/`, `paciente/`, `assistencial/`, `styles/` e `scripts/` e o arquivo `login.html` são legados: a configuração Vite padrão gera a SPA de `index.html`. Não os apague sem migração/decisão registrada.

## Estado e sessão

O estado de negócio é coordenado em `App.tsx`. Dados persistentes vêm da API; o frontend guarda a sessão do usuário e o token Bearer em `localStorage`. Preferências de tema, escala tipográfica e movimento também são guardadas localmente pelo contexto de acessibilidade. Falhas de armazenamento são tratadas por `try/catch` em alguns pontos, mas não equivalem a persistência segura.

## Componentes

Os controles compartilhados incluem `Button`, `Icon`, `Field`, `Card`, `ModalDialog`, `PageHeading`, `MetricCard`, `DataCell`, `EmptyState` e `NoticeFeedback`. Ao criar uma tela, prefira reaproveitar esses componentes e passar rótulos acessíveis; componentes próprios devem manter estados de foco e nomes compreensíveis para leitor de tela.

## Estilização

`styles.css` define tokens como `--green`, `--paper`, `--canvas`, `--ink`, `--muted` e `--border`; estados visuais usam classes/atributo `data-visual` no elemento raiz. O arquivo contém regras históricas e sobrescritas posteriores, por isso uma alteração de tema deve conferir ordem e especificidade das regras. Não existe CSS Modules ou biblioteca de componentes de terceiros na SPA ativa.

## Build e conferência

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Os três comandos passaram na baseline em uma cópia temporária do commit. `npm run lint` executa TypeScript (`tsc --noEmit`); `npm run build` usa `tsc -b` e Vite.
