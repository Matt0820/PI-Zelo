# Zelo

Plataforma de acompanhamento em cuidados paliativos com site React/Vite, aplicativo Expo e uma API FastAPI compartilhada. O backend é a fonte única para pacientes, avaliações ESAS, triagens, mapa da dor, medicações, orientações, alertas e evoluções clínicas.

## Componentes

- `backend/`: API FastAPI e persistência configurada pelo projeto.
- `frontend/`: portal React e TypeScript compilado com Vite, com jornadas para equipe e paciente.
- `mobile-app/`: aplicativo Expo/React Native que consome os mesmos endpoints do portal.

## Iniciar

Na raiz do projeto, use o inicializador do seu sistema:

```sh
./iniciar_zelo.sh
```

No Windows, execute `iniciar_zelo.bat`. Os inicializadores instalam as dependências ausentes e abrem a API, o site Vite e o Expo. Site: `http://localhost:5173`. Swagger: `http://localhost:8000/docs`. No Windows, os serviços ficam em janelas separadas; feche as três para encerrar tudo.

Para abrir o Expo em um celular físico, permita a porta 8000 no firewall e mantenha o computador e o celular na mesma rede. Os scripts tentam detectar o IP local e configurá-lo no Expo; também é possível definir `EXPO_PUBLIC_API_URL` manualmente. Emuladores podem exigir endereços próprios, como `http://10.0.2.2:8000` no Android.

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
