# SISTEMA ZELO: CATÁLOGO TÉCNICO DE TELAS E FUNCIONALIDADES DO SISTEMA REAL

> **Documentação de Telas, Fundamentos de IHC para Gerontologia, Diretrizes WCAG 2.2 AA/AAA e Protocolos de Cuidados Paliativos Oncológicos**  
> **Plataforma:** Zelo — Telessaúde e Monitoramento em Cuidados Paliativos Oncológicos Domiciliares  
> **Referenciais Científicos e Normativos:** Monografia & Artigo Base (Bruna), Escala ESAS-r (10 sintomas validados), Palliative Performance Scale (PPS), Protocolos de Farmacoterapia Paliativa (RENAME / Erasto Gaertner), Resolução COFEN nº 634/2020 (Telenfermagem), Lei nº 12.842/2013 (Ato Médico) e 10 Heurísticas de Usabilidade de Nielsen.

---

## 1. Fundamentos de IHC, Gerontologia e Acessibilidade Universal

O desenvolvimento do Sistema Zelo foi concebido a partir da interseção entre a **Medicina Paliativista**, a **Enfermagem Oncológica** e a **Engenharia de Interação Humano-Computador (IHC)**. Pacientes oncológicos em cuidados paliativos domiciliares frequentemente apresentam astenia severa, tremores motores, declínio da acuidade visual e fadiga cognitiva. Por sua vez, a equipe de saúde assistencial necessita de ferramentas de alta densidade informativa com tempo mínimo de triagem.

### Princípios e Diretrizes Aplicadas:
1. **Ergonomia Motora e Alvos Táteis (WCAG 2.5.8):**  
   Todos os controles interativos primários possuem dimensões mínimas de 48x48px (e até 56x56px nos seletores numéricos do paciente), com espaçamento de segurança para evitar toques acidentais por pacientes com fraqueza muscular ou cuidadores sob estresse.
2. **Redução Drástica da Carga Cognitiva (Chunking):**  
   A avaliação de sintomas da escala ESAS-r é fragmentada em passos unidirecionais ("1 sintoma por vez"), eliminando formulários longos que geram abandono da avaliação diária.
3. **Preservação da Dignidade do Paciente (Anti-Infantilização):**  
   Rejeição do uso de emoticons ou desenhos caricaturais nos instrumentos de dor. Utilização estrita de **Escalas Visuais Numéricas (0 a 10)** com âncoras descritivas validadas clinicamente.
4. **Sistema de Acessibilidade Multitema com 5 Modos:**
   - **Padrão (Claro Humanizado):** Tons orgânicos de papel (`#fdfbf7`), verde floresta institucional (`#1b5e4a`) e preto café para contraste natural de 8:1 sem fadiga ocular.
   - **Modo Escuro (Noturno Suave):** Fundo verde-escuro profundo (`#121916`) e cartões elevados em `#1d2823`, evitando cansaço visual em quartos de repouso com baixa iluminação.
   - **Alto Contraste (WCAG 2.2 AAA):** Fundo preto absoluto (`#000000`), texto branco puro (`#ffffff`), contornos sólidos e botões em amarelo puro (`#ffff00`), atingindo contraste superior a **19.5:1**.
   - **Modo Daltonismo Protanopia / Deuteranopia:** Substituição semafórica verde-vermelho por azul cobalto (`#245c91`) e laranja âmbar (`#a14b00`).
   - **Modo Daltonismo Tritanopia:** Paleta ajustada com violeta profundo (`#6b477f`) e rosa terra (`#a13b48`).
   - **Escalonamento Tipográfico Dinâmico:** Três patamares tipográficos reais (16px base, 19px ampliado, 22px muito grande) sem quebra de diagramação.
5. **Arquitetura Web Unificada e Responsiva:**  
   Consolidação em uma aplicação web única (React 18 + Vite), que se adapta dinamicamente entre monitores desktop médicos de alta resolução, tablets de enfermagem e telas de smartphones de pacientes e familiares via navegador web.

---

## 2. Catálogo Técnico Detalhado das Telas do Sistema Real

---

### MÓDULO 1: AUTENTICAÇÃO, CADASTRO E CONTROLE DE ACESSO (RBAC)

