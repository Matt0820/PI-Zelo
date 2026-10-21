# SISTEMA ZELO: CATÁLOGO TÉCNICO DE TELAS E FUNCIONALIDADES DO SISTEMA REAL

**Documentação das Telas do Sistema em Execução, Fundamentos de IHC para Idosos, Diretrizes WCAG 2.2 AA/AAA e Integração Clínica Multiprofissional**

---

## 1. Fundamentos de IHC e Engenharia de Acessibilidade no Sistema Zelo

O desenvolvimento do Sistema Zelo foi orientado pelos princípios da Interação Humano-Computador (IHC) e do Design Thinking com foco na gerontologia oncológica.

### Requisitos Críticos de IHC Implementados:
1. **Dimensão e Espaçamento de Alvos Táteis:** Botões com dimensão mínima de 56x56px no fluxo do paciente (e 48x48px no assistencial) com espaçamento livre de 12px.
2. **Hierarquia Tipográfica e Legibilidade Senil:** Tipografia Nunito com corpo de texto ampliado e escalonamento em 3 níveis (Padrão 16px, Grande 19px, Muito Grande 22px).
3. **Razão de Contraste e Modo de Alto Contraste (WCAG 2.2 AAA):** Contraste padrão superior a 7:1 e Modo de Alto Contraste verdadeiro com fundo preto (#000000) e amarelo (#FFFF00) superior a 15:1.
4. **Redução de Sobrecarga Cognitiva:** Avaliação ESAS em 1 sintoma por tela (Passo a Passo), sem formulários extensos.
5. **Prevenção Ativa de Erros:** Confirmação de saída, salvamento contínuo em localStorage e prevenção de perda de dados parciais.
6. **Ausência de Emoticons:** Dignidade do paciente idoso preservada com escalas visuais numéricas 0-10 validadas.

---

## 2. Catálogo Completo de Telas do Sistema Real em Execução

### Tela 01: Portal Central de Acesso e Seleção de Perfil

![Portal Central de Acesso e Seleção de Perfil](telas/sistema_real/01_portal_acesso.png)

- **Módulo / Contexto:** Desktop / Central
- **Objetivo Clínico:** Ponto de entrada único do sistema Zelo que permite direcionar o usuário para o seu ambiente específico: Portal da Equipe Assistencial ou Aplicativo do Paciente e Cuidador.
- **Funcionalidades Principais:** Cards de direcionamento com alvos visuais amplos e contraste superior a 8:1; acesso ao portal de equipe ou mobile; barra superior de apoio com telefone 24h.
- **Fundamentos de IHC e Acessibilidade:** Heurística #2 de Nielsen (Correspondência com o mundo real) ao separar os perfis assistencial e paciente; estados de foco nítidos para navegação acessível.

---

### Tela 02: Autenticação Unificada com Perfis Clínicos e Credenciais de Teste

![Autenticação Unificada com Perfis Clínicos e Credenciais de Teste](telas/sistema_real/02_login_unificado.png)

- **Módulo / Contexto:** Desktop / Segurança
- **Objetivo Clínico:** Garantir o controle de acesso seguro baseado em papéis (RBAC) em conformidade com a LGPD e a confidencialidade do prontuário médico.
- **Funcionalidades Principais:** Formulário seguro de autenticação; botões de atalho com credenciais pré-configuradas para avaliação (Admin, Médico, Enfermeira, Paciente); fallback resiliente em caso de falha de rede.
- **Fundamentos de IHC e Acessibilidade:** Heurística #6 de Nielsen (Reconhecer ao invés de lembrar) ao oferecer botões de teste com 1 clique; Heurística #9 (mensagens de erro claras sem termos de programação).

---

### Tela 03: Painel Multidisciplinar Desktop (Dashboard Assistencial)

![Painel Multidisciplinar Desktop (Dashboard Assistencial)](telas/sistema_real/03_assistencial_dashboard.png)

- **Módulo / Contexto:** Desktop / Assistencial
- **Objetivo Clínico:** Proporcionar à equipe médica e de enfermagem uma visão panorâmica e em tempo real de toda a coorte de pacientes monitorados no domicílio.
- **Funcionalidades Principais:** Painel de Indicadores Clínicos (KPIs); estratificação funcional PPS (10-30%, 40-60%, 70-100%); tabela de alertas críticos com dor severa em destaque vermelho; navegação lateral persistente.
- **Fundamentos de IHC e Acessibilidade:** Heurística #1 de Nielsen (Visibilidade do estado do sistema): códigos de cores semânticos (vermelho, âmbar e verde) sempre associados a rótulos textuais explícitos.

---

### Tela 04: Gestão e Lista de Pacientes em Acompanhamento Domiciliar

![Gestão e Lista de Pacientes em Acompanhamento Domiciliar](telas/sistema_real/04_assistencial_pacientes.png)

- **Módulo / Contexto:** Desktop / Assistencial
- **Objetivo Clínico:** Listagem nominal de pacientes em cuidados paliativos domiciliares com filtros clínicos e acesso direto ao prontuário individual.
- **Funcionalidades Principais:** Filtros de busca rápida por nome, prontuário, CID-10 e urgência; badges de estado clínico; identificação do cuidador responsável; ações diretas para abrir prontuário.
- **Fundamentos de IHC e Acessibilidade:** Organização em tabela de alta densidade visual com contraste reforçado, permitindo localizar qualquer paciente em menos de 3 segundos.

---

### Tela 05: Prontuário Paliativo - Histórico ESAS e Gráfico Temporal

![Prontuário Paliativo - Histórico ESAS e Gráfico Temporal](telas/sistema_real/05_assistencial_prontuario_esas.png)

- **Módulo / Contexto:** Desktop / Prontuário
- **Objetivo Clínico:** Apresentar a evolução longitudinal dos 9 sintomas da Escala de Edmonton (ESAS), correlacionando a eficácia da conduta médica com a resposta do paciente.
- **Funcionalidades Principais:** Cabeçalho com dados clínicos, CID-10 e PPS; exibição dos 9 sintomas avaliados hoje com barras coloridas; gráfico visual evolutivo da dor; histórico com data e hora.
- **Fundamentos de IHC e Acessibilidade:** Representação gráfica de alto contraste que facilita a identificação visual de piora antes de crises agudas (ergonomia cognitiva médica).

---

### Tela 06: Prontuário Paliativo - Respostas de Dor e Triagem Clínica do Script Validado

![Prontuário Paliativo - Respostas de Dor e Triagem Clínica do Script Validado](telas/sistema_real/06_assistencial_prontuario_triagem.png)

- **Módulo / Contexto:** Desktop / Prontuário
- **Objetivo Clínico:** Exibir as respostas fornecidas pelo paciente durante o diálogo com o Chatbot Zelo (baseado no script validado por juízes especialistas).
- **Funcionalidades Principais:** Quadro de características da dor (tipo, intensidade, duração); detecção de sinais de alarme clínicos; verificação de dose de resgate; conduta sugerida pelo algoritmo.
- **Fundamentos de IHC e Acessibilidade:** Consolida dados complexos de diálogo conversacional em um sumário estruturado, reduzindo o tempo de tomada de decisão médica.

---

### Tela 07: Prontuário Paliativo - Prescrições Médicas e Doses de Resgate

![Prontuário Paliativo - Prescrições Médicas e Doses de Resgate](telas/sistema_real/07_assistencial_prontuario_prescricoes.png)

- **Módulo / Contexto:** Desktop / Prontuário
- **Objetivo Clínico:** Módulo de prescrição farmacológica especializado em cuidados paliativos, destacando a medicação de uso contínuo e a medicação de resgate.
- **Funcionalidades Principais:** Tabela de medicamentos ativos com via, dose e posologia; card vermelho em destaque para a 'Dose de Resgate' de dor; botão para nova prescrição; histórico de adesão.
- **Fundamentos de IHC e Acessibilidade:** Heurística #5 de Nielsen (Prevenção de Erros): separação visual evidente entre medicação contínua e dose de resgate para evitar sobredosagem de opioides.

---

### Tela 08: Prontuário Paliativo - Mapeamento Corporal de Dor e Lesões

![Prontuário Paliativo - Mapeamento Corporal de Dor e Lesões](telas/sistema_real/08_assistencial_prontuario_mapa_dor.png)

- **Módulo / Contexto:** Desktop / Prontuário
- **Objetivo Clínico:** Visualização anatômica das regiões corporais indicadas pelo paciente ou cuidador como sítios de dor, feridas neoplásicas ou edemas.
- **Funcionalidades Principais:** Esquema anatômico do corpo humano (frente e costas) com marcações; card lateral descrevendo intensidade e tipo de desconforto; registro para estomaterapia.
- **Fundamentos de IHC e Acessibilidade:** Heurística #2 de Nielsen (Correspondência com o mundo real) ao substituir descrições textuais por um mapa visual intuitivo.

---

### Tela 09: Prontuário Paliativo - Evoluções da Equipe Multidisciplinar

![Prontuário Paliativo - Evoluções da Equipe Multidisciplinar](telas/sistema_real/09_assistencial_prontuario_evolucoes.png)

- **Módulo / Contexto:** Desktop / Prontuário
- **Objetivo Clínico:** Registro do prontuário multiprofissional contendo notas de evolução clínica da medicina, enfermagem, psicologia e serviço social.
- **Funcionalidades Principais:** Linha do tempo de anotações com identificação do profissional e conselho de classe; classificação do tipo de atendimento; modal para nova evolução.
- **Fundamentos de IHC e Acessibilidade:** Facilita a comunicação interprofissional sem ruídos, assegurando continuidade assistencial e rastreabilidade total de condutas.

---

### Tela 10: Central de Alertas Clínicos com Priorização Semafórica

![Central de Alertas Clínicos com Priorização Semafórica](telas/sistema_real/10_assistencial_alertas.png)

- **Módulo / Contexto:** Desktop / Assistencial
- **Objetivo Clínico:** Centro de triagem de incidentes clínicos e alertas automáticos gerados pelo sistema a partir dos registros enviados pelos pacientes.
- **Funcionalidades Principais:** Categorização semafórica (Vermelho, Âmbar e Verde); filtros rápidos por status; ação rápida para atender alerta com modal de desfecho clínico.
- **Fundamentos de IHC e Acessibilidade:** Reduz o estresse cognitivo da enfermagem ao classificar pacientes por gravidade objetiva, eliminando o risco de negligenciar casos graves.

---

### Tela 11: Monitoramento Longitudinal e Linha do Tempo Assistencial

![Monitoramento Longitudinal e Linha do Tempo Assistencial](telas/sistema_real/11_assistencial_acompanhamento.png)

- **Módulo / Contexto:** Desktop / Assistencial
- **Objetivo Clínico:** Ferramenta de análise de tendências clínicas e acompanhamento da trajetória do paciente ao longo de semanas e meses.
- **Funcionalidades Principais:** Gráficos de evolução temporal comparando múltiplos sintomas; registro de marcos clínicos (ajustes de dose, consultas); métricas de estabilidade paliativa.
- **Fundamentos de IHC e Acessibilidade:** Visão analítica de alto nível que permite avaliar se as metas terapêuticas de conforto e alívio do sofrimento estão sendo mantidas.

---

### Tela 12: Simulador Clínico do Algoritmo de Triagem e Script de Dor

![Simulador Clínico do Algoritmo de Triagem e Script de Dor](telas/sistema_real/12_assistencial_simulador_triagem.png)

- **Módulo / Contexto:** Desktop / Ferramenta
- **Objetivo Clínico:** Ambiente de testes clínicos e validação para que médicos e enfermeiros testem todos os nós decisórios do script de triagem e do chatbot de dor.
- **Funcionalidades Principais:** Configuração manual de escore de dor (0 a 10) e sinais de alarme; simulação imediata do fluxo conversacional; exibição da regra clínica disparada.
- **Fundamentos de IHC e Acessibilidade:** Transparência algorítmica: permite aos profissionais de saúde auditar as decisões automatizadas e garantir total segurança clínica.

---

### Tela 13: Acesso Acolhedor do Cuidador e Paciente

![Acesso Acolhedor do Cuidador e Paciente](telas/sistema_real/13_mobile_login_paciente.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Garantir uma entrada simplificada e sem atritos para o paciente idoso ou cuidador familiar, eliminando senhas complexas.
- **Funcionalidades Principais:** Identidade visual humanizada Zelo; entrada facilitada com telefone/CPF; botões de acessibilidade no topo; canal de apoio telefônico visível.
- **Fundamentos de IHC e Acessibilidade:** Minimiza barreiras cognitivas de entrada. Botão com 56px de altura e contraste cromático superior a 9:1.

---

### Tela 14: Seleção de Paciente Vinculado ao Cuidador Familiar

![Seleção de Paciente Vinculado ao Cuidador Familiar](telas/sistema_real/14_mobile_selecionar_paciente.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Permitir que cuidadores familiares que cuidam de mais de um idoso selecionem com precisão qual paciente estão avaliando.
- **Funcionalidades Principais:** Cards amplos de pacientes com nome, idade e relação de parentesco; data do último envio; botões de toque largos de 80px de altura.
- **Fundamentos de IHC e Acessibilidade:** Previne a troca involuntária de prontuários entre pacientes diferentes (Heurística #5 de Nielsen).

---

### Tela 15: Tela Inicial do Paciente (Home Acolhedora com Botões de 80px)

![Tela Inicial do Paciente (Home Acolhedora com Botões de 80px)](telas/sistema_real/15_mobile_paciente_home.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Centro de controle diário do paciente e cuidador, oferecendo acesso rápido às funções essenciais sem rolagem confusa.
- **Funcionalidades Principais:** Mensagem acolhedora personalizada; 4 botões verticais amplos de 80px de altura (ESAS, Chatbot, Medicamentos, Local de Dor); botão de emergência 'Ligar para Enfermagem'.
- **Fundamentos de IHC e Acessibilidade:** Ergonomia motora geriátrica de excelência: botões ocupam 100% da largura útil da tela e discagem imediata com protocolo nativo 'tel:'.

---

### Tela 16: Registro Guiado de Sintomas ESAS (Alvos de Toque de 56px e Escala 0 a 10)

![Registro Guiado de Sintomas ESAS (Alvos de Toque de 56px e Escala 0 a 10)](telas/sistema_real/16_mobile_paciente_esas.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Coleta diária padronizada dos 9 sintomas da Escala de Edmonton sem sobrecarregar a memória nem cansar o idoso fragilizado.
- **Funcionalidades Principais:** Passo a passo unidirecional (1 sintoma por tela); escala numérica 0-10 com âncoras descritivas; botões seletores de 56x56px; tela de revisão antes do envio.
- **Fundamentos de IHC e Acessibilidade:** Elimina formulários longos pelo princípio de Chunking. Alvos de 56px atendem com folga às diretrizes WCAG 2.2 AAA para tremores motores.

---

### Tela 17: Chatbot Zelo (Script Validado por Juízes para Avaliação e Alívio da Dor)

![Chatbot Zelo (Script Validado por Juízes para Avaliação e Alívio da Dor)](telas/sistema_real/17_mobile_paciente_chatbot.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Assistente virtual acolhedor que executa rigorosamente o script clínico validado por juízes especialistas para avaliar dor e resgate.
- **Funcionalidades Principais:** Balões de diálogo de alta legibilidade; botões de resposta rápida pré-formatados (sem digitação); triagem em 4 níveis (C1 a C4); orientações de conforto.
- **Fundamentos de IHC e Acessibilidade:** Design conversacional humanizado sem digitação manual, viabilizando o uso por pessoas com tremores senis ou artrose nas mãos.

---

### Tela 18: Medicamentos do Dia e Registro da Dose de Resgate

![Medicamentos do Dia e Registro da Dose de Resgate](telas/sistema_real/18_mobile_paciente_medicamentos.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Orientar o paciente e cuidador quanto aos medicamentos prescritos, prevenindo esquecimentos e controlando as doses de resgate de dor.
- **Funcionalidades Principais:** Card de destaque vermelho para dose de resgate com botão de registro; remédios divididos por períodos (Manhã, Tarde, Noite); indicação da função em linguagem leiga.
- **Fundamentos de IHC e Acessibilidade:** Heurística #6 de Nielsen (Reconhecimento ao invés de memorização): associa o remédio à sua indicação de uso leiga, empoderando o paciente.

---

### Tela 19: Esquema Anatômico Corporal Interativo para Indicação de Dor

![Esquema Anatômico Corporal Interativo para Indicação de Dor](telas/sistema_real/19_mobile_paciente_local_dor.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Permitir que o paciente aponte visualmente no corpo onde dói ou onde surgiu uma ferida neoplásica ou edema.
- **Funcionalidades Principais:** Alternância entre Visão da Frente e Visão das Costas; grade de botões anatômicos táteis amplos; seleção do tipo de queixa; confirmação visual.
- **Fundamentos de IHC e Acessibilidade:** Comunicação visual direta fundamental para idosos com afasia, disartria ou dificuldades de expressão verbal.

---

### Tela 20: Central de Avisos e Orientações da Equipe Paliativa

![Central de Avisos e Orientações da Equipe Paliativa](telas/sistema_real/20_mobile_paciente_notificacoes.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Canal de comunicação assíncrono onde a família recebe avisos de visitas da equipe, lembretes e mensagens de acolhimento.
- **Funcionalidades Principais:** Cards de mensagens categorizados por gravidade; confirmação de visualização; avisos de agendamento de visita de enfermagem.
- **Fundamentos de IHC e Acessibilidade:** Reduz a ansiedade e o sentimento de desamparo no domicílio, transmitindo segurança constante.

---

### Tela 21: Perfil, Ajustes de Acessibilidade e Termos LGPD

![Perfil, Ajustes de Acessibilidade e Termos LGPD](telas/sistema_real/21_mobile_paciente_configuracoes.png)

- **Módulo / Contexto:** Mobile / Paciente
- **Objetivo Clínico:** Configuração personalizada das preferências visuais do aplicativo e exibição dos dados de prontuário e consentimento informado.
- **Funcionalidades Principais:** Seletor do Tamanho de Texto (Padrão, Grande +18%, Muito Grande +37%); chave para Modo Alto Contraste; dados do paciente e cuidador; termos LGPD.
- **Fundamentos de IHC e Acessibilidade:** Autonomia do usuário (Heurística #3 de Nielsen): o paciente adapta a interface às suas limitações visuais com 1 toque.

---

### Tela 22: Demonstração do Sistema Real em Modo Alto Contraste (Tela de Ajustes)

![Demonstração do Sistema Real em Modo Alto Contraste (Tela de Ajustes)](telas/sistema_real/22_mobile_acessibilidade_alto_contraste_perfil.png)

- **Módulo / Contexto:** Acessibilidade WCAG AAA
- **Objetivo Clínico:** Comprovar a execução funcional do Modo Alto Contraste implementado em código, atendendo aos rigorosos critérios da norma WCAG 2.2 AAA.
- **Funcionalidades Principais:** Fundo preto puro (#000000) e superfície escura (#0A0A0A); tipografia amarela (#FFFF00) superior a 15:1; textos secundários brancos (#FFFFFF); bordas amarelas de 2px; badge confirmando 'Ativado'.
- **Fundamentos de IHC e Acessibilidade:** Padrão ouro em tecnologia assistiva para idosos com baixa acuidade visual severa, catarata e retinopatia diabética.

---

### Tela 23: Demonstração do Sistema Real em Modo Alto Contraste (Tela Inicial)

![Demonstração do Sistema Real em Modo Alto Contraste (Tela Inicial)](telas/sistema_real/23_mobile_acessibilidade_alto_contraste_home.png)

- **Módulo / Contexto:** Acessibilidade WCAG AAA
- **Objetivo Clínico:** Evidenciar como todos os elementos da tela inicial (cards de ação, cabeçalho e menu de navegação) se adaptam automaticamente ao alto contraste.
- **Funcionalidades Principais:** Cards com bordas amarelas grossas; texto de acolhimento legível a distância; barra inferior preta e amarela; botões superiores de acesso rápido 'A+ Texto' e 'Contraste'.
- **Fundamentos de IHC e Acessibilidade:** Heurística #4 de Nielsen (Consistência): homogeneidade visual total em todas as páginas após a ativação do modo.

---

### Tela 24: Demonstração de Escala de Fonte Muito Grande (+37% / 22px)

![Demonstração de Escala de Fonte Muito Grande (+37% / 22px)](telas/sistema_real/24_mobile_acessibilidade_fonte_grande.png)

- **Módulo / Contexto:** Acessibilidade WCAG AA
- **Objetivo Clínico:** Comprovar o funcionamento real do redimensionamento de fontes na tela do paciente, sem quebra de leiaute nem sobreposição de botões.
- **Funcionalidades Principais:** Escalonamento da raiz (html) para 22px; crescimento harmônico dos cards de toque para mais de 100px; espaçamento entre linhas de 1.5; integridade funcional total.
- **Fundamentos de IHC e Acessibilidade:** Atende plenamente ao Critério de Sucesso WCAG 2.2 - 1.4.4 (Redimensionamento de Texto em até 200% sem perda de conteúdo).

---

## 3. Matriz de Conformidade com Heurísticas de Usabilidade e Normas WCAG 2.2

| Diretriz / Heurística | Implementação no Zelo | Telas Evidenciadas |
|---|---|---|
| **Nielsen #1: Visibilidade do Estado do Sistema** | Status de envio em tempo real, badges semânticos de gravidade com rótulo textual e confirmação de salvamento. | Telas 03, 05, 10, 16 |
| **Nielsen #2: Correspondência com o Mundo Real** | Esquemas anatômicos corporais e linguagem em saúde paliativa acolhedora, sem termos técnicos de TI. | Telas 01, 08, 17, 19 |
| **Nielsen #3: Controle e Liberdade do Usuário** | Navegação com botão 'Voltar' persistente, possibilidade de reverter seleções e alternar temas livremente. | Telas 14, 16, 21, 22 |
| **Nielsen #4: Consistência e Padrões** | Design System Zelo unificado: paleta institucional consistente, tipografia Nunito e botões padronizados. | Todas as Telas (01 a 24) |
| **Nielsen #5: Prevenção de Erros** | Confirmação explícita antes de sair de formulários, separação nítida entre dose horária e de resgate, alvos de toque de 56px. | Telas 07, 15, 16, 18 |
| **Nielsen #6: Reconhecer ao Invés de Lembrar** | Exibição do histórico recente do paciente, indicação do motivo de cada remédio e credenciais de teste com 1 clique. | Telas 02, 05, 06, 18 |
| **Nielsen #7: Flexibilidade e Eficiência** | Atalhos de teclado (Alt+A para fonte, Alt+C para contraste), filtros rápidos na lista de pacientes e busca ágil. | Telas 04, 10, 21, 24 |
| **Nielsen #8: Estética e Minimalismo** | Fluxo ESAS em 1 sintoma por tela (Chunking), sem banners desnecessários nem poluição visual. | Telas 13, 15, 16, 17 |
| **Nielsen #9: Reconhecer e Recuperar Falhas** | Mensagens de erro instrutivas e acolhedoras com canais de apoio imediato e telefone de plantão 24 horas. | Telas 02, 10, 15, 20 |
| **Nielsen #10: Ajuda e Documentação** | Modal de ajuda de acessibilidade embutido na barra superior, orientações de autocuidado e simulador de triagem. | Telas 01, 12, 17, 21 |
| **WCAG 2.2 AAA - 1.4.6: Contraste Aprimorado** | Modo Alto Contraste com razão superior a 15:1 (fundo preto #000000 e amarelo #FFFF00). | Telas 22 e 23 |
| **WCAG 2.2 AAA - 2.5.5: Alvo Tátil Ampliado** | Alvos de toque mínimos de 56x56px no fluxo mobile e 48x48px no assistencial. | Telas 15, 16, 18, 19 |
| **WCAG 2.2 AA - 1.4.4: Redimensionamento de Texto** | Escala dinâmica até +37% (22px) na raiz do documento sem quebra de leiaute. | Telas 21 e 24 |

---

## 4. Considerações Finais e Validação Técnica do Sistema

O catálogo técnico documentado comprova que o Sistema Zelo apresenta-se como uma plataforma web plenamente implementada, responsiva e funcional. Todas as 24 telas analisadas foram capturadas a partir dos componentes reais do sistema, atestando a coerência visual entre o design centrado no usuário idoso e a implementação de software.
