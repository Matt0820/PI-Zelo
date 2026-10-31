# Verificação e correções do aplicativo mobile

## Problemas encontrados

- Havia referências a ícones que não existiam; o SDK 58 também rejeitava a opção `splash` legada.
- O app web do Expo e o protótipo servido pelo FastAPI são origens diferentes. O Expo gerava `/favicon.ico`, mas o backend não tinha essa rota, causando o 404 ao abrir a página servida em `localhost:8000`.
- O launcher vinculava o FastAPI somente a `127.0.0.1` e não passava ao Expo o endereço LAN do computador, impedindo acesso confiável pelo celular físico.
- O login restringia o campo a email, embora a API aceite email, CPF e prontuário; botões de login social apareciam, mas não tinham integração.
- Os formulários de sintomas e medicações começavam preenchidos com valores fictícios, que poderiam ser enviados como registros reais.
- O app salvava nome e email, mas não restaurava o ID do usuário e os registros da sessão ao reabrir.

## Correções aplicadas

- Gerei ícone, favicon e ícones Android a partir do logo existente; a splash foi migrada para o plugin `expo-splash-screen` compatível com o SDK 58.
- Instalei `react-dom` e `react-native-web` nas versões do SDK para habilitar o alvo Web. O app Expo exporta `/favicon.ico` a partir do `web.favicon` configurado.
- Coloquei o mesmo `favicon.ico` na raiz servida pelo FastAPI, adicionei a rota `/favicon.ico` e o link no protótipo web. Assim, o navegador não recebe 404 em nenhuma das duas origens.
- Ajustei `iniciar_zelo.sh` para detectar o IP local, passá-lo como `EXPO_PUBLIC_API_URL` e iniciar Uvicorn em `0.0.0.0`. O valor pode ser substituído definindo `EXPO_PUBLIC_API_URL` antes de executar o script.
- Alinhei o login aos identificadores aceitos pela API e removi ações sociais que não estavam implementadas.
- Limpei os campos de sintomas e medicações e passei a exigir nome, dose, horário e frequência antes de salvar uma medicação.
- Restaurei o perfil completo, incluindo ID, e recarreguei sintomas, medicações e orientações na inicialização.
- As mensagens de erros HTTP agora incluem status e rota para facilitar o diagnóstico de 404 e outros erros da API.

## Verificações

- TypeScript: `tsc --noEmit` passou.
- `expo install --check`: dependências alinhadas ao SDK.
- Expo Doctor: 20/20 verificações passaram.
- Bundles Web e Android exportados pelo Metro sem erro; Web incluiu `favicon.ico`.
- Teste HTTP com banco SQLite temporário: favicon (200), saúde da API, cadastro, login por prontuário, criação e consulta de sintomas e medicações, e consulta de orientações passaram.
- O teste em celular físico ainda depende do computador e telefone estarem na mesma rede e de a porta 8000 estar liberada no firewall.

## Alinhamento do app ao site do paciente

Nesta etapa, o site do paciente foi usado como referência de navegação, conteúdo e identidade visual. O aplicativo passa a usar a paleta Zelo do site e prioriza o fluxo de avaliação ESAS e triagem de dor.

- Substituí a aba de sintomas genéricos por histórico ESAS, avaliação guiada dos dez sintomas e revisão antes do envio. A avaliação começa sem respostas preenchidas e é persistida pela API.
- Adicionei a triagem de dor conectada ao endpoint existente, com perguntas de sinais de urgência, características e duração da dor, medicação de resgate e pedido de contato. Sinais de urgência interrompem o fluxo e mostram a opção de ligação.
- A tela inicial passou a exibir os registros ESAS e o acesso de contato usa o telefone apresentado pelo site.
- Atualizei os ícones e a cor da splash para a identidade visual do site. O favicon gerado pelo Expo foi sincronizado com a cópia servida pelo backend.
- Mantive os dados vindos do backend como fonte dos registros. Não repliquei respostas ESAS de demonstração nem os dados simulados guardados pelo site em `localStorage`.

### Limites desta etapa

Ainda falta trazer para o app as telas de mapa corporal, avisos/notificações e ajustes/acessibilidade do site. A triagem também deve ser validada com a equipe responsável quanto ao conteúdo clínico e aos critérios de urgência; a implementação apenas organiza os campos e rotas já disponíveis na API e no site.

### Verificações adicionais

- `expo install --check`: dependências compatíveis com o SDK instalado.
- `tsc --noEmit`: passou.
- `expo export --platform android`: bundle Android gerado pelo Metro.
- `expo export --platform web`: bundle Web gerado pelo Metro, incluindo `favicon.ico`.


## Acessibilidade visual e cadastro completo

- Adicionei a tela **Ajustes visuais**, acessível pelo ícone de engrenagem na página inicial. As opções claro, escuro, alto contraste e paletas para protanopia, deuteranopia e tritanopia são aplicadas às telas e persistidas no dispositivo. As paletas mantêm rótulos e números para que as informações não dependam exclusivamente da cor.
- Reorganizei o cadastro em três etapas: identificação e contato; perfil e informações de cuidado; senha. Nome, email e senha são obrigatórios. Os campos clínicos e de identificação adicionais são opcionais e são enviados à API nos nomes definidos pelo schema do backend.
- Incluí no schema e no endpoint de cadastro `tratamento_modificador`, já existente no modelo de usuário do banco. Campos gerados/administrados pelo servidor (ID, ativo, data de criação e hash da senha) continuam sendo controlados pelo backend.
- Atualizei o texto de privacidade no app para descrever o envio real de dados de perfil e cuidado à API, assim como o armazenamento local das preferências visuais.
- TypeScript, export Web, export Android e compilação sintática do backend passaram.

## Ajustes de navegação e alinhamento

- Troquei o conjunto de abas no rodapé por um menu lateral acessível pelo botão hambúrguer. Ele reúne resumo, histórico ESAS, medicações, orientações, ajustes visuais e saída da conta; os atalhos principais continuam disponíveis na tela inicial.
- Reorganizei a régua ESAS em duas linhas fixas (0–5 e 6–10), com botões de largura flexível para o valor 10 não quebrar para uma linha extra em telas estreitas.
- Limitei a largura do conteúdo ESAS em telas grandes e preservei a adaptação a celulares.
- TypeScript e exportações Web e Android passaram após as mudanças.

## Cadastro separado por pessoa

- A etapa 1 identifica explicitamente o **paciente**; os dados e a conta enviados ao backend pertencem ao paciente.
- A etapa 2 é um formulário próprio do **responsável**, com nome completo e relação com o paciente. Esses campos são obrigatórios, exceto quando a opção “O paciente será o próprio responsável” é marcada.
- A etapa 3 cria a senha de acesso do paciente. O perfil enviado à API é sempre `paciente`; o responsável é gravado nos campos de cuidador do cadastro do paciente.


## Integração do mapa de dor com o site React/Vite

- O app agora registra e consulta regiões de dor pelo mesmo endpoint que o portal web utiliza. Os registros enviados por qualquer cliente aparecem no prontuário e no histórico do paciente.
- Diagnósticos, justificativas de cuidados paliativos e agendamentos enviados pela equipe são publicados como evoluções clínicas e orientações, para que a equipe consulte no site e o paciente receba no app.