#### Tela 01: Login Seguro com Alternância de Perfil e Atalhos de Teste
- **Módulo / Contexto:** Autenticação & Segurança / Universal
- **Objetivo Clínico:** Garantir a entrada segura com isolamento de privilégios (RBAC) em estrita conformidade com a LGPD e as normas do Conselho Federal de Medicina (CFM) e de Enfermagem (COFEN).
- **Funcionalidades e Fluxos:**
  - Alternador de perfil visual (`role-switch`): permite selecionar entre **"Equipe assistencial"** (médicos, enfermeiros e administradores) e **"Paciente / Cuidador"**.
  - Validação estrita de credenciais com geração de tokens JWT seguros.
  - Bloqueio inteligente: se um paciente tentar entrar na opção da equipe (ou vice-versa), o sistema orienta o redirecionamento com mensagem instrutiva clara.
  - **Atalhos Rápidos de Demonstração:** Botões com 1 clique para a banca avaliadora testar instantaneamente as credenciais de `Admin`, `Médico`, `Enfermeira` e `Paciente`.
  - Tratamento resiliente de expiração de sessão com redirecionamento automático e limpeza segura de armazenamento local.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #6 (Reconhecimento em vez de recordação):* Atalhos de teste pré-carregados poupam o avaliador da memorização de senhas.
  - *Heurística #9 (Auxiliar os usuários a reconhecer erros):* Mensagens de erro amigáveis sem exposição de stack traces ou detalhes técnicos de banco de dados.

---

#### Tela 02: Novo Cadastro Humanizado do Paciente em 3 Etapas Otimizadas
- **Módulo / Contexto:** Onboarding do Paciente / Web Responsiva
- **Objetivo Clínico:** Coletar com precisão os dados cadastrais, clínicos e o suporte familiar do paciente, garantindo identificação inequívoca no prontuário e vínculo do responsável legal.
- **Funcionalidades e Fluxos:**
  - **Etapa 1 — Acesso & Identificação:** Nome completo, Email de login, Senha com indicador de força em tempo real (mínimo 8 caracteres, maiúsculas, números e caracteres especiais) e botão de alternância para exibir/ocultar senha, CPF formatado, Telefone, Idade e Sexo biológico.
  - **Etapa 2 — Acompanhante e Responsável Legal:** Checkbox interativa *"O paciente será o próprio responsável"*. Caso marcada, oculta dinamicamente os campos de responsável para reduzir cliques e poluição visual; caso desmarcada, solicita Nome e Relação/Parentesco do cuidador familiar.
  - **Etapa 3 — Histórico Clínico & Termos de Uso:** Coleta opcional de dados médicos para não travar a criação da conta (Número do Prontuário hospitalar, Diagnóstico Oncológico, Tratamento Modificador Atual, Funcionalidade PPS de 0 a 100%, Comorbidades, Alergias Medicamentosas e Próxima Consulta). Finaliza com o aceite explícito dos Termos de Uso e Política de Privacidade.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #5 (Prevenção de erros):* Máscaras de digitação para CPF e telefone, validação de campos obrigatórios antes do avanço para a etapa seguinte.
  - *Chunking Cognitivo:* Divisão de um cadastro complexo em 3 etapas lineares com barra de progresso visual.

---

### MÓDULO 2: PORTAL ASSISTENCIAL DA EQUIPE MULTIDISCIPLINAR

#### Tela 03: Painel de Prioridades do Turno (Dashboard Assistencial)
- **Módulo / Contexto:** Portal Assistencial / Gestão Clínica
- **Objetivo Clínico:** Fornecer ao médico e à enfermeira plantonista uma visão situacional em tempo real das prioridades de intervenção do turno nos domicílios.
- **Funcionalidades e Fluxos:**
  - **Indicadores do Turno (KPIs):** Total de pacientes sob acompanhamento, alertas clínicos pendentes, casos críticos (ESAS $\ge 7$) e avisos emitidos.
  - **Fila de Ação Imediata:** Lista dos chamados clínicos e agravamentos não tratados, ordenados por gravidade com badges semafóricos e botão de acesso direto.
  - **Carteira Rápida de Pacientes Recentes:** Acesso imediato aos últimos prontuários manuseados.
  - Botões de cabeçalho rápido para cadastrar novo paciente ou saltar para a Central de Alertas.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #1 (Visibilidade do estado do sistema):* Contadores atualizados que mudam para vermelho na presença de casos críticos que demandam ação clínica rápida.

