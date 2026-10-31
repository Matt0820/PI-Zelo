# Acessibilidade

**Objetivo:** registrar as opções implementadas nos clientes e fornecer uma rotina de verificação sem afirmar conformidade normativa que não foi medida nesta tarefa.

## Portal web

`AccessibilityContext.tsx` disponibiliza seis modos: padrão, escuro, alto contraste, protanopia, deuteranopia e tritanopia. A página de acessibilidade permite escolher o modo, ajustar fonte e movimento.

- Escala tipográfica: padrão 16 px, grande 19 px e muito grande 22 px.
- Alto contraste: tema próprio de preto e amarelo, aplicado pelas classes/atributo de visual e regras específicas no CSS.
- Redução de movimento: preferência salva no navegador; na primeira visita, o contexto consulta `prefers-reduced-motion`.
- Preferência escura: se não houver modo salvo, consulta `prefers-color-scheme: dark` na inicialização.
- Atalhos: `Alt+A` avança a escala tipográfica; `Alt+C` alterna alto contraste. Os atalhos não atuam enquanto foco está em campo editável.
- Estado: modo, fonte e movimento são persistidos no `localStorage`; `Escape` fecha o menu da barra quando ele está aberto.

## App Expo

`mobile-app/visual.tsx` declara paletas para claro, escuro, alto contraste, protanopia, deuteranopia e tritanopia, aplicadas por `VisualProvider` com `AsyncStorage`. `pages/Configuracoes.tsx` abre os ajustes visuais. As opções mobile têm paleta própria; não compartilham o CSS web.

## Como adicionar uma opção visual

1. Web: adicione a opção a `ModoVisual`, nomes e validação de armazenamento em `AccessibilityContext.tsx`.
2. Defina como o contexto aplica atributo/classe no `documentElement`.
3. Crie/revise regras em `frontend/src/styles.css` e confira componentes com cores fixas.
4. Expo: adicione o modo ao tipo `VisualMode` e à tabela `PALETAS` em `mobile-app/visual.tsx`; confirme que todos os tokens necessários estão definidos.
5. Atualize esta página e teste todos os estados relevantes sem depender apenas da cor para transmitir status.

## Checklist manual

- Percorra login, menu, formulário ESAS, mapa corporal, chatbot e modais com Tab/Shift+Tab/Enter/Espaço/Escape.
- Confirme foco visível, ordem lógica, rótulos dos controles e feedback de erro/sucesso.
- Teste seis modos visuais e três tamanhos de fonte nas telas de paciente e equipe.
- Ative redução de movimento e observe animações/transições.
- Use zoom do navegador em 200% e larguras de celular; procure corte, sobreposição e rolagem horizontal.
- Confira com leitor de tela e contraste calculado em componentes reais.

O catálogo DOCX descreve alvos, contraste, telas e alegações de WCAG 2.2. A leitura do código não prova conformidade WCAG AA/AAA nem os resultados empíricos do documento; esses itens requerem auditoria técnica própria. Consulte [Pendências](PENDENCIAS.md).
