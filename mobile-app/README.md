# Aplicativo mobile Zelo

Aplicativo para pacientes e acompanhantes, desenvolvido com Expo, React Native e TypeScript. O app registra e consulta sintomas, medicações e orientações através da API compartilhada do projeto.

## Dependências

- Node.js e npm
- Expo Go ou um emulador Android/iOS
- API e banco MySQL iniciados na pasta [`../backend`](../backend/README.md)

## Executar

```powershell
npm ci
npm start
```

Use `npm run android`, `npm run ios` ou `npm run web` para abrir um destino específico.

## Endereço da API

O endereço pode ser configurado pela variável `EXPO_PUBLIC_API_URL`. Sem configuração, o app usa `http://10.0.2.2:8000` no emulador Android e `http://127.0.0.1:8000` nos demais destinos locais.

Em um celular físico, configure a variável com o IP da máquina na rede local, por exemplo `http://192.168.0.10:8000`. O app e o site devem consumir a API única de `backend/`; não há banco separado neste projeto.

## Pastas e arquivos

- `pages/`: telas do aplicativo.
- `assets/`: imagens e recursos visuais.
- `api.ts`: chamadas à API centralizada.
- `types.ts`: tipos compartilhados pelas telas.
- `App.tsx`: composição e navegação principal.