---

#### Tela 04: Carteira de Pacientes em Acompanhamento Domiciliar
- **Módulo / Contexto:** Portal Assistencial / Carteira de Clientes
- **Objetivo Clínico:** Localização ágil de qualquer paciente em cuidados paliativos domiciliares para consulta de prontuário, conduta médica ou ajuste de receitas.
- **Funcionalidades e Fluxos:**
  - Barra de busca universal instantânea com filtro simultâneo por Nome, Número de Prontuário e Diagnóstico Oncológico.
  - Cartões de paciente com avatar inicial, identificação do diagnóstico oncológico, idade e cuidador responsável.
  - Ação direta de clique no card para transição imediata ao prontuário detalhado.
  - Contador de pacientes localizados em tempo real conforme a digitação.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #7 (Flexibilidade e eficiência de uso):* Busca sem necessidade de recarregar a página, encontrando registros em milissegundos.

---

#### Tela 05: Central de Alertas Clínicos com Priorização Semafórica
- **Módulo / Contexto:** Portal Assistencial / Central de Triagem
- **Objetivo Clínico:** Gestão e resolução de descompensações agudas de sintomas relatadas pelo paciente via ESAS ou Chatbot Zelo.
- **Funcionalidades e Fluxos:**
  - **Distintivo Visual `● Ação Imediata`:** Badge com ponto pulsante para alertas graves ainda em estado "Novo", garantindo atenção máxima imediata.
  - **Classificação Semafórica:** Severidade Alta (Vermelha), Moderada (Âmbar) e Leve (Verde).
  - **Tríade de Ações Clínicas:**
    - `Abrir prontuário`: Transfere para a análise do paciente.
    - `Iniciar revisão`: Altera o status do alerta para "Em revisão", sinalizando aos demais colegas de plantão que o caso já está sob avaliação.
    - `Registrar conduta e tratar`: Conclui o alerta marcando-o como "Tratado" e registrando a conduta no log de auditoria.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #3 (Controle do usuário e liberdade):* Permite avançar e recuar nos estados do alerta com feedback visual e auditável.

---

#### Tela 06: Catálogo Institucional de Fármacos & Protocolos Paliativistas
- **Módulo / Contexto:** Portal Assistencial / Farmacologia Institucional
- **Objetivo Clínico:** Padronizar as opções terapêuticas conforme o Formulário Farmacoterapêutico de Cuidados Paliativos (RENAME / Hospital Erasto Gaertner), prevenindo prescrições fora de protocolo e garantindo segurança no manejo de opioides.
- **Funcionalidades e Fluxos:**
  - **Métricas do Catálogo:** Indicadores de fármacos padronizados, total de doses de resgate disponíveis e diversidade de vias terapêuticas.
  - **Filtros por Sintoma Alvo:** Botões em chip para isolar medicamentos por indicação: *Dor oncológica*, *Constipação*, *Náusea e vômito*, *Ansiedade e insônia* e *Secreção/estertor*.
  - **Cartões Farmacológicos Detalhados:**
    - Nome comercial e princípio ativo em destaque.
    - Badge de via de administração: *Oral (VO)*, *Subcutânea (SC)*, *Transdérmica (TD)*.
    - Insígnia de Resgate SOS (`⚡ Resgate SOS`): Destaca fármacos autorizados para alívio rápido de crises agudas.
    - Caixa de Posologia Padrão: Doses e intervalos recomendados em tipografia tabular (`tabular-nums`).
    - Caixa de Precauções & Orientações Clínicas: Alertas essenciais (ex.: necessidade obrigatória de laxativo osmótico em uso de morfina).
    - Botão de inativação administrativa do fármaco (`Inativar Fármaco`).
  - **Ação `+ Cadastrar Fármaco no Banco`:** Modal para médicos e administradores cadastrarem novas moléculas diretamente na tabela `catalog_medications` da API.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #5 (Prevenção de erros):* A padronização centralizada impede dosagens inadequadas ou vias incompatíveis com o ambiente domiciliar.

---

#### Tela 07: Prontuário Paliativo Longitudinal — Contexto Clínico & Diagnóstico
- **Módulo / Contexto:** Prontuário Médico / Visão Panorâmica
- **Objetivo Clínico:** Reunir os elementos determinantes da trajetória clínica do paciente oncológico em cuidados paliativos.
- **Funcionalidades e Fluxos:**
  - Grade com Diagnóstico Oncológico, Motivo da Indicação Paliativa, Tratamento Modificador Atual (ex.: Quimioterapia Paliativa), Escala PPS (Funcionalidade), Comorbidades, Alergias Medicamentosas, Telefone e Cuidador Responsável.
  - **Barra de Prescrição e Ações Rápidas:** Botões dedicados no topo do prontuário: `+ Prescrever medicamento`, `Enviar diagnóstico`, `Enviar orientação`, `Enviar agendamento`.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #2 (Correspondência entre o sistema e o mundo real):* Estrutura que espelha os prontuários médicos multiprofissionais padrão SUS e CFM.

---

#### Tela 08: Prontuário Paliativo — Curva de Tendência Temporal dos Sintomas (ESAS-r)
- **Módulo / Contexto:** Prontuário Médico / Análise Gráfica Longitudinal
- **Objetivo Clínico:** Permitir que o médico visualize instantaneamente se o paciente está melhorando ou piorando com a conduta instituída ao longo dos dias, correlacionando o manejo da dor, da constipação e de outros sintomas.
- **Funcionalidades e Fluxos:**
  - **Gráfico Interativo em SVG Nativo Responsivo:** Sem dependências pesadas, carregamento em milissegundos e suporte nativo ao Modo Escuro e Alto Contraste.
  - **Zona Crítica (ESAS $\ge 7$):** Faixa destacada no topo do gráfico com linha pontilhada vermelha indicando o limiar de alarme médico.
  - **Eixo X Cronológico:** Ordenação temporal com datas formatadas (`dd/mm`) das avaliações do paciente.
  - **Filtros Rápidos e Chips Individuais:** Alternância para visualizar *Dor & Constipação*, *Sintomas Físicos* ou *Todos os 10 Sintomas*, além de botões individuais por sintoma.
  - **Tooltips Informativos:** Passar o cursor sobre qualquer ponto revela o sintoma, a nota exata e a data/hora completa do registro.
  - **Painel de Variação Clínica Recente ($\Delta$):** Cálculo automático da resposta terapêutica entre a última e a penúltima avaliação:
    - Melhora clínica: $\downarrow -2$ (com destaque verde suave).
    - Agravamento: $\uparrow +3$ (com destaque vermelho de atenção).
    - Estabilidade: $=$ (com tom neutro).
- **Fundamentos de IHC & Nielsen:**
  - *Ergonomia Cognitiva Médica:* Substitui a leitura enfadonha de números por uma curva visual intuitiva, reduzindo o tempo de interpretação clínica para menos de 5 segundos.

---

#### Tela 09: Prontuário Paliativo — Avaliação ESAS Recente e Histórico
- **Módulo / Contexto:** Prontuário Médico / Escalas de Sintomas
- **Objetivo Clínico:** Exibir a foto estática detalhada da última avaliação realizada pelo paciente no domicílio.
- **Funcionalidades e Fluxos:**
  - Grade com os 10 sintomas da Escala ESAS-r: *Dor*, *Cansaço*, *Náusea*, *Tristeza*, *Ansiedade*, *Sonolência*, *Falta de apetite*, *Mal-estar*, *Falta de ar* e *Constipação*.
  - Destaque em negrito e cor diferenciada para sintomas pontuados em $\ge 7/10$.
  - Observação livre descrita pelo paciente no envio da avaliação.
  - Histórico das últimas avaliações anteriores em lista cronológica compacta.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #1 (Visibilidade do estado):* Apresenta o status presente do conforto do paciente.

---

