# Como contribuir

**Objetivo:** dar um roteiro baseado nas pastas reais para desenvolver uma mudança pequena e verificável.

## Fluxo de trabalho

1. Atualize sua branch base e crie uma branch para a tarefa (por exemplo, `feat/nome-curto` ou `docs/nome-curto`).
2. Leia o componente existente e os contratos API/schema antes de mudar estado ou payload.
3. Mantenha a mudança no módulo responsável e documente decisão/restrição quando ela não for evidente.
4. Execute as verificações aplicáveis abaixo e descreva resultados no PR.
5. Não inclua `.env`, banco local, `node_modules`, `dist` ou dados reais de pacientes.

Não foi encontrado arquivo de contribuição ou workflow CI versionado no inventário consultado. Combine revisão e publicação com a equipe do repositório.

## Receita: adicionar um endpoint

1. Defina o contrato em `backend/app/schemas.py`.
2. Adicione/ajuste entidade e relação em `backend/app/models.py` se houver persistência nova.
3. Implemente a rota no router responsável em `backend/app/routers/` e use `get_db` para a sessão.
4. Confira a autorização em `backend/app/security.py`; novos caminhos precisam respeitar usuário, papel e escopo.
5. Adicione testes em `backend/tests/` usando o banco isolado de `conftest.py`.
6. Atualize `frontend/src/api.ts` e/ou `mobile-app/api.ts` se um cliente chamar a rota, incluindo tipos do retorno.
7. Atualize `docs/BACKEND.md` se a API pública mudou.

## Receita: adicionar um componente React

1. Se for compartilhado, coloque em `frontend/src/components/`; caso seja específico, mantenha em `features/<área>/`.
2. Declare props perto do componente, com tipos explícitos.
3. Reaproveite `Button`, `PageHeading`, `NoticeFeedback` e estilos/tokens existentes.
4. Inclua nome acessível, estados de foco/erro/carregamento e comportamento de teclado.
5. Conecte dados pelo `api` de `frontend/src/api.ts`; mantenha estado persistente no servidor quando for dado clínico.
6. Descreva componente/props públicas com TSDoc e atualize `docs/FRONTEND.md` se a arquitetura mudar.

## Verificações

- Web: `cd frontend && npm run lint && npx tsc --noEmit && npm run build`.
- App: `cd mobile-app && npx tsc --noEmit`; confira Expo com `npx expo install --check`.
- Backend: instale as dependências já declaradas em `backend/requirements-dev.txt` e execute `cd backend && python -m pytest`.
- Manual: navegação por teclado, viewport mobile, acessibilidade e fluxos clínicos afetados.

## Checklist de revisão

- [ ] A mudança não cria cópia clínica no `localStorage`/`AsyncStorage`.
- [ ] API valida payload e autorização; mensagens não expõem segredo nem dado clínico fora do escopo.
- [ ] Teclado, foco, leitor de tela e tamanhos de toque continuam utilizáveis.
- [ ] Modo escuro, alto contraste e paletas afetadas foram conferidos.
- [ ] Build, tipos e testes executados; limitações registradas.
- [ ] Documentação e variáveis de exemplo acompanham a mudança sem credenciais reais.
