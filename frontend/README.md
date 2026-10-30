# Zelo — Site para acompanhantes

Esta pasta contém o protótipo web do Zelo, voltado a acompanhantes de pessoas em cuidados paliativos. O site usa HTML, CSS e JavaScript e, neste momento, ainda não consome a API. Quando integrado, deve usar o backend compartilhado em [`../backend`](../backend/README.md), sem criar outro banco de dados.

> Protótipo front-end desenvolvido para o Projeto Integrador da FESPPR.

O **Zelo** é um sistema web desenvolvido com foco na comunicação e no acompanhamento de idosos com câncer em cuidados paliativos domiciliares.

O projeto busca transformar um fluxo de atendimento tradicional, baseado principalmente em comunicação por telefone e registros manuais, em uma experiência digital mais simples, acessível e centralizada.

Nesta primeira etapa, o projeto concentra-se na **construção do front-end**, utilizando **HTML, CSS e JavaScript**, com base nos fluxos de usuário e protótipos desenvolvidos no Figma.

---

## 🎯 Objetivo

O objetivo do Zelo é oferecer uma interface que facilite:

* Registro diário de sintomas;
* Acompanhamento da intensidade dos sintomas através da escala **ESAS**;
* Comunicação entre paciente/cuidador e equipe de saúde;
* Identificação de sintomas de maior intensidade;
* Acesso a um fluxo conversacional de triagem;
* Visualização de informações clínicas pela equipe responsável.

A aplicação foi planejada considerando principalmente a **acessibilidade, simplicidade de navegação e baixa carga cognitiva**, características importantes para usuários idosos.

---

## 👥 Perfis de Usuário

O sistema possui duas jornadas principais:

### 🧓 Paciente / Cuidador

A interface do paciente ou cuidador foi planejada para ser simples e objetiva, permitindo:

* Visualizar informações pessoais;
* Registrar sintomas;
* Preencher a escala ESAS;
* Registrar medicamentos;
* Acessar o chatbot de triagem;
* Visualizar orientações relacionadas ao fluxo de atendimento.

### 👨‍⚕️ Equipe de Saúde

A interface profissional funciona como um painel de acompanhamento, permitindo futuramente:

* Visualizar pacientes cadastrados;
* Identificar pacientes que necessitam de atenção;
* Acompanhar a evolução dos sintomas;
* Visualizar registros da escala ESAS;
* Acompanhar informações relacionadas aos medicamentos;
* Receber alertas provenientes da triagem.

---

## 🩺 Escala ESAS

O Zelo utiliza como referência a **Edmonton Symptom Assessment System (ESAS)**.

A interface considera nove sintomas:

| Sintoma    | Escala |
| ---------- | -----: |
| Dor        |   0–10 |
| Fadiga     |   0–10 |
| Náusea     |   0–10 |
| Depressão  |   0–10 |
| Ansiedade  |   0–10 |
| Sonolência |   0–10 |
| Apetite    |   0–10 |
| Bem-estar  |   0–10 |
| Dispneia   |   0–10 |

A classificação utilizada no projeto é:

* **0–3:** intensidade leve;
* **4–6:** intensidade moderada;
* **7–10:** intensidade grave.

Quando um sintoma apresenta intensidade **maior ou igual a 7**, o fluxo projetado considera a geração de um alerta e o acionamento do fluxo conversacional de triagem.

> **Importante:** estas funcionalidades são representadas no protótipo web. A integração deste site com a API e serviços de saúde ainda será implementada; não use o protótipo para armazenar ou processar dados reais de pacientes.

---

## 🤖 Chatbot Zelo

O chatbot foi projetado para utilizar uma comunicação simples e guiada, reduzindo a necessidade de digitação.

A interação utiliza principalmente opções de resposta como:

```text
SIM
NÃO
```

O fluxo foi planejado para auxiliar na triagem inicial de situações relacionadas a sintomas graves, especialmente dor.

Exemplo simplificado do fluxo:

```text
ESAS
  │
  ├── Dor < 7
  │     └── Fluxo normal
  │
  └── Dor >= 7
        │
        ▼
   Chatbot Zelo
        │
        ├── Características da dor
        ├── Localização
        ├── Duração
        ├── Uso de medicação
        └── Reavaliação
```

O chatbot apresentado no front-end representa um **protótipo de interação**. As decisões clínicas e integrações automatizadas dependem das próximas etapas do projeto.

---

## 🎨 Design e UX

A interface foi projetada inicialmente no **Figma**, considerando princípios de acessibilidade e usabilidade para pessoas idosas.

Entre as decisões de design estão:

* Tipografia com tamanho ampliado;
* Botões grandes e fáceis de identificar;
* Contraste adequado;
* Poucos elementos por tela;
* Navegação simplificada;
* Uso de mensagens claras;
* Respostas guiadas;
* Layout responsivo;
* Diferenciação visual entre as interfaces do paciente e da equipe de saúde.

A interface do paciente utiliza uma abordagem mais acolhedora e simples, enquanto o painel profissional prioriza a organização de informações e visualização de dados.

