# Chatbot Zelo e triagem de dor

**Objetivo:** indicar qual fluxo está conectado ao portal atual, onde ficam as perguntas e como revisar uma alteração.

## Portal web ativo

`frontend/src/features/patient/PatientArea.tsx` renderiza `features/chatbot/ChatbotZelo.tsx`. A árvore de perguntas fica em `features/chatbot/chatbot-scripts.ts`, com os contratos em `features/chatbot/types.ts`.

Cada `ChatNode` descreve identificador, emissor (`zelo` ou `user`), mensagem (texto ou função), conteúdo complementar e opções. Cada opção tem rótulo, ação que atualiza respostas e `nextNodeId`; opções de alerta podem encerrar o fluxo como emergência. O fluxo pergunta sinais de emergência, característica e duração da dor, sintomas acompanhantes/fatores de piora, eficácia de medicação, dose de resgate, medidas de conforto e solicitação de contato. A tela inclui forma de corrigir respostas e permite nota adicional conforme o nó.

Ao terminar, a tela mapeia respostas ao payload definido pela API e atualiza os dados. A API persiste a triagem e cria um alerta; os detalhes estão em [Backend](BACKEND.md). O conteúdo é um fluxo de interface e não substitui conduta clínica profissional.

## Outra implementação web

`frontend/src/chatbot/script.ts`, `flowMachine.ts` e `ChatbotZeloScreen.tsx` contêm uma implementação separada. A tela não aparece importada em `App.tsx` ou nas áreas ativas encontradas; o portal atual usa `features/chatbot/ChatbotZelo.tsx`. Não edite a árvore antiga supondo que ela controla a tela atual. A duplicação está registrada em [Pendências](PENDENCIAS.md).

## App Expo

O app mobile usa a tela `mobile-app/pages/TriagemDor.tsx`, com estado de perguntas conduzido pela própria tela, e envia as respostas por `registrarTriagemDor` em `mobile-app/api.ts`. Esse fluxo não importa a árvore `CHATBOT_SCRIPT_TREE` do portal web.

## Editar ou criar uma pergunta

1. Atualize `ChatNode`/`ChatbotAnswers` em `features/chatbot/types.ts` quando surgir um campo realmente novo.
2. Adicione ou altere o nó em `CHATBOT_SCRIPT_TREE`, confira todos os `nextNodeId` e mantenha um caminho de emergência bloqueante.
3. Se a resposta for persistida, confira o payload em `ChatbotZelo.tsx` e os campos aceitos por `PainTriageCreate` em `backend/app/schemas.py`.
4. Verifique a possibilidade de voltar/corrigir sem apagar respostas que pertencem a outros nós.
5. Faça o fluxo completo com caminhos Sim/Não, emergência e envio concluído. A suíte atual não foi executada na baseline porque `pytest` está ausente no ambiente.

Não acrescente instrução de medicamento ou dose sem revisão clínica formal. O código guarda respostas e apresenta orientações existentes; não prescreve.
