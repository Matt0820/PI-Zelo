# Aplicativo mobile Zelo

Aplicativo para pacientes e acompanhantes, desenvolvido com Expo, React Native e TypeScript. O app registra e consulta avaliações ESAS, mapa da dor, medicações e orientações pela API compartilhada com o site React/Vite.

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

Para usar um celular físico, execute o projeto pela raiz com `./iniciar_zelo.sh`: o script publica a API na rede local, detecta o IP do computador e fornece essa URL ao Expo. Celular e computador precisam estar na mesma rede; libere a porta 8000 no firewall se necessário. Também é possível definir `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:8000` antes de iniciar o Expo. No emulador Android, use `http://10.0.2.2:8000`. O app e o site consomem a API única de `backend/`; não há banco separado neste projeto.

## Pastas e arquivos

- `pages/`: telas do aplicativo.
- `assets/`: imagens e recursos visuais.
- `api.ts`: chamadas à API centralizada.
- `types.ts`: tipos compartilhados pelas telas.
- `App.tsx`: composição e navegação principal.