#### Tela 10: Prontuário Paliativo — Mapa Anatômico da Dor e Lesões
- **Módulo / Contexto:** Prontuário Médico / Estomaterapia e Algologia
- **Objetivo Clínico:** Registrar e inspecionar visualmente os pontos topográficos corporais de dor e lesões tumorais relatadas.
- **Funcionalidades e Fluxos:**
  - Exibição estruturada das queixas: região anatômica (ex.: Abdômen inferior, Lombar, Tórax), tipo de ocorrência (dor somática, dor visceral, neuropática ou lesão), intensidade (0 a 10), data e observações de alívio.
- **Fundamentos de IHC & Nielsen:**
  - *Correspondência Anatômica:* Elimina ambiguidades de lateralidade (direita/esquerda) comuns em descrições textuais.

---

#### Tela 11: Prontuário Paliativo — Triagens de Dor do Chatbot Zelo
- **Módulo / Contexto:** Prontuário Médico / Telenfermagem e Telemedicina
- **Objetivo Clínico:** Fornecer à equipe o extrato do diálogo conversacional realizado entre o paciente e o assistente virtual Zelo durante crises de dor.
- **Funcionalidades e Fluxos:**
  - Resumo das queixas: intensidade informada, característica da dor (pontada, queimação, aperto), duração, uso de dose de resgate prescrita e solicitação de contato prioritário com a equipe.
- **Fundamentos de IHC & Nielsen:**
  - *Estruturação de Dados Não Estruturados:* Transforma o diálogo livre em dados clínicos acionáveis.

---

#### Tela 12: Prontuário Paliativo — Prescrições e Autopreenchimento Inteligente
- **Módulo / Contexto:** Prontuário Médico / Prescrição Clínica
- **Objetivo Clínico:** Gerenciar as receitas ativas do paciente e realizar novas prescrições com alta velocidade e segurança posológica.
- **Funcionalidades e Fluxos:**
  - Lista de medicamentos em uso com dose, frequência, via e status.
  - **Modal de Prescrição com Autocomplete do Banco:** O médico seleciona o fármaco padronizado na lista institucional e o sistema preenche automaticamente todos os campos (via, dose usual, posologia, instruções de segurança e se é dose de resgate).
  - Opção integrada de cadastrar um novo medicamento no catálogo do banco caso não esteja padronizado, sem perder os dados da tela.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #5 (Prevenção de erros):* Elimina erros de grafia de dosagens em medicamentos potentes como opioides e sedativos.

---

#### Tela 13: Prontuário Paliativo — Orientações e Evoluções Multiprofissionais
- **Módulo / Contexto:** Prontuário Médico / Registro Clínico
- **Objetivo Clínico:** Manter o histórico de anotações multiprofissionais e enviar orientações educativas de conforto diretamente para o celular do paciente.
- **Funcionalidades e Fluxos:**
  - Registro de notas de evolução com identificação do profissional e plano de cuidado.
  - Registro e envio de orientações (dietéticas, posicionamento no leito, medidas não farmacológicas) com classificação de prioridade (alta, média, baixa).
- **Fundamentos de IHC & Nielsen:**
  - *Rastreabilidade Assistencial:* Registro imutável de condutas para segurança jurídica e continuidade do cuidado.

---

### MÓDULO 3: ÁREA DO PACIENTE E CUIDADOR (APLICAÇÃO WEB RESPONSIVA)

#### Tela 14: Início Acolhedor do Paciente (Home de Conforto)
- **Módulo / Contexto:** Área do Paciente / Ponto Central
- **Objetivo Clínico:** Servir de apoio diário descomplicado para o paciente idoso e seu cuidador no ambiente domiciliar.
- **Funcionalidades e Fluxos:**
  - Saudação personalizada com o primeiro nome do paciente.
  - **Cartão Inteligente de Horários de Medicamentos:**
    - Identifica automaticamente qual é o próximo medicamento a ser tomado.
    - Exibe contagem de medicamentos do dia e o intervalo até o próximo horário.
    - Alerta visual com destaque caso haja medicamento atrasado ou dose urgente.
  - **Cartão de Avisos Recentes da Equipe:** Exibe imediatamente a última orientação emitida pelos profissionais de saúde.
  - **Atalhos Rápidos de Ação:** Botões amplos para *Avaliação ESAS*, *Mapa da Dor*, *Medicações* e *Chatbot Zelo*.
- **Fundamentos de IHC & Nielsen:**
  - *Design Minimalista e Sem Sobrecarga:* O paciente fragilizado encontra o que precisa em 1 toque na tela principal.

---

#### Tela 15: Avaliação Guiada de Sintomas ESAS-r (Passo a Passo)
- **Módulo / Contexto:** Área do Paciente / Instrumento de Coleta
- **Objetivo Clínico:** Coletar a intensidade dos 10 sintomas da Escala de Edmonton (incluindo Constipação) de forma não extenuante para o paciente com câncer.
- **Funcionalidades e Fluxos:**
  - **Formato Wizard (Passo a Passo):** 1 sintoma avaliado por tela com barra de progresso no topo.
  - **Botões Seletores Largos de 0 a 10:** Alvos de toque com feedback tátil e visual nítido ao toque.
  - Âncoras descritivas nas extremidades (ex.: `0 · Sem dor` e `10 · Pior dor possível`).
  - Tela final de revisão consolidada com campo aberto para anotações antes da confirmação.
  - **Gatilho de Alerta Automático:** Ao finalizar, se algum sintoma for $\ge 7$, a API cria instantaneamente um alerta crítico na fila da equipe médica.
- **Fundamentos de IHC & Nielsen:**
  - *Redução de Erro e Cansaço:* Elimina a necessidade de rolar páginas longas e complexas.

---

#### Tela 16: Mapa Anatômico da Dor Interativo com Silhueta Corporal
- **Módulo / Contexto:** Área do Paciente / Topografia da Dor
- **Objetivo Clínico:** Permitir que o paciente ou seu cuidador aponte com exatidão onde dói no corpo.
- **Funcionalidades e Fluxos:**
  - Silhueta anatômica com separação das vistas de **Frente** e **Costas**.
  - Seleção da região anatômica desejada com realce visual.
  - Definição da intensidade (0 a 10) e caracterização da queixa (queimação, aperto, pontada, peso).
  - Envio e integração imediata com o prontuário da equipe.
- **Fundamentos de IHC & Nielsen:**
  - *Metáfora do Mundo Real:* O paciente aponta no desenho da mesma forma que apontaria no próprio corpo durante uma consulta presencial.

---

#### Tela 17: Chatbot Zelo (Apoio Conversacional 24h & Triagem de Dor)
- **Módulo / Contexto:** Área do Paciente / Telessaúde Assistida
- **Objetivo Clínico:** Acolher o paciente em momentos de angústia ou dúvida durante a madrugada e intervalos entre consultas, triando queixas de dor conforme protocolo validado por juízes especialistas.
- **Funcionalidades e Fluxos:**
  - Interface estilo chat de mensagens com balões de diálogo contrastados.
  - Fluxo conversacional interativo com perguntas estruturadas sobre a dor e o uso das doses de resgate.
  - Fornecimento de orientações não farmacológicas (compressas, relaxamento, postura).
  - Emissão de chamado de emergência para a equipe em caso de sinais de alarme clínicos.
- **Fundamentos de IHC & Nielsen:**
  - *Comunicação Humanizada:* Tom de voz respeitoso, empático e adequado a pacientes em fase final de vida.

---

#### Tela 18: Medicações, Receitas Ativas e Instruções de Uso
- **Módulo / Contexto:** Área do Paciente / Adesão Farmacológica
- **Objetivo Clínico:** Orientar o paciente e o familiar sobre como tomar cada medicamento, prevenindo erros de horário e de dose.
- **Funcionalidades e Fluxos:**
  - Listagem dos medicamentos prescritos com nome, dose, horários e recomendações de ingestão.
  - Destaque claro e colorido para as **Doses de Resgate SOS**, com instruções explícitas de quando utilizá-las.
- **Fundamentos de IHC & Nielsen:**
  - *Clareza Instrucional:* Separação nítida entre o que é remédio de horário fixo e o que é remédio para crises de dor.

---

