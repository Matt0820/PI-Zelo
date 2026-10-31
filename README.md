# Zelo

Plataforma de acompanhamento em cuidados paliativos com site React/Vite, aplicativo Expo e uma API FastAPI compartilhada. O backend é a fonte única para pacientes, avaliações ESAS, triagens, mapa da dor, medicações, orientações, alertas e evoluções clínicas.

## Componentes

- `backend/`: API FastAPI e persistência configurada pelo projeto.
- `frontend/`: portal React e TypeScript compilado com Vite, com jornadas para equipe e paciente.
- `mobile-app/`: aplicativo Expo/React Native que consome os mesmos endpoints do portal.

## Iniciar

Na raiz do projeto, em Linux/macOS:

```sh
./iniciar_zelo.sh
```

O script inicia a API, o site Vite e o Expo. Site: `http://localhost:5173`. Swagger: `http://localhost:8000/docs`.

Para iniciar apenas o site: `cd frontend && npm ci && npm run dev`. O Vite encaminha `/api` ao backend em `http://127.0.0.1:8000`.

Para compilar o site: `cd frontend && npm run build`. O FastAPI serve a build em `/frontend/`.

## Fluxos Web

A equipe consulta pacientes, avaliações e locais de dor, acompanha alertas, envia orientações e registra diagnósticos, justificativas e agendamentos. O paciente pode preencher a avaliação ESAS, registrar locais de dor e consultar medicações e orientações. As orientações destinadas ao paciente também ficam disponíveis no app.

## Documentação

- [Site React/Vite](frontend/README.md)
- [API e configuração do backend](backend/README.md)
- [Aplicativo mobile](mobile-app/README.md)

## Nota de implantação

Os endpoints usados pelos fluxos assistenciais existentes não têm autorização de perfil no servidor. A interface distingue os papéis no login, mas isso não substitui autenticação e autorização de API. Antes de usar com dados reais, a API precisa aplicar controle de acesso por função e por paciente.
