# Zelo Web

Aplicação web em React, TypeScript e Vite para pacientes, cuidadores e equipe assistencial. Os dois portais consomem a API FastAPI do projeto; o site não mantém cópias clínicas em `localStorage` nem usa dados simulados como fonte de prontuário.

## Executar o projeto completo

Na raiz do repositório:

```sh
./iniciar_zelo.sh
```

O script instala as dependências necessárias e inicia a API, o Vite e o Expo. Acesse o site em `http://localhost:5173`, a documentação da API em `http://localhost:8000/docs` e o Expo conforme o endereço apresentado no terminal.

Também é possível iniciar somente o site:

```sh
cd frontend
npm ci
npm run dev
```

A API deve estar disponível em `http://127.0.0.1:8000`. O Vite encaminha `/api` e `/health` ao FastAPI durante o desenvolvimento. Para outra URL, defina `VITE_API_URL`.

## Compilar para produção

```sh
cd frontend
npm run build
```

A compilação fica em `frontend/dist`. Quando a pasta existe, o FastAPI a serve em `/frontend`; a rota raiz abre a versão compilada. Para desenvolvimento, use o endereço Vite `http://localhost:5173`.

## Fluxos disponíveis

### Equipe assistencial

- Entrar com a conta da equipe.
- Consultar pacientes cadastrados na API e criar novos cadastros.
- Abrir o prontuário com histórico ESAS, triagens, locais de dor, medicações, orientações e evoluções.
- Atualizar o estado de alertas clínicos.
- Enviar orientações diretamente ao app do paciente.
- Registrar diagnóstico e justificativa de cuidados paliativos como evolução clínica e orientação compartilhada.
- Enviar agendamento como evolução clínica e orientação compartilhada.

### Paciente e cuidador

- Criar uma conta em três etapas: dados do paciente, formulário do responsável e senha do paciente.
- Registrar avaliações ESAS na escala de 0 a 10.
- Consultar avaliações, medicações e orientações do mesmo backend usado pelo app Expo.
- Registrar locais, intensidade e observações no mapa da dor.
- Escolher tema claro, escuro, alto contraste ou paletas para daltonismo; a preferência fica salva neste navegador.

## Contratos compartilhados

O site usa os endpoints existentes de usuários, ESAS, triagem da dor, mapa da dor, medicamentos, orientações, alertas e evoluções. Os campos clínicos do prontuário não são alterados por um endpoint novo sem controle de acesso. Diagnósticos, justificativas e agendamentos são guardados como evoluções e, quando destinados ao paciente, também como orientações.

## Estrutura

```text
frontend/
├── src/                 # Aplicação React e cliente da API
├── images/              # Identidade visual
├── styles/              # Estilos legados não usados pela SPA
├── scripts/             # Scripts legados não usados pela SPA
├── assistencial/        # Telas HTML legadas não usadas pela SPA
├── paciente/            # Telas HTML legadas não usadas pela SPA
├── index.html            # Entrada Vite
├── package.json
└── vite.config.ts
```

As telas HTML antigas não são carregadas pela SPA nem pela build Vite. Os fluxos ativos estão em `src/`.