#### Tela 19: Avisos e Orientações da Equipe Médica
- **Módulo / Contexto:** Área do Paciente / Comunicação Educativa
- **Objetivo Clínico:** Centralizar as recomendações de cuidados paliativos domiciliares enviadas pelos profissionais.
- **Funcionalidades e Fluxos:**
  - Cartões com título da orientação, categoria (cuidados, alimentação, medicamentos), nível de prioridade e texto explicativo completo.
- **Fundamentos de IHC & Nielsen:**
  - *Disponibilidade Permanente:* O cuidador pode reler as instruções da enfermeira quantas vezes precisar.

---

### MÓDULO 4: CENTRAL DE ACESSIBILIDADE E INCLUSÃO UNIVERSAL

#### Tela 20: Painel de Acessibilidade Multitema & Escala Tipográfica
- **Módulo / Contexto:** Configurações de Acessibilidade / Universal
- **Objetivo Clínico:** Garantir a autonomia e usabilidade do sistema para pacientes idosos com catarata, retinopatia, glaucoma, daltonismo ou perda de sensibilidade ao contraste.
- **Funcionalidades e Fluxos:**
  - **5 Modos Visuais Alternáveis em Tempo Real:**
    1. *Padrão (Claro Humanizado):* Fundo creme suave com verde floresta.
    2. *Modo Escuro (Noturno Suave):* Fundo `#121916` sem brilho excessivo.
    3. *Alto Contraste (WCAG 2.2 AAA):* Fundo preto `#000000`, textos brancos `#ffffff` e botões em amarelo ouro `#ffff00` (contraste > 19:1).
    4. *Daltonismo Protanopia / Deuteranopia:* Esquema azul/laranja.
    5. *Daltonismo Tritanopia:* Esquema violeta/rosa terra.
  - **Ajuste Dinâmico de Tamanho de Fonte:**
    - Tamanho Normal (16px base)
    - Tamanho Ampliado (19px base)
    - Tamanho Muito Grande (22px base)
  - Persistência imediata da preferência em `localStorage` para navegações futuras.
- **Fundamentos de IHC & Nielsen:**
  - *Heurística #7 (Flexibilidade de uso):* O usuário adapta o sistema à sua condição fisiológica individual.

---

## 3. Síntese Técnica e Arquitetural do Sistema Real

| Componente | Tecnologia | Responsabilidade Principal |
| :--- | :--- | :--- |
| **Backend API** | FastAPI / Python 3.14 | Regras clínicas de paliativos, cálculo do escore ESAS, triagem de dor, autenticação JWT e API RESTful. |
| **Persistência de Dados** | SQLAlchemy 2.0 / SQLite (compatível com PostgreSQL) | Modelagem relacional (`User`, `ESASAssessment`, `PainMapEntry`, `CatalogMedication`, `ClinicalAlert`, etc.). |
| **Frontend Web** | React 18 / TypeScript 5 / Vite | Aplicação de página única (SPA) totalmente responsiva para desktop, tablet e celular com design system nativo. |
| **Design System & A11y** | CSS3 Nativo com Tokens | 5 temas de acessibilidade WCAG 2.2 AAA sem dependência de bibliotecas de componentes externas pesadas. |
| **Testes Automatizados** | Pytest / AnyIO | Suíte completa com 41 testes cobrindo autenticação, RBAC médico, cálculo ESAS e catálogo institucional. |
| **Automação de Execução** | `iniciar_zelo.bat` / `iniciar_zelo.sh` | Scripts de inicialização local com detecção automática de portas, ambientes virtuais e dependências. |

---

## 4. Conclusão da Documentação

A plataforma **Zelo** atende integralmente aos requisitos propostos para a entrega acadêmica e profissional:
1. **Rigor Científico:** Incorpora fielmente a monografia e os referenciais da oncologia paliativa (ESAS-r com 10 sintomas, PPS, protocolos RENAME).
2. **Qualidade de Software:** Arquitetura limpa, desacoplamento entre frontend e backend, código 100% tipado em TypeScript e Python, e suíte de testes aprovada.
3. **Engenharia de Usabilidade & Acessibilidade:** Conformidade estrita com as diretrizes internacionais WCAG 2.2 AA/AAA e as Heurísticas de Nielsen, garantindo dignidade ao idoso e agilidade à equipe médica.
