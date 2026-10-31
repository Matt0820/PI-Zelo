# Plano de Implementação: Melhorias Técnicas e Acessibilidade Zelo

Branch: `feature/melhorias-e-acessibilidade-zelo`

## 🎯 Objetivos
1. Resolver os apontamentos do Code Review (segurança, deprecations, performance de sessão e ausência de testes).
2. Refatorar a arquitetura frontend (eliminar redundância de arquivos e reduzir prop drilling).
3. Especialista Frontend (`@frontend-specialist`): Otimizar responsividade mobile-first, WCAG 2.1 AA/AAA, touch targets >= 44px e facilidade de uso para pacientes e equipe de saúde.

---

## 📋 Lista de Tarefas

### Fase 1: Backend (Refatoração & Robustez)
- [ ] **1.1** Substituir chamadas depreciadas `datetime.utcnow()` por `datetime.now(timezone.utc)`.
- [ ] **1.2** Otimizar autenticação no backend: extrair validação de usuário para dependência FastAPI (`get_current_user`), eliminando a dupla transação em banco por requisição.
- [ ] **1.3** Modularizar endpoints em `backend/app/routers/` (auth, users, clinical, medications) ou estruturação desacoplada preservando 100% de retrocompatibilidade com Swagger e Frontend.
- [ ] **1.4** Adicionar validação preventiva para `AUTH_SECRET` em ambientes produtivos.

### Fase 2: Suíte de Testes Automatizados (Backend)
- [ ] **2.1** Configurar `pytest` no backend e criar fixtures em `backend/tests/conftest.py`.
- [ ] **2.2** Criar testes para autenticação e RBAC (`test_auth.py` e `test_rbac.py`).
- [ ] **2.3** Criar testes para cálculo ESAS e disparo de alertas clínicos (`test_esas_and_alerts.py`).
- [ ] **2.4** Executar e validar que 100% dos testes passam.

### Fase 3: Frontend (Arquitetura & Clean Code)
- [ ] **3.1** Remover arquivo proxy redundante `frontend/src/accessibility/AccessibilityContext.tsx` e unificar importações em `frontend/src/context/AccessibilityContext.tsx`.
- [ ] **3.2** Organizar estados globais e fluxos de dados no Frontend para reduzir prop drilling.

### Fase 4: Frontend Specialist (Responsividade, WCAG & Usabilidade)
- [ ] **4.1** WCAG Touch Targets: Garantir área mínima de toque de 44x44px em todos os controles interativos (botões, seletores, abas, sliders).
- [ ] **4.2** Mobile Responsiveness: Otimizar visualização em dispositivos móveis (<= 640px) e tablets (<= 1024px), garantindo cards colapsáveis e tabelas roláveis sem overflow horizontal.
- [ ] **4.3** Acessibilidade Visual e Foco: Fortalecer estados de `:focus-visible`, contraste de texto e facilidade de leitura para pacientes com fadiga ou baixa acuidade visual.

### Fase 5: Verificação Integrada Final
- [ ] **5.1** Rodar suíte de testes do backend (`pytest`).
- [ ] **5.2** Rodar lint e typecheck do frontend (`npm run lint`).
- [ ] **5.3** Rodar build do frontend (`npm run build`).
- [ ] **5.4** Commits semânticos no branch `feature/melhorias-e-acessibilidade-zelo`.