### Alto contraste

As páginas HTML da aplicação carregam `styles/high-contrast.css` diretamente e
`scripts/acessibilidade.js` aplica as preferências salvas. O controle de alto
contraste está disponível na barra de acessibilidade dos portais e em um botão
no fluxo do paciente; `Alt+C` também alterna o modo. A preferência é mantida
entre páginas no mesmo navegador. Ao criar uma nova página, inclua a folha de
estilo e o script de acessibilidade para habilitar o controle e os estilos.

---

## 🛠️ Tecnologias

Esta versão inicial utiliza tecnologias fundamentais de desenvolvimento web:

* **HTML5** — estrutura das páginas;
* **CSS3** — estilização, layout e responsividade;
* **JavaScript** — interatividade e comportamento das interfaces;
* **Figma** — prototipação e definição visual da interface.

### Integração com a plataforma

O repositório já contém uma API FastAPI e um banco MySQL compartilhados entre os clientes. A integração deste site com a API, autenticação, chatbot e mecanismos de segurança ainda precisa ser implementada. Consulte o README da raiz para executar os projetos em conjunto.

---

## 📁 Estrutura do site

```text
frontend/
├── index.html
├── pages/
├── scripts/
├── styles/
├── images/
└── README.md
```

---

## 🚀 Executando o site

Como esta versão utiliza apenas HTML, CSS e JavaScript, não é necessário instalar dependências para executar o protótipo.

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd PI-Zelo
```

### 2. Abra a página principal

```bash
frontend/index.html
```

Abra o arquivo em um navegador ou utilize o **Live Server** do VS Code.

---

## 🔮 Roadmap

O desenvolvimento do Zelo está planejado em etapas.

### ✅ Etapa atual

* [x] Definição do conceito do sistema
* [x] Levantamento inicial de requisitos
* [x] Prototipação das interfaces
* [x] Definição das jornadas de usuário
* [x] Estrutura inicial do front-end
* [x] Implementação inicial com HTML, CSS e JavaScript

### 🔄 Próximas etapas

* [ ] Refinamento das interfaces
* [ ] Implementação completa da escala ESAS
* [ ] Implementação do fluxo do chatbot
* [ ] Implementação do dashboard profissional
* [ ] Migração do front-end para React
* [x] Desenvolvimento do backend compartilhado
* [x] Implementação da API
* [x] Persistência centralizada no MySQL
* [x] Integração da API com o aplicativo mobile
* [ ] Integração do site com a API compartilhada
* [ ] Autenticação de usuários
* [ ] Implementação dos alertas em tempo real
* [ ] Testes de usabilidade
* [ ] Avaliação de acessibilidade
* [ ] Testes de segurança

---

## 🔐 Segurança e LGPD

O projeto foi concebido considerando a necessidade de proteção dos dados relacionados aos usuários e informações de saúde.

A implementação futura deverá considerar mecanismos como:

* Autenticação segura;
* Controle de acesso por perfil;
* Criptografia de informações sensíveis;
* Hash de senhas;
* Comunicação segura entre cliente e servidor;
* Minimização da exposição de dados pessoais;
* Controle de acesso às informações clínicas;
* Adequação às diretrizes da **LGPD**.

> Este site continua sendo um protótipo sem integração com a API. A plataforma não deve ser utilizada para armazenar ou processar dados reais de pacientes.

---

## 📚 Fundamentação

O desenvolvimento do Zelo utiliza como referência o trabalho de:

**GRZYBOWSKI, Bruna Tres.** *Ferramenta tecnológica para comunicação de idosos com câncer em cuidados paliativos com a equipe especializada.* 2023. Dissertação (Mestrado Profissional em Prática do Cuidado em Saúde) — Universidade Federal do Paraná, Curitiba, 2023.

O projeto também utiliza como referências os conceitos de:

* Cuidados paliativos;
* Oncologia geriátrica;
* Telessaúde;
* Engenharia de Software;
* Interface Humano-Computador (IHC);
* Experiência do Usuário (UX);
* Acessibilidade;
* Escala ESAS;
* Chatbots conversacionais.

---

## ⚠️ Status do Projeto

**Em desenvolvimento — protótipo acadêmico.**

O projeto atualmente representa a camada de **interface e interação do sistema**.

O backend e a persistência centralizada já existem e são usados pelo aplicativo mobile. A integração deste site, autenticação completa, processamento clínico e alertas em tempo real continuam em desenvolvimento.

---

## 👨‍💻 Projeto Acadêmico

**Projeto:** Zelo
**Equipe:** Equipe 7
**Instituição:** FESPPR
**Disciplina:** Projeto Integrador
**Orientadora:** Profª Dra. Cassiana Fagundes
**Ano:** 2026

---

## 📄 Licença

Este projeto foi desenvolvido para fins **acadêmicos e de pesquisa** no contexto do Projeto Integrador.

Consulte os responsáveis pelo projeto antes de utilizar, modificar ou redistribuir o código em outros contextos.
