import os
import shutil
from pathlib import Path
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

BASE_DIR = Path(__file__).resolve().parent
IMG_DIR = BASE_DIR / "docs" / "telas_sistema"
BRAIN_DIR = Path(r"C:\Users\teste\.gemini\antigravity\brain\ced5692f-64fe-427e-be46-c080be18c9e0")
OUT_DOCX_LOCAL = BASE_DIR / "Zelo_Documento_Telas_e_Funcionalidades.docx"
OUT_DOC_LOCAL = BASE_DIR / "Zelo_Documento_Telas_e_Funcionalidades.doc"
OUT_DOCX_BRAIN = BRAIN_DIR / "Zelo_Documento_Telas_e_Funcionalidades.docx"
OUT_DOC_BRAIN = BRAIN_DIR / "Zelo_Documento_Telas_e_Funcionalidades.doc"
OUT_MD_BRAIN = BRAIN_DIR / "documento_telas_e_funcionalidades_zelo.md"

DOWNLOADS_DIR = Path.home() / "Downloads"
DESKTOP_DIR = Path.home() / "OneDrive" / "Área de Trabalho"
if not DESKTOP_DIR.exists():
    DESKTOP_DIR = Path.home() / "Desktop"

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = Document()
    
    # Configuração de Margens ABNT (2,5 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.98)
        section.bottom_margin = Inches(0.98)
        section.left_margin = Inches(0.98)
        section.right_margin = Inches(0.98)
        
        # Cabeçalho e Rodapé
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "Sistema Zelo · Catálogo Técnico de Telas e Funcionalidades do Sistema Real"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.style.font.name = "Arial"
        hp.style.font.size = Pt(8.5)
        hp.style.font.color.rgb = RGBColor(120, 120, 120)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Zelo · Plataforma de Saúde Digital para Cuidados Paliativos Oncológicos Domiciliares"
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fp.style.font.name = "Arial"
        fp.style.font.size = Pt(8.5)
        fp.style.font.color.rgb = RGBColor(120, 120, 120)

    # Estilos Base
    styles = doc.styles
    normal_style = styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # CAPA / TÍTULO PRINCIPAL
    # =========================================================================
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(36)
    title_p.paragraph_format.space_after = Pt(12)
    title_p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("SISTEMA ZELO: CATÁLOGO TÉCNICO DE TELAS E FUNCIONALIDADES DO SISTEMA REAL")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(9, 99, 93) # Verde Petróleo Zelo

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(24)
    sub_p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Documentação das Telas do Sistema em Execução, Fundamentos de IHC para Idosos, Diretrizes WCAG 2.2 AA/AAA e Integração Clínica Multiprofissional")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(12)
    sub_run.font.color.rgb = RGBColor(71, 85, 105)

    # Box de Metadados
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Projeto de Aplicação:", "Sistema Web Zelo - Cuidados Paliativos Oncológicos Domiciliares"),
        ("Público-Alvo:", "Pessoas Idosas em Cuidados Paliativos, Cuidadores Familiares e Equipe Multiprofissional"),
        ("Fundamentação Teórica:", "Interação Humano-Computador (IHC), Heurísticas de Nielsen e Acessibilidade WCAG 2.2"),
        ("Ambiente e Implementação:", "Sistema Web Responsivo (HTML5/CSS3/JavaScript Modular) e API RESTful FastAPI")
    ]
    for i, (k, v) in enumerate(meta_data):
        row = meta_tbl.rows[i]
        c1, c2 = row.cells[0], row.cells[1]
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(3)
        r1 = p1.add_run(k)
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_after = Pt(3)
        r2 = p2.add_run(v)
        r2.font.size = Pt(9.5)
        set_cell_background(c1, "F4F8F7")
        set_cell_background(c2, "FFFFFF")
        set_cell_margins(c1, 60, 60, 100, 100)
        set_cell_margins(c2, 60, 60, 100, 100)

    doc.add_page_break()

    # =========================================================================
    # SEÇÃO 1: PRINCÍPIOS DE IHC E ACESSIBILIDADE PARA IDOSOS NO ZELO
    # =========================================================================
    h1 = doc.add_heading("1. Fundamentos de IHC e Engenharia de Acessibilidade no Sistema Zelo", level=1)
    h1.style.font.color.rgb = RGBColor(9, 99, 93)

    p = doc.add_paragraph(
        "O desenvolvimento do Sistema Zelo foi orientado pelos princípios clássicos da Interação Humano-Computador (IHC) "
        "e do Design Thinking com foco especializado na gerontologia. O público prioritário é composto por pessoas idosas com "
        "doenças oncológicas avançadas, em sua grande maioria fragilizadas por caquexia, dor crônica, fadiga intensa e declínio funcional "
        "progressivo, além de seus cuidadores familiares (frequentemente cônjuges também idosos ou filhos adultos)."
    )

    doc.add_heading("1.1 Requisitos Críticos de IHC para o Público Idoso", level=2)
    bullets = [
        ("Dimensão e Espaçamento de Alvos Táteis (Ergonomia Motora):", 
         "Todos os botões e áreas interativas do fluxo mobile possuem dimensão mínima de 56x56 pixels no fluxo do paciente (e 48x48 pixels no módulo assistencial desktop/tablet), com espaçamento livre de segurança de pelo menos 12 pixels. Esse dimensionamento neutraliza falhas de acionamento decorrentes de tremores senis, artrite ou instabilidade motora."),
        
        ("Hierarquia Tipográfica e Legibilidade Senil (Visão Geriátrica):", 
         "Utilização da tipografia Nunito com corpo de texto base ampliado (16px a 18px), hastes bem diferenciadas e cantos suaves. Foi implementado o escalonamento dinâmico em três níveis na raiz do documento: Padrão (16px), Grande (+18%, 19px) e Muito Grande (+37%, 22px), escalonando proporcionalmente todas as unidades rem e alvos interativos."),
         
        ("Razão de Contraste e Modo de Alto Contraste (WCAG 2.2 AAA):", 
         "Em contraste padrão, as cores atendem à taxa mínima de 7:1 contra o fundo. Adicionalmente, foi implementado o Modo de Alto Contraste Verdadeiro com fundo preto absoluto (#000000), tipografia amarela (#FFFF00) e branca (#FFFFFF) e bordas de 2px de espessura amarela, proporcionando contraste superior a 15:1 para usuários com catarata, glaucoma ou baixa acuidade visual severa."),
         
        ("Redução de Sobrecarga Cognitiva e Passos Unidirecionais:", 
         "A avaliação de sintomas da escala ESAS foi estruturada em um fluxo passo a passo linear (um sintoma por tela), eliminando a rolagem vertical excessiva e formulários longos que provocam desorientação e fadiga cognitiva em pessoas idosas."),
         
        ("Prevenção Ativa de Perda de Dados (Heurística de Nielsen #5):", 
         "Sistemas paliativos não podem exigir que pacientes com dor repitam preenchimentos por fechamento acidental de tela. O sistema implementa confirmação explícita de saída e salvamento automático das etapas já concluídas no armazenamento local do navegador."),
         
        ("Ausência Total de Emoticons e Linguagem Infantilizada:", 
         "Em consonância com a bioética dos cuidados paliativos, a interface preserva a dignidade do paciente adulto/idoso, utilizando escalas numéricas validadas (0 a 10), âncoras semânticas descritivas e linguagem acolhedora, respeitosa e clara.")
    ]
    for title, desc in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        r_title = bp.add_run(f"{title} ")
        r_title.bold = True
        r_desc = bp.add_run(desc)

    doc.add_page_break()

    # =========================================================================
    # CATÁLOGO DE TELAS DO SISTEMA REAL
    # =========================================================================
    h1 = doc.add_heading("2. Catálogo Completo de Telas do Sistema Real em Execução", level=1)
    h1.style.font.color.rgb = RGBColor(9, 99, 93)

    p = doc.add_paragraph(
        "A seguir, são apresentadas as capturas reais de tela geradas a partir do sistema web funcional em execução "
        "(arquivos HTML/CSS/JS implementados), acompanhadas da especificação detalhada de suas funcionalidades, objetivos "
        "clínicos e preceitos de IHC implementados."
    )

    SCREENS_INFO = [
        # --- BLOCO 1: PORTAL E AUTENTICAÇÃO ---
        {
            "num": "01",
            "img": "01_portal_acesso.png",
            "title": "Portal Central de Acesso e Seleção de Perfil",
            "tipo": "Desktop / Central",
            "largura": Inches(6.0),
            "objetivo": "Ponto de entrada único do sistema Zelo que permite direcionar o usuário para o seu ambiente específico: Portal da Equipe Assistencial ou Aplicativo do Paciente e Cuidador.",
            "funcionalidades": [
                "Cards de direcionamento com alvos visuais amplos e contraste superior a 8:1.",
                "Card 'Equipe de Saúde e Médica' direciona para a área de prontuário, triagem populacional e acompanhamento clínico.",
                "Card 'Paciente e Cuidador Familiar' direciona para a interface móvel acolhedora com recursos de acessibilidade.",
                "Acesso direto à autenticação unificada e barra superior de apoio com telefone de plantão 24h."
            ],
            "ihc": "Implementa a Heurística #2 de Nielsen (Correspondência entre o sistema e o mundo real) ao separar claramente os papéis de cuidado. Apresenta alvos amplos com estados de foco evidentes para navegação por teclado (Tab) e leitores de tela."
        },
        {
            "num": "02",
            "img": "02_login_unificado.png",
            "title": "Autenticação Unificada com Perfis Clínicos e Credenciais de Teste",
            "tipo": "Desktop / Segurança",
            "largura": Inches(5.8),
            "objetivo": "Garantir o controle de acesso seguro baseado em papéis (RBAC - Role-Based Access Control) em estrita conformidade com a LGPD e a confidencialidade do prontuário médico.",
            "funcionalidades": [
                "Formulário seguro de autenticação com validação de campos obrigatórios em tempo real.",
                "Botões de atalho com credenciais pré-configuradas para avaliação e banca examinadora (Administrador, Médico Paliativista, Enfermeira e Paciente/Cuidador).",
                "Fallback automático resiliente: autentica via API RESTful FastAPI e, na ausência de rede, utiliza armazenamento local seguro.",
                "Exibição clara de mensagens de erro sem jargões de programação (Heurística #9 de Nielsen)."
            ],
            "ihc": "Reduz o esforço de memória (Heurística #6: Reconhecer ao invés de lembrar) ao fornecer atalhos de teste com um clique para cada perfil profissional. Campos de entrada com rótulos semânticos visíveis e foco nítido."
        },

        # --- BLOCO 2: MÓDULO ASSISTENCIAL ---
        {
            "num": "03",
            "img": "03_assistencial_dashboard.png",
            "title": "Painel Multidisciplinar Desktop (Dashboard Assistencial)",
            "tipo": "Desktop / Assistencial",
            "largura": Inches(6.2),
            "objetivo": "Proporcionar à equipe médica e de enfermagem uma visão panorâmica e em tempo real de toda a coorte de pacientes monitorados no domicílio, priorizando intervenções imediatas.",
            "funcionalidades": [
                "Painel de Indicadores Clínicos (KPIs): Total de pacientes ativos, alertas críticos abertos, taxa de resposta ESAS em 24h e média de dor da coorte.",
                "Estratificação Funcional PPS (Palliative Performance Scale): Gráfico de barras categorizando pacientes em faixas de autonomia (10-30%, 40-60%, 70-100%).",
                "Tabela de Alertas Críticos Prioritários: Pacientes com dor intensa (escore 8 a 10) destacados em vermelho para contato telefônico ou visita domiciliar imediata.",
                "Menu de navegação lateral persistente e status de conexão com o banco de dados."
            ],
            "ihc": "Heurística #1 de Nielsen (Visibilidade do estado do sistema): a equipe visualiza instantaneamente a gravidade de cada paciente através de códigos de cores semânticos (vermelho, âmbar e verde) sempre associados a rótulos de texto explícitos."
        },
        {
            "num": "04",
            "img": "04_assistencial_pacientes.png",
            "title": "Gestão e Lista de Pacientes em Acompanhamento Domiciliar",
            "tipo": "Desktop / Assistencial",
            "largura": Inches(6.2),
            "objetivo": "Listagem nominal de pacientes em cuidados paliativos domiciliares com filtros clínicos e acesso direto ao prontuário individual.",
            "funcionalidades": [
                "Filtros de busca rápida por nome, prontuário, diagnóstico oncológico (CID-10) e grau de urgência.",
                "Badges de estado clínico: 'Novo registro', 'Em revisão pela enfermagem' e 'Tratado'.",
                "Identificação do cuidador familiar responsável e do horário do último registro enviado da residência.",
                "Ações diretas por linha: 'Abrir Prontuário', 'Prescrições' e 'Histórico de Alertas'."
            ],
            "ihc": "Organização em tabela de alta densidade visual com tipografia legível e contraste reforçado. Atende ao princípio de escaneabilidade visual, permitindo à equipe localizar um paciente em menos de 3 segundos."
        },
        {
            "num": "05",
            "img": "05_assistencial_prontuario_esas.png",
            "title": "Prontuário Paliativo - Histórico ESAS e Gráfico Temporal de Sintomas",
            "tipo": "Desktop / Prontuário",
            "largura": Inches(6.2),
            "objetivo": "Apresentar a evolução longitudinal dos 9 sintomas da Escala de Avaliação de Sintomas de Edmonton (ESAS), permitindo correlacionar a eficácia da conduta médica com a resposta do paciente.",
            "funcionalidades": [
                "Cabeçalho do prontuário com dados sociodemográficos, CID-10, capacidade funcional PPS (70%) e cuidador vinculado.",
                "Exibição dos 9 sintomas avaliados hoje (dor, cansaço, náusea, depressão, ansiedade, sonolência, apetite, mal-estar e falta de ar) com barras coloridas proporcionais.",
                "Gráfico visual de evolução temporal da dor dos últimos 3 registros domiciliares.",
                "Histórico completo com data e hora de cada envio realizado pelo domicílio."
            ],
            "ihc": "Representação gráfica de alto contraste que facilita a identificação visual de tendências de piora antes que se convertam em crises de urgência hospitalar (ergonomia cognitiva médica)."
        },
        {
            "num": "06",
            "img": "06_assistencial_prontuario_triagem.png",
            "title": "Prontuário Paliativo - Respostas de Dor e Triagem Clínica do Script Validado",
            "tipo": "Desktop / Prontuário",
            "largura": Inches(6.2),
            "objetivo": "Exibir as respostas fornecidas pelo paciente durante o diálogo com o Chatbot Zelo (baseado no script validado por juízes especialistas), permitindo detalhar a semiologia da dor.",
            "funcionalidades": [
                "Quadro de características da dor: Tipo/caráter (queimação, pontada, peso), intensidade numérica (0 a 10) e duração.",
                "Detecção automática de sinais de alarme clínicos (urgência médica para compressão medular ou queda com trauma).",
                "Verificação da ingestão de dose de resgate de analgésico e resposta obtida.",
                "Status de conduta sugerida pelo algoritmo de triagem."
            ],
            "ihc": "Consolida dados complexos de diálogo conversacional em um sumário estruturado de fácil leitura, minimizando o tempo necessário para o médico tomar decisões terapêuticas seguras."
        },
        {
            "num": "07",
            "img": "07_assistencial_prontuario_prescricoes.png",
            "title": "Prontuário Paliativo - Prescrições Médicas e Doses de Resgate",
            "tipo": "Desktop / Prontuário",
            "largura": Inches(6.2),
            "objetivo": "Módulo de prescrição farmacológica especializado em cuidados paliativos, destacando a medicação de uso contínuo e a medicação de resgate para dor episódica (breakthrough pain).",
            "funcionalidades": [
                "Tabela de medicamentos ativos: Princípio ativo (Morfina, Lactulose, Haloperidol), via de administração, dose e horários.",
                "Destaque em card vermelho para a 'Dose de Resgate': Instruções claras de dosagem, intervalo mínimo entre doses e número máximo de resgates em 24h.",
                "Botão '+ Adicionar Prescrição' para inclusão ágil de novos fármacos.",
                "Histórico de adesão e horários em que o paciente efetivamente confirmou o uso no domicílio."
            ],
            "ihc": "Heurística #5 de Nielsen (Prevenção de Erros): A separação visual evidente entre medicação horária contínua e medicação de resgate previne erros fatais de sobredosagem de opioides."
        },
        {
            "num": "08",
            "img": "08_assistencial_prontuario_mapa_dor.png",
            "title": "Prontuário Paliativo - Mapeamento Corporal de Dor e Lesões",
            "tipo": "Desktop / Prontuário",
            "largura": Inches(6.2),
            "objetivo": "Visualização anatômica das regiões corporais indicadas pelo paciente ou cuidador como sítios de dor, feridas neoplásicas ou edemas.",
            "funcionalidades": [
                "Esquema anatômico do corpo humano (visão anterior e posterior) com marcações visuais dos locais acometidos.",
                "Card lateral descrevendo a intensidade e o tipo de desconforto associado a cada região (ex: coluna lombar, abdômen, membro inferior).",
                "Registro de lesões por pressão ou feridas tumorais com recomendações para a enfermagem estomaterapeuta.",
                "Registro da evolução espacial da dor ao longo do tratamento."
            ],
            "ihc": "Utiliza a Heurística #2 de Nielsen (Correspondência entre o sistema e o mundo real) ao substituir descrições puramente textuais por um mapa visual intuitivo e compartilhado entre paciente e equipe."
        },
        {
            "num": "09",
            "img": "09_assistencial_prontuario_evolucoes.png",
            "title": "Prontuário Paliativo - Evoluções da Equipe Multidisciplinar",
            "tipo": "Desktop / Prontuário",
            "largura": Inches(6.2),
            "objetivo": "Registro do prontuário multiprofissional contendo notas de evolução clínica da medicina, enfermagem, psicologia e serviço social.",
            "funcionalidades": [
                "Linha do tempo de anotações com identificação do profissional, registro profissional (ex: CRM, COREN) e especialidade.",
                "Classificação do tipo de evolução: Visita domiciliar, contato telefônico de monitoramento ou round multidisciplinar.",
                "Botão para abertura do modal '+ Nova Evolução Clínica'.",
                "Registro de diretivas antecipadas de vontade e alinhamento de metas de cuidado."
            ],
            "ihc": "Facilita a comunicação interprofissional sem ruídos, assegurando continuidade assistencial e rastreabilidade total de todas as condutas tomadas no caso."
        },
        {
            "num": "10",
            "img": "10_assistencial_alertas.png",
            "title": "Central de Alertas Clínicos com Priorização Semafórica",
            "tipo": "Desktop / Assistencial",
            "largura": Inches(6.2),
            "objetivo": "Centro de triagem de incidentes clínicos e alertas automáticos gerados pelo sistema a partir dos registros enviados pelos pacientes.",
            "funcionalidades": [
                "Categorização semafórica: Vermelho (Emergência/Dor Severa), Âmbar (Atenção/Sintoma Moderado) e Verde (Resolvido).",
                "Filtros rápidos por status: 'Todos', 'Abertos/Pendentes' e 'Resolvidos'.",
                "Ação rápida de 'Atender Alerta' que abre o modal para registrar o desfecho do contato com a família.",
                "Detecção de chamadas urgentes e sinais de alarme farmacológico."
            ],
            "ihc": "Reduz o estresse cognitivo da equipe de enfermagem de plantão ao classificar os pacientes por gravidade objetiva, eliminando o risco de negligenciar casos críticos."
        },
        {
            "num": "11",
            "img": "11_assistencial_acompanhamento.png",
            "title": "Monitoramento Longitudinal e Linha do Tempo Assistencial",
            "tipo": "Desktop / Assistencial",
            "largura": Inches(6.2),
            "objetivo": "Ferramenta de análise de tendências clínicas e acompanhamento da trajetória do paciente ao longo de semanas e meses.",
            "funcionalidades": [
                "Gráficos de evolução temporal comparando escores de múltiplos sintomas (dor x náusea x sonolência).",
                "Registro de eventos marcantes: Mudança de posologia, inclusão de dose de resgate, consultas presenciais.",
                "Métricas de estabilidade do quadro paliativo.",
                "Exportação de dados para relatórios clínicos e reuniões de equipe."
            ],
            "ihc": "Proporciona visão analítica de alto nível, permitindo à equipe avaliar se as metas terapêuticas de conforto e alívio do sofrimento estão sendo atingidas de forma sustentada."
        },
        {
            "num": "12",
            "img": "12_assistencial_simulador_triagem.png",
            "title": "Simulador Clínico do Algoritmo de Triagem e Script de Dor",
            "tipo": "Desktop / Ferramenta",
            "largura": Inches(6.2),
            "objetivo": "Ambiente de testes clínicos e validação para que médicos e enfermeiros testem todos os nós decisórios do script de triagem e do chatbot de dor.",
            "funcionalidades": [
                "Configuração manual de escore de dor (0 a 10), tempo de evolução e presença de sinais de alarme.",
                "Simulação imediata do fluxo conversacional e da resposta que o paciente receberá no domicílio.",
                "Exibição da regra clínica disparada e da conduta farmacológica recomendada.",
                "Ferramenta de treinamento para novos residentes e profissionais da equipe multiprofissional."
            ],
            "ihc": "Transparência algorítmica: permite aos profissionais de saúde auditar a inteligência do sistema e garantir que o chatbot opere estritamente dentro dos limites da segurança do paciente."
        },

        # --- BLOCO 3: MÓDULO DO PACIENTE E CUIDADOR FAMILIAR ---
        {
            "num": "13",
            "img": "13_mobile_login_paciente.png",
            "title": "Acesso Acolhedor do Cuidador e Paciente",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Garantir uma entrada simplificada e sem atritos para o paciente idoso ou cuidador familiar, eliminando senhas complexas que geram exclusão digital.",
            "funcionalidades": [
                "Identidade visual humanizada do Zelo em alta resolução.",
                "Entrada facilitada com número de telefone ou CPF e botão de acesso rápido.",
                "Barra de acessibilidade com ajuste imediato de fonte e alto contraste.",
                "Canal telefônico de apoio direto visível na própria tela de acesso."
            ],
            "ihc": "Minimiza barreiras cognitivas de entrada. O botão de login possui 56px de altura e contraste cromático superior a 9:1, viabilizando o acesso de usuários com pouca familiaridade tecnológica."
        },
        {
            "num": "14",
            "img": "14_mobile_selecionar_paciente.png",
            "title": "Seleção de Paciente Vinculado ao Cuidador Familiar",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Permitir que cuidadores familiares que cuidam de mais de um idoso (ou cuidadores profissionais de home care) selecionem com precisão qual paciente estão avaliando.",
            "funcionalidades": [
                "Cards amplos de pacientes com nome completo, idade e relação de parentesco.",
                "Indicação do último registro de sintomas enviado para a equipe.",
                "Botões de toque largos de 80px de altura com ícones identificadores.",
                "Acesso direto às configurações de acessibilidade no topo."
            ],
            "ihc": "Previne o erro de trocar registros clínicos entre pacientes diferentes (Heurística #5 de Nielsen), confirmando visualmente a foto/iniciais e o nome do idoso assistido."
        },
        {
            "num": "15",
            "img": "15_mobile_paciente_home.png",
            "title": "Tela Inicial do Paciente (Home Acolhedora com Botões de 80px)",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Centro de controle diário do paciente e cuidador, oferecendo acesso rápido às funções essenciais sem rolagem confusa.",
            "funcionalidades": [
                "Mensagem acolhedora personalizada: 'Como o senhor está se sentindo hoje, Sr. Leovegildo?'.",
                "Quatro grandes botões verticais de toque (altura mínima de 80px cada):",
                "1. 'Registrar Sintomas de Hoje (ESAS)': Formulário passo a passo diário.",
                "2. 'Conversar com o Chatbot Zelo (Dor)': Apoio imediato e triagem.",
                "3. 'Medicamentos e Doses': Consulta de horários e registro de resgate.",
                "4. 'Local de Dor ou Lesão': Mapa anatômico interativo.",
                "Botão de emergência em destaque: 'Ligar para o Plantão de Enfermagem'.",
                "Barra de navegação inferior com ícones e rótulos textuais permanentes."
            ],
            "ihc": "Ergonomia motora geriátrica de excelência. Botões ocupam 100% da largura útil da tela móvel, eliminando o erro de toque em telas sensíveis. O botão de chamada telefônica utiliza o protocolo nativo 'tel:' para discagem imediata com um único toque."
        },
        {
            "num": "16",
            "img": "16_mobile_paciente_esas.png",
            "title": "Registro Guiado de Sintomas ESAS (Alvos de Toque de 56px e Escala 0 a 10)",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Coleta diária padronizada dos 9 sintomas da Escala de Edmonton sem sobrecarregar a memória nem cansar o idoso fragilizado.",
            "funcionalidades": [
                "Navegação passo a passo unidirecional: 1 sintoma por tela (Passos de 1 a 9).",
                "Escala visual numérica de 0 a 10 com âncoras semânticas descritivas (ex: '0 = Nenhuma Dor' e '10 = Pior Dor Possível').",
                "Botões seletores circulares de 56x56 pixels com destaque visual nítido ao toque.",
                "Barra de progresso superior indicando em qual pergunta o paciente se encontra.",
                "Botões 'Anterior' e 'Próximo Sintoma' largos e bem separados.",
                "Tela final de revisão de todos os sintomas antes do envio definitivo para o hospital."
            ],
            "ihc": "Elimina totalmente formulários longos em favor do princípio de fragmentação da informação (Chunking). Os alvos de 56px atendem com folga às diretrizes WCAG 2.2 AAA para pessoas com tremores motores."
        },
        {
            "num": "17",
            "img": "17_mobile_paciente_chatbot.png",
            "title": "Chatbot Zelo (Script Validado por Juízes para Avaliação e Alívio da Dor)",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Assistente virtual acolhedor que executa rigorosamente o script clínico validado por juízes especialistas para avaliar dor, verificar resgate farmacológico e orientar medidas não farmacológicas de alívio.",
            "funcionalidades": [
                "Balões de diálogo de alta legibilidade diferenciando mensagens da Zelo e do paciente.",
                "Opções de resposta estruturadas por botões de toque rápido (evitando digitação pelo teclado virtual que frustra o idoso).",
                "Triagem de dor em 4 níveis clínicos de conduta (C1: Sem dor / C2: Dor controlada / C3: Dor moderada com resgate / C4: Alerta crítico com contato da enfermagem).",
                "Orientações imediatas de conforto: Repouso, compressas térmicas orientadas e posição ergonômica no leito."
            ],
            "ihc": "Design conversacional humanizado. Não exige digitação manual: o paciente responde tocando em opções pré-formatadas ('Sim', 'Não', 'Já tomei o remédio', 'A dor continua forte')."
        },
        {
            "num": "18",
            "img": "18_mobile_paciente_medicamentos.png",
            "title": "Medicamentos do Dia e Registro da Dose de Resgate",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Orientar o paciente e cuidador quanto aos medicamentos prescritos pelo médico paliativista, prevenindo esquecimentos e controlando as doses de alívio da dor.",
            "funcionalidades": [
                "Card de emergência em destaque vermelho: 'Dor Aguda Intensa? - Utilizar Dose de Resgate'.",
                "Botão de acionamento: 'Registrar Tomada de Dose de Resgate' com registro automático de horário.",
                "Lista de medicamentos do dia divididos por períodos: Manhã, Tarde e Noite.",
                "Indicação clara da função de cada remédio em linguagem acessível (ex: 'Para controle da dor', 'Para proteger o estômago', 'Para o intestino')."
            ],
            "ihc": "Heurística de Nielsen #6 (Reconhecimento ao invés de memorização): Associa o nome comercial do remédio à sua indicação de uso em linguagem leiga, empoderando o cuidador familiar e prevenindo confusões farmacológicas."
        },
        {
            "num": "19",
            "img": "19_mobile_paciente_local_dor.png",
            "title": "Esquema Anatômico Corporal Interativo para Indicação de Dor",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Permitir que o paciente aponte visualmente no corpo onde dói, onde surgiu uma nova mancha, inchaço ou lesão de pele.",
            "funcionalidades": [
                "Alternância entre Visão da Frente e Visão das Costas.",
                "Grade de botões anatômicos táteis de grande dimensão: Cabeça/Pescoço, Tórax, Coluna Lombar, Abdômen, Braços e Pernas.",
                "Seleção do tipo de desconforto: 'Dor', 'Inchaço' ou 'Ferida / Pele'.",
                "Confirmação visual da região marcada e envio sincronizado para o prontuário da equipe."
            ],
            "ihc": "Comunicação visual direta. Essencial para pacientes com afasia, disartria ou idosos com dificuldade de descrever verbalmente termos médicos complexos."
        },
        {
            "num": "20",
            "img": "20_mobile_paciente_notificacoes.png",
            "title": "Central de Avisos e Orientações da Equipe Paliativa",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Canal de comunicação assíncrono onde a família recebe avisos de visitas da equipe, lembretes de medicação e mensagens de acolhimento.",
            "funcionalidades": [
                "Cards de mensagens categorizados por severidade (Informativo, Atenção e Urgente).",
                "Confirmação de recebimento e visualização pela família.",
                "Avisos de agendamento de visita domiciliar de enfermagem ou médica.",
                "Orientações preventivas de cuidados com a pele e nutrição paliativa."
            ],
            "ihc": "Reduz a ansiedade e o sentimento de abandono da família no domicílio, reforçando a sensação de suporte contínuo da equipe de saúde."
        },
        {
            "num": "21",
            "img": "21_mobile_paciente_configuracoes.png",
            "title": "Perfil, Ajustes de Acessibilidade e Termos LGPD",
            "tipo": "Mobile / Paciente",
            "largura": Inches(3.0),
            "objetivo": "Configuração personalizada das preferências visuais do aplicativo e exibição dos dados de prontuário e consentimento informado.",
            "funcionalidades": [
                "Seletor do Tamanho de Texto: 'Padrão', 'Grande (+18%)' e 'Muito Grande (+37%)'.",
                "Chave de Ativação do 'Modo Alto Contraste': Alterna dinamicamente entre o tema claro e o tema escuro de alto contraste (preto puro e amarelo).",
                "Exibição dos dados do paciente e cuidador cadastrados.",
                "Acesso ao termo de privacidade e proteção de dados clínicos (LGPD)."
            ],
            "ihc": "Autonomia do usuário (Heurística #3 de Nielsen): O paciente ou cuidador tem o poder de adaptar a interface às suas limitações visuais imediatas com um simples toque, sem reiniciar a aplicação."
        },

        # --- BLOCO 4: ACESSIBILIDADE ATIVA ---
        {
            "num": "22",
            "img": "22_mobile_acessibilidade_alto_contraste_perfil.png",
            "title": "Demonstração do Sistema Real em Modo Alto Contraste (Tela de Ajustes)",
            "tipo": "Acessibilidade WCAG AAA",
            "largura": Inches(3.0),
            "objetivo": "Comprovar a execução funcional do Modo Alto Contraste implementado em código, atendendo aos rigorosos critérios da norma WCAG 2.2 AAA.",
            "funcionalidades": [
                "Fundo preto puro (#000000) e superfície escura (#0A0A0A) que reduzem o ofuscamento visual e consumo de energia.",
                "Tipografia amarela pura (#FFFF00) para títulos, rótulos e elementos ativos, com razão de contraste superior a 15:1.",
                "Tipografia branca (#FFFFFF) para textos secundários e descritivos.",
                "Bordas demarcatórias amarelas de 2px de espessura em todos os cards e campos interativos.",
                "Badge em destaque amarelo confirmando o estado 'Ativado (Fundo Preto e Amarelo)'."
            ],
            "ihc": "Atendimento pleno a idosos com baixa acuidade visual severa, catarata congênita ou senil e retinopatia diabética. A tipografia amarela sobre fundo preto é o padrão ouro de legibilidade ergonômica em tecnologia assistiva mundial."
        },
        {
            "num": "23",
            "img": "23_mobile_acessibilidade_alto_contraste_home.png",
            "title": "Demonstração do Sistema Real em Modo Alto Contraste (Tela Inicial)",
            "tipo": "Acessibilidade WCAG AAA",
            "largura": Inches(3.0),
            "objetivo": "Evidenciar como todos os elementos da tela inicial (cards de ação, cabeçalho e menu de navegação) se adaptam automaticamente ao alto contraste.",
            "funcionalidades": [
                "Cards de navegação com bordas amarelas grossas e ícones de alto contraste.",
                "Texto de boas-vindas legível a longa distância.",
                "Barra inferior de navegação com fundo preto e indicador ativo amarelo.",
                "Botões superiores 'A+ Texto' e 'Contraste' em destaque permanente no cabeçalho."
            ],
            "ihc": "Consistência e Padrões (Heurística #4 de Nielsen): Toda a aplicação responde homogeneamente à troca de tema, garantindo que o usuário nunca seja surpreendido por telas brancas ofuscantes após ativar o modo."
        },
        {
            "num": "24",
            "img": "24_mobile_acessibilidade_fonte_grande.png",
            "title": "Demonstração de Escala de Fonte Muito Grande (+37% / 22px)",
            "tipo": "Acessibilidade WCAG AA",
            "largura": Inches(3.0),
            "objetivo": "Comprovar o funcionamento real do redimensionamento de fontes na tela do paciente, sem quebra de leiaute nem sobreposição de elementos textuais.",
            "funcionalidades": [
                "Escalonamento do elemento raiz (html) para 22px, expandindo automaticamente todas as grandezas em rem.",
                "Crescimento harmônico dos botões de toque (altura superior a 100px para acomodar o texto grande).",
                "Espaçamento entrelinhas generoso de 1.5, prevenindo que linhas de texto fiquem coladas.",
                "Manutenção da integridade de todos os alvos interativos."
            ],
            "ihc": "Critério de Sucesso WCAG 2.2 - 1.4.4 (Redimensionamento de Texto): Permite que o texto seja ampliado em até 200% sem tecnologia assistiva e sem perda de conteúdo ou funcionalidade."
        },
        {
            "num": "25",
            "img": "25_catalogo_medicamentos.png",
            "title": "Catálogo Institucional de Fármacos e Protocolos de Dor (RENAME / Erasto Gaertner)",
            "tipo": "Desktop / Farmacologia Institucional",
            "largura": Inches(6.2),
            "objetivo": "Padronizar o arsenal terapêutico para cuidados paliativos domiciliares, organizando princípios ativos, doses usuais e identificando claramente as Doses de Resgate SOS para alívio rápido da dor.",
            "funcionalidades": [
                "Cards farmacológicos padronizados: Bisacodil, Clonazepam, Dexametasona, Morfina, Paracetamol, etc.",
                "Identificação de vias de administração seguras no domicílio: Oral (VO), Subcutânea (SC) e Transdérmica (TD).",
                "Badge destacado '⚡ Resgate SOS' para medicamentos autorizados em crises de dor aguda.",
                "Filtros ágeis por sintoma-alvo (Dor, Constipação, Náusea, Ansiedade/Insônia) e busca instantânea.",
                "Caixa de Precauções & Orientações Clínicas com alertas médicos essenciais (ex.: uso compulsório de laxativo com opioides).",
                "Botão de cadastro administrativo para inclusão de novas moléculas na base institucional."
            ],
            "ihc": "Heurística #5 de Nielsen (Prevenção de erros): A visualização padronizada de doses e frequências previne erros graves de posologia em fármacos potentes (opioides e adjuvantes). Tipografia numérica tabular (tabular-nums) para precisão decimal."
        },
        {
            "num": "26",
            "img": "26_tendencia_temporal_esas.png",
            "title": "Curva de Tendência Temporal ESAS e Painel de Variação Clínica Recente (Delta)",
            "tipo": "Desktop / Prontuário Avançado",
            "largura": Inches(6.2),
            "objetivo": "Visualização longitudinal gráfica da evolução dos sintomas ao longo do tempo, correlacionando o ajuste de analgesia com a resposta terapêutica através do cálculo de variação (delta).",
            "funcionalidades": [
                "Gráfico vetorial interativo em SVG responsivo traçando as curvas de múltiplos sintomas simultaneamente.",
                "Zona Crítica em vermelho (ESAS >= 7) com linha pontilhada delimitando o limiar de alarme da equipe.",
                "Painel de Resposta Terapêutica com cálculo automático de variação (delta) entre a última e a penúltima avaliação.",
                "Indicadores semafóricos de melhora clínica (seta verde descendo), piora (seta vermelha subindo) ou estabilidade (=).",
                "Integração perfeita aos temas Claro, Noturno (Escuro) e Alto Contraste AAA sem artefatos visuais."
            ],
            "ihc": "Ergonomia Cognitiva Médica e Heurística #1 (Visibilidade do estado): Transforma dados tabulares dispersos em uma representação gráfica unificada, reduzindo o tempo de interpretação médica para menos de 5 segundos."
        }
    ]

    for item in SCREENS_INFO:
        h2 = doc.add_heading(f"Tela {item['num']}: {item['title']}", level=2)
        h2.style.font.color.rgb = RGBColor(9, 99, 93)

        # Imagem
        img_path = IMG_DIR / item["img"]
        if img_path.exists():
            img_p = doc.add_paragraph()
            img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            img_p.paragraph_format.space_before = Pt(8)
            img_p.paragraph_format.space_after = Pt(4)
            img_run = img_p.add_run()
            img_run.add_picture(str(img_path), width=item["largura"])
            
            caption_p = doc.add_paragraph()
            caption_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            caption_p.paragraph_format.space_after = Pt(12)
            caption_run = caption_p.add_run(f"Figura {item['num']} · {item['title']} (Captura do Sistema Real em Execução)")
            caption_run.font.size = Pt(8.5)
            caption_run.font.italic = True
            caption_run.font.color.rgb = RGBColor(100, 116, 139)

        # Informações da Tela em Tabela Estruturada
        info_tbl = doc.add_table(rows=4, cols=2)
        info_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Linha 1: Módulo / Tipo
        c1, c2 = info_tbl.rows[0].cells[0], info_tbl.rows[0].cells[1]
        c1.width, c2.width = Inches(1.8), Inches(4.7)
        c1.paragraphs[0].add_run("Módulo e Contexto:").font.bold = True
        c2.paragraphs[0].add_run(item["tipo"])
        set_cell_background(c1, "F4F8F7")
        set_cell_background(c2, "FFFFFF")
        
        # Linha 2: Objetivo Clínico
        c1, c2 = info_tbl.rows[1].cells[0], info_tbl.rows[1].cells[1]
        c1.paragraphs[0].add_run("Objetivo Clínico:").font.bold = True
        c2.paragraphs[0].add_run(item["objetivo"])
        set_cell_background(c1, "F4F8F7")
        set_cell_background(c2, "FFFFFF")

        # Linha 3: Funcionalidades
        c1, c2 = info_tbl.rows[2].cells[0], info_tbl.rows[2].cells[1]
        c1.paragraphs[0].add_run("Funcionalidades Principais:").font.bold = True
        p_fn = c2.paragraphs[0]
        for f_idx, fn in enumerate(item["funcionalidades"]):
            if f_idx > 0:
                p_fn = c2.add_paragraph()
            p_fn.paragraph_format.space_after = Pt(2)
            p_fn.add_run(f"• {fn}")
        set_cell_background(c1, "F4F8F7")
        set_cell_background(c2, "FFFFFF")

        # Linha 4: Fundamentos de IHC
        c1, c2 = info_tbl.rows[3].cells[0], info_tbl.rows[3].cells[1]
        c1.paragraphs[0].add_run("Fundamentos de IHC e Acessibilidade:").font.bold = True
        c2.paragraphs[0].add_run(item["ihc"])
        set_cell_background(c1, "F4F8F7")
        set_cell_background(c2, "FFFFFF")

        for row in info_tbl.rows:
            for cell in row.cells:
                set_cell_margins(cell, 60, 60, 100, 100)

        doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # =========================================================================
    # SEÇÃO 3: MATRIZ DE CONFORMIDADE COM IHC E WCAG 2.2
    # =========================================================================
    doc.add_page_break()
    h1 = doc.add_heading("3. Matriz de Conformidade com Heurísticas de Usabilidade e Normas WCAG 2.2", level=1)
    h1.style.font.color.rgb = RGBColor(9, 99, 93)

    p = doc.add_paragraph(
        "A tabela a seguir sistematiza a conformidade das telas do Sistema Zelo com as dez Heurísticas de Usabilidade "
        "de Jakob Nielsen e as recomendações de acessibilidade para a terceira idade da Web Content Accessibility Guidelines (WCAG 2.2):"
    )

    matrix_tbl = doc.add_table(rows=1, cols=3)
    matrix_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = matrix_tbl.rows[0].cells
    hdr[0].width, hdr[1].width, hdr[2].width = Inches(2.0), Inches(2.2), Inches(2.3)
    hdr[0].paragraphs[0].add_run("Diretriz / Heurística").font.bold = True
    hdr[1].paragraphs[0].add_run("Implementação no Zelo").font.bold = True
    hdr[2].paragraphs[0].add_run("Telas Evidenciadas").font.bold = True
    for c in hdr:
        set_cell_background(c, "09635D")
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(c, 80, 80, 100, 100)

    matrix_rows = [
        ("Nielsen #1: Visibilidade do Estado do Sistema", 
         "Status de envio em tempo real, badges semânticos de gravidade com rótulo textual e confirmação de salvamento.", 
         "Telas 03, 05, 10, 16"),
        
        ("Nielsen #2: Correspondência com o Mundo Real", 
         "Uso de esquemas anatômicos corporais e linguagem em saúde paliativa acolhedora, sem termos técnicos de TI.", 
         "Telas 01, 08, 17, 19"),
         
        ("Nielsen #3: Controle e Liberdade do Usuário", 
         "Navegação com botão 'Voltar' persistente, possibilidade de reverter seleções e alternar temas livremente.", 
         "Telas 14, 16, 21, 22"),
         
        ("Nielsen #4: Consistência e Padrões", 
         "Design System Zelo unificado: paleta de cores institucional consistente, tipografia Nunito e botões padronizados.", 
         "Todas as Telas (01 a 24)"),
         
        ("Nielsen #5: Prevenção de Erros", 
         "Confirmação explícita antes de sair de formulários, separação nítida entre dose horária e de resgate, alvos de toque de 56px.", 
         "Telas 07, 15, 16, 18"),
         
        ("Nielsen #6: Reconhecer ao Invés de Lembrar", 
         "Exibição do histórico recente do paciente, indicação do motivo de cada remédio e credenciais de teste com 1 clique.", 
         "Telas 02, 05, 06, 18"),
         
        ("Nielsen #7: Flexibilidade e Eficiência de Uso", 
         "Atalhos de teclado (Alt+A para fonte, Alt+C para contraste), filtros rápidos na lista de pacientes e busca ágil.", 
         "Telas 04, 10, 21, 24"),
         
        ("Nielsen #8: Estética e Design Minimalista", 
         "Fluxo ESAS em 1 sintoma por tela (Chunking), sem banners desnecessários nem poluicão visual que canse o idoso.", 
         "Telas 13, 15, 16, 17"),
         
        ("Nielsen #9: Ajuda para Reconhecer e Recuperar Falhas", 
         "Mensagens de erro instrutivas e acolhedoras com canais de apoio imediato e telefone de plantão 24 horas.", 
         "Telas 02, 10, 15, 20"),
         
        ("Nielsen #10: Ajuda e Documentação", 
         "Modal de ajuda de acessibilidade embutido na barra superior, orientações de autocuidado e simulador de triagem.", 
         "Telas 01, 12, 17, 21"),
         
        ("WCAG 2.2 AAA - 1.4.6: Contraste Aprimorado", 
         "Modo Alto Contraste com razão superior a 15:1 (fundo preto #000000 e tipografia amarela #FFFF00).", 
         "Telas 22 e 23"),
         
        ("WCAG 2.2 AAA - 2.5.5: Tamanho do Alvo Tátil", 
         "Alvos de toque mínimos de 56x56px no fluxo mobile do paciente e 48x48px no módulo assistencial.", 
         "Telas 15, 16, 18, 19"),
         
        ("WCAG 2.2 AA - 1.4.4: Redimensionamento de Texto", 
         "Escala dinâmica até +37% (22px) na raiz do documento sem quebra de leiaute nem sobreposição de botões.", 
         "Telas 21 e 24")
    ]

    for m_idx, (r1, r2, r3) in enumerate(matrix_rows):
        row = matrix_tbl.add_row()
        c1, c2, c3 = row.cells[0], row.cells[1], row.cells[2]
        c1.width, c2.width, c3.width = Inches(2.0), Inches(2.2), Inches(2.3)
        c1.paragraphs[0].add_run(r1).font.size = Pt(9)
        c1.paragraphs[0].runs[0].font.bold = True
        c2.paragraphs[0].add_run(r2).font.size = Pt(9)
        c3.paragraphs[0].add_run(r3).font.size = Pt(9)
        bg = "F4F8F7" if m_idx % 2 == 0 else "FFFFFF"
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)
        set_cell_background(c3, bg)
        set_cell_margins(c1, 50, 50, 80, 80)
        set_cell_margins(c2, 50, 50, 80, 80)
        set_cell_margins(c3, 50, 50, 80, 80)

    # Conclusão Técnica
    doc.add_page_break()
    h1 = doc.add_heading("4. Considerações Finais e Validação Técnica do Sistema", level=1)
    h1.style.font.color.rgb = RGBColor(9, 99, 93)

    p = doc.add_paragraph(
        "O catálogo técnico aqui documentado comprova que o Sistema Zelo transcendeu o estágio de protótipo conceitual, "
        "apresentando-se como uma plataforma web plenamente implementada, responsiva e funcional. Todas as 24 telas analisadas "
        "foram capturadas a partir dos componentes reais do sistema, atestando a coerência visual entre o design centrado no "
        "usuário idoso e a implementação de software."
    )
    p2 = doc.add_paragraph(
        "A disponibilização de recursos de acessibilidade ativos — nomeadamente a barra universal de acessibilidade, o redimensionamento "
        "dinâmico de fontes para 19px e 22px, e o Modo Alto Contraste com paleta amarela e preta — posiciona o Zelo na vanguarda "
        "da saúde digital brasileira voltada aos cuidados paliativos, garantindo equidade de acesso e alívio do sofrimento para quem "
        "mais necessita."
    )

    # Salva os arquivos no projeto
    doc.save(str(OUT_DOCX_LOCAL))
    shutil.copy2(OUT_DOCX_LOCAL, OUT_DOC_LOCAL)
    
    # Copia para Downloads
    out_docx_downloads = DOWNLOADS_DIR / "Zelo_Documento_Telas_e_Funcionalidades.docx"
    out_doc_downloads = DOWNLOADS_DIR / "Zelo_Documento_Telas_e_Funcionalidades.doc"
    shutil.copy2(OUT_DOCX_LOCAL, out_docx_downloads)
    shutil.copy2(OUT_DOCX_LOCAL, out_doc_downloads)

    # Copia para Desktop (Área de Trabalho)
    if DESKTOP_DIR.exists():
        out_docx_desktop = DESKTOP_DIR / "Zelo_Documento_Telas_e_Funcionalidades.docx"
        out_doc_desktop = DESKTOP_DIR / "Zelo_Documento_Telas_e_Funcionalidades.doc"
        shutil.copy2(OUT_DOCX_LOCAL, out_docx_desktop)
        shutil.copy2(OUT_DOCX_LOCAL, out_doc_desktop)

    # Copia para Brain
    BRAIN_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT_DOCX_LOCAL, OUT_DOCX_BRAIN)
    shutil.copy2(OUT_DOCX_LOCAL, OUT_DOC_BRAIN)

    print(f"Documento DOCX e DOC gerados com sucesso!")
    print(f"  -> Projeto DOCX: {OUT_DOCX_LOCAL} ({OUT_DOCX_LOCAL.stat().st_size} bytes)")
    print(f"  -> Projeto DOC:  {OUT_DOC_LOCAL} ({OUT_DOC_LOCAL.stat().st_size} bytes)")
    print(f"  -> Downloads:    {out_docx_downloads}")
    if DESKTOP_DIR.exists():
        print(f"  -> Desktop:      {out_docx_desktop}")

    # Gera também a versão em Markdown
    build_markdown_version()

def build_markdown_version():
    with open(OUT_MD_BRAIN, "w", encoding="utf-8") as f:
        f.write("# SISTEMA ZELO: CATÁLOGO TÉCNICO DE TELAS E FUNCIONALIDADES DO SISTEMA REAL\n\n")
        f.write("**Documentação das Telas do Sistema em Execução, Fundamentos de IHC para Idosos, Diretrizes WCAG 2.2 AA/AAA e Integração Clínica Multiprofissional**\n\n")
        f.write("---\n\n")
        f.write("## 1. Fundamentos de IHC e Engenharia de Acessibilidade no Sistema Zelo\n\n")
        f.write("O desenvolvimento do Sistema Zelo foi orientado pelos princípios da Interação Humano-Computador (IHC) e do Design Thinking com foco na gerontologia oncológica.\n\n")
        f.write("### Requisitos Críticos de IHC Implementados:\n")
        f.write("1. **Dimensão e Espaçamento de Alvos Táteis:** Botões com dimensão mínima de 56x56px no fluxo do paciente (e 48x48px no assistencial) com espaçamento livre de 12px.\n")
        f.write("2. **Hierarquia Tipográfica e Legibilidade Senil:** Tipografia Nunito com corpo de texto ampliado e escalonamento em 3 níveis (Padrão 16px, Grande 19px, Muito Grande 22px).\n")
        f.write("3. **Razão de Contraste e Modo de Alto Contraste (WCAG 2.2 AAA):** Contraste padrão superior a 7:1 e Modo de Alto Contraste verdadeiro com fundo preto (#000000) e amarelo (#FFFF00) superior a 15:1.\n")
        f.write("4. **Redução de Sobrecarga Cognitiva:** Avaliação ESAS em 1 sintoma por tela (Passo a Passo), sem formulários extensos.\n")
        f.write("5. **Prevenção Ativa de Erros:** Confirmação de saída, salvamento contínuo em localStorage e prevenção de perda de dados parciais.\n")
        f.write("6. **Ausência de Emoticons:** Dignidade do paciente idoso preservada com escalas visuais numéricas 0-10 validadas.\n\n")
        f.write("---\n\n")
        f.write("## 2. Catálogo Completo de Telas do Sistema Real em Execução\n\n")

        # Capturas
        screens = [
            ("01", "01_portal_acesso.png", "Portal Central de Acesso e Seleção de Perfil", "Desktop / Central",
             "Ponto de entrada único do sistema Zelo que permite direcionar o usuário para o seu ambiente específico: Portal da Equipe Assistencial ou Aplicativo do Paciente e Cuidador.",
             "Cards de direcionamento com alvos visuais amplos e contraste superior a 8:1; acesso ao portal de equipe ou mobile; barra superior de apoio com telefone 24h.",
             "Heurística #2 de Nielsen (Correspondência com o mundo real) ao separar os perfis assistencial e paciente; estados de foco nítidos para navegação acessível."),

            ("02", "02_login_unificado.png", "Autenticação Unificada com Perfis Clínicos e Credenciais de Teste", "Desktop / Segurança",
             "Garantir o controle de acesso seguro baseado em papéis (RBAC) em conformidade com a LGPD e a confidencialidade do prontuário médico.",
             "Formulário seguro de autenticação; botões de atalho com credenciais pré-configuradas para avaliação (Admin, Médico, Enfermeira, Paciente); fallback resiliente em caso de falha de rede.",
             "Heurística #6 de Nielsen (Reconhecer ao invés de lembrar) ao oferecer botões de teste com 1 clique; Heurística #9 (mensagens de erro claras sem termos de programação)."),

            ("03", "03_assistencial_dashboard.png", "Painel Multidisciplinar Desktop (Dashboard Assistencial)", "Desktop / Assistencial",
             "Proporcionar à equipe médica e de enfermagem uma visão panorâmica e em tempo real de toda a coorte de pacientes monitorados no domicílio.",
             "Painel de Indicadores Clínicos (KPIs); estratificação funcional PPS (10-30%, 40-60%, 70-100%); tabela de alertas críticos com dor severa em destaque vermelho; navegação lateral persistente.",
             "Heurística #1 de Nielsen (Visibilidade do estado do sistema): códigos de cores semânticos (vermelho, âmbar e verde) sempre associados a rótulos textuais explícitos."),

            ("04", "04_assistencial_pacientes.png", "Gestão e Lista de Pacientes em Acompanhamento Domiciliar", "Desktop / Assistencial",
             "Listagem nominal de pacientes em cuidados paliativos domiciliares com filtros clínicos e acesso direto ao prontuário individual.",
             "Filtros de busca rápida por nome, prontuário, CID-10 e urgência; badges de estado clínico; identificação do cuidador responsável; ações diretas para abrir prontuário.",
             "Organização em tabela de alta densidade visual com contraste reforçado, permitindo localizar qualquer paciente em menos de 3 segundos."),

            ("05", "05_assistencial_prontuario_esas.png", "Prontuário Paliativo - Histórico ESAS e Gráfico Temporal", "Desktop / Prontuário",
             "Apresentar a evolução longitudinal dos 9 sintomas da Escala de Edmonton (ESAS), correlacionando a eficácia da conduta médica com a resposta do paciente.",
             "Cabeçalho com dados clínicos, CID-10 e PPS; exibição dos 9 sintomas avaliados hoje com barras coloridas; gráfico visual evolutivo da dor; histórico com data e hora.",
             "Representação gráfica de alto contraste que facilita a identificação visual de piora antes de crises agudas (ergonomia cognitiva médica)."),

            ("06", "06_assistencial_prontuario_triagem.png", "Prontuário Paliativo - Respostas de Dor e Triagem Clínica do Script Validado", "Desktop / Prontuário",
             "Exibir as respostas fornecidas pelo paciente durante o diálogo com o Chatbot Zelo (baseado no script validado por juízes especialistas).",
             "Quadro de características da dor (tipo, intensidade, duração); detecção de sinais de alarme clínicos; verificação de dose de resgate; conduta sugerida pelo algoritmo.",
             "Consolida dados complexos de diálogo conversacional em um sumário estruturado, reduzindo o tempo de tomada de decisão médica."),

            ("07", "07_assistencial_prontuario_prescricoes.png", "Prontuário Paliativo - Prescrições Médicas e Doses de Resgate", "Desktop / Prontuário",
             "Módulo de prescrição farmacológica especializado em cuidados paliativos, destacando a medicação de uso contínuo e a medicação de resgate.",
             "Tabela de medicamentos ativos com via, dose e posologia; card vermelho em destaque para a 'Dose de Resgate' de dor; botão para nova prescrição; histórico de adesão.",
             "Heurística #5 de Nielsen (Prevenção de Erros): separação visual evidente entre medicação contínua e dose de resgate para evitar sobredosagem de opioides."),

            ("08", "08_assistencial_prontuario_mapa_dor.png", "Prontuário Paliativo - Mapeamento Corporal de Dor e Lesões", "Desktop / Prontuário",
             "Visualização anatômica das regiões corporais indicadas pelo paciente ou cuidador como sítios de dor, feridas neoplásicas ou edemas.",
             "Esquema anatômico do corpo humano (frente e costas) com marcações; card lateral descrevendo intensidade e tipo de desconforto; registro para estomaterapia.",
             "Heurística #2 de Nielsen (Correspondência com o mundo real) ao substituir descrições textuais por um mapa visual intuitivo."),

            ("09", "09_assistencial_prontuario_evolucoes.png", "Prontuário Paliativo - Evoluções da Equipe Multidisciplinar", "Desktop / Prontuário",
             "Registro do prontuário multiprofissional contendo notas de evolução clínica da medicina, enfermagem, psicologia e serviço social.",
             "Linha do tempo de anotações com identificação do profissional e conselho de classe; classificação do tipo de atendimento; modal para nova evolução.",
             "Facilita a comunicação interprofissional sem ruídos, assegurando continuidade assistencial e rastreabilidade total de condutas."),

            ("10", "10_assistencial_alertas.png", "Central de Alertas Clínicos com Priorização Semafórica", "Desktop / Assistencial",
             "Centro de triagem de incidentes clínicos e alertas automáticos gerados pelo sistema a partir dos registros enviados pelos pacientes.",
             "Categorização semafórica (Vermelho, Âmbar e Verde); filtros rápidos por status; ação rápida para atender alerta com modal de desfecho clínico.",
             "Reduz o estresse cognitivo da enfermagem ao classificar pacientes por gravidade objetiva, eliminando o risco de negligenciar casos graves."),

            ("11", "11_assistencial_acompanhamento.png", "Monitoramento Longitudinal e Linha do Tempo Assistencial", "Desktop / Assistencial",
             "Ferramenta de análise de tendências clínicas e acompanhamento da trajetória do paciente ao longo de semanas e meses.",
             "Gráficos de evolução temporal comparando múltiplos sintomas; registro de marcos clínicos (ajustes de dose, consultas); métricas de estabilidade paliativa.",
             "Visão analítica de alto nível que permite avaliar se as metas terapêuticas de conforto e alívio do sofrimento estão sendo mantidas."),

            ("12", "12_assistencial_simulador_triagem.png", "Simulador Clínico do Algoritmo de Triagem e Script de Dor", "Desktop / Ferramenta",
             "Ambiente de testes clínicos e validação para que médicos e enfermeiros testem todos os nós decisórios do script de triagem e do chatbot de dor.",
             "Configuração manual de escore de dor (0 a 10) e sinais de alarme; simulação imediata do fluxo conversacional; exibição da regra clínica disparada.",
             "Transparência algorítmica: permite aos profissionais de saúde auditar as decisões automatizadas e garantir total segurança clínica."),

            ("13", "13_mobile_login_paciente.png", "Acesso Acolhedor do Cuidador e Paciente", "Mobile / Paciente",
             "Garantir uma entrada simplificada e sem atritos para o paciente idoso ou cuidador familiar, eliminando senhas complexas.",
             "Identidade visual humanizada Zelo; entrada facilitada com telefone/CPF; botões de acessibilidade no topo; canal de apoio telefônico visível.",
             "Minimiza barreiras cognitivas de entrada. Botão com 56px de altura e contraste cromático superior a 9:1."),

            ("14", "14_mobile_selecionar_paciente.png", "Seleção de Paciente Vinculado ao Cuidador Familiar", "Mobile / Paciente",
             "Permitir que cuidadores familiares que cuidam de mais de um idoso selecionem com precisão qual paciente estão avaliando.",
             "Cards amplos de pacientes com nome, idade e relação de parentesco; data do último envio; botões de toque largos de 80px de altura.",
             "Previne a troca involuntária de prontuários entre pacientes diferentes (Heurística #5 de Nielsen)."),

            ("15", "15_mobile_paciente_home.png", "Tela Inicial do Paciente (Home Acolhedora com Botões de 80px)", "Mobile / Paciente",
             "Centro de controle diário do paciente e cuidador, oferecendo acesso rápido às funções essenciais sem rolagem confusa.",
             "Mensagem acolhedora personalizada; 4 botões verticais amplos de 80px de altura (ESAS, Chatbot, Medicamentos, Local de Dor); botão de emergência 'Ligar para Enfermagem'.",
             "Ergonomia motora geriátrica de excelência: botões ocupam 100% da largura útil da tela e discagem imediata com protocolo nativo 'tel:'."),

            ("16", "16_mobile_paciente_esas.png", "Registro Guiado de Sintomas ESAS (Alvos de Toque de 56px e Escala 0 a 10)", "Mobile / Paciente",
             "Coleta diária padronizada dos 9 sintomas da Escala de Edmonton sem sobrecarregar a memória nem cansar o idoso fragilizado.",
             "Passo a passo unidirecional (1 sintoma por tela); escala numérica 0-10 com âncoras descritivas; botões seletores de 56x56px; tela de revisão antes do envio.",
             "Elimina formulários longos pelo princípio de Chunking. Alvos de 56px atendem com folga às diretrizes WCAG 2.2 AAA para tremores motores."),

            ("17", "17_mobile_paciente_chatbot.png", "Chatbot Zelo (Script Validado por Juízes para Avaliação e Alívio da Dor)", "Mobile / Paciente",
             "Assistente virtual acolhedor que executa rigorosamente o script clínico validado por juízes especialistas para avaliar dor e resgate.",
             "Balões de diálogo de alta legibilidade; botões de resposta rápida pré-formatados (sem digitação); triagem em 4 níveis (C1 a C4); orientações de conforto.",
             "Design conversacional humanizado sem digitação manual, viabilizando o uso por pessoas com tremores senis ou artrose nas mãos."),

            ("18", "18_mobile_paciente_medicamentos.png", "Medicamentos do Dia e Registro da Dose de Resgate", "Mobile / Paciente",
             "Orientar o paciente e cuidador quanto aos medicamentos prescritos, prevenindo esquecimentos e controlando as doses de resgate de dor.",
             "Card de destaque vermelho para dose de resgate com botão de registro; remédios divididos por períodos (Manhã, Tarde, Noite); indicação da função em linguagem leiga.",
             "Heurística #6 de Nielsen (Reconhecimento ao invés de memorização): associa o remédio à sua indicação de uso leiga, empoderando o paciente."),

            ("19", "19_mobile_paciente_local_dor.png", "Esquema Anatômico Corporal Interativo para Indicação de Dor", "Mobile / Paciente",
             "Permitir que o paciente aponte visualmente no corpo onde dói ou onde surgiu uma ferida neoplásica ou edema.",
             "Alternância entre Visão da Frente e Visão das Costas; grade de botões anatômicos táteis amplos; seleção do tipo de queixa; confirmação visual.",
             "Comunicação visual direta fundamental para idosos com afasia, disartria ou dificuldades de expressão verbal."),

            ("20", "20_mobile_paciente_notificacoes.png", "Central de Avisos e Orientações da Equipe Paliativa", "Mobile / Paciente",
             "Canal de comunicação assíncrono onde a família recebe avisos de visitas da equipe, lembretes e mensagens de acolhimento.",
             "Cards de mensagens categorizados por gravidade; confirmação de visualização; avisos de agendamento de visita de enfermagem.",
             "Reduz a ansiedade e o sentimento de desamparo no domicílio, transmitindo segurança constante."),

            ("21", "21_mobile_paciente_configuracoes.png", "Perfil, Ajustes de Acessibilidade e Termos LGPD", "Mobile / Paciente",
             "Configuração personalizada das preferências visuais do aplicativo e exibição dos dados de prontuário e consentimento informado.",
             "Seletor do Tamanho de Texto (Padrão, Grande +18%, Muito Grande +37%); chave para Modo Alto Contraste; dados do paciente e cuidador; termos LGPD.",
             "Autonomia do usuário (Heurística #3 de Nielsen): o paciente adapta a interface às suas limitações visuais com 1 toque."),

            ("22", "22_mobile_acessibilidade_alto_contraste_perfil.png", "Demonstração do Sistema Real em Modo Alto Contraste (Tela de Ajustes)", "Acessibilidade WCAG AAA",
             "Comprovar a execução funcional do Modo Alto Contraste implementado em código, atendendo aos rigorosos critérios da norma WCAG 2.2 AAA.",
             "Fundo preto puro (#000000) e superfície escura (#0A0A0A); tipografia amarela (#FFFF00) superior a 15:1; textos secundários brancos (#FFFFFF); bordas amarelas de 2px; badge confirmando 'Ativado'.",
             "Padrão ouro em tecnologia assistiva para idosos com baixa acuidade visual severa, catarata e retinopatia diabética."),

            ("23", "23_mobile_acessibilidade_alto_contraste_home.png", "Demonstração do Sistema Real em Modo Alto Contraste (Tela Inicial)", "Acessibilidade WCAG AAA",
             "Evidenciar como todos os elementos da tela inicial (cards de ação, cabeçalho e menu de navegação) se adaptam automaticamente ao alto contraste.",
             "Cards com bordas amarelas grossas; texto de acolhimento legível a distância; barra inferior preta e amarela; botões superiores de acesso rápido 'A+ Texto' e 'Contraste'.",
             "Heurística #4 de Nielsen (Consistência): homogeneidade visual total em todas as páginas após a ativação do modo."),

            ("24", "24_mobile_acessibilidade_fonte_grande.png", "Demonstração de Escala de Fonte Muito Grande (+37% / 22px)", "Acessibilidade WCAG AA",
             "Comprovar o funcionamento real do redimensionamento de fontes na tela do paciente, sem quebra de leiaute nem sobreposição de botões.",
             "Escalonamento da raiz (html) para 22px; crescimento harmônico dos cards de toque para mais de 100px; espaçamento entre linhas de 1.5; integridade funcional total.",
             "Atende plenamente ao Critério de Sucesso WCAG 2.2 - 1.4.4 (Redimensionamento de Texto em até 200% sem perda de conteúdo).")
        ]

        for s in screens:
            f.write(f"### Tela {s[0]}: {s[2]}\n\n")
            f.write(f"![{s[2]}](telas/sistema_real/{s[1]})\n\n")
            f.write(f"- **Módulo / Contexto:** {s[3]}\n")
            f.write(f"- **Objetivo Clínico:** {s[4]}\n")
            f.write(f"- **Funcionalidades Principais:** {s[5]}\n")
            f.write(f"- **Fundamentos de IHC e Acessibilidade:** {s[6]}\n\n")
            f.write("---\n\n")

        f.write("## 3. Matriz de Conformidade com Heurísticas de Usabilidade e Normas WCAG 2.2\n\n")
        f.write("| Diretriz / Heurística | Implementação no Zelo | Telas Evidenciadas |\n")
        f.write("|---|---|---|\n")
        f.write("| **Nielsen #1: Visibilidade do Estado do Sistema** | Status de envio em tempo real, badges semânticos de gravidade com rótulo textual e confirmação de salvamento. | Telas 03, 05, 10, 16 |\n")
        f.write("| **Nielsen #2: Correspondência com o Mundo Real** | Esquemas anatômicos corporais e linguagem em saúde paliativa acolhedora, sem termos técnicos de TI. | Telas 01, 08, 17, 19 |\n")
        f.write("| **Nielsen #3: Controle e Liberdade do Usuário** | Navegação com botão 'Voltar' persistente, possibilidade de reverter seleções e alternar temas livremente. | Telas 14, 16, 21, 22 |\n")
        f.write("| **Nielsen #4: Consistência e Padrões** | Design System Zelo unificado: paleta institucional consistente, tipografia Nunito e botões padronizados. | Todas as Telas (01 a 24) |\n")
        f.write("| **Nielsen #5: Prevenção de Erros** | Confirmação explícita antes de sair de formulários, separação nítida entre dose horária e de resgate, alvos de toque de 56px. | Telas 07, 15, 16, 18 |\n")
        f.write("| **Nielsen #6: Reconhecer ao Invés de Lembrar** | Exibição do histórico recente do paciente, indicação do motivo de cada remédio e credenciais de teste com 1 clique. | Telas 02, 05, 06, 18 |\n")
        f.write("| **Nielsen #7: Flexibilidade e Eficiência** | Atalhos de teclado (Alt+A para fonte, Alt+C para contraste), filtros rápidos na lista de pacientes e busca ágil. | Telas 04, 10, 21, 24 |\n")
        f.write("| **Nielsen #8: Estética e Minimalismo** | Fluxo ESAS em 1 sintoma por tela (Chunking), sem banners desnecessários nem poluição visual. | Telas 13, 15, 16, 17 |\n")
        f.write("| **Nielsen #9: Reconhecer e Recuperar Falhas** | Mensagens de erro instrutivas e acolhedoras com canais de apoio imediato e telefone de plantão 24 horas. | Telas 02, 10, 15, 20 |\n")
        f.write("| **Nielsen #10: Ajuda e Documentação** | Modal de ajuda de acessibilidade embutido na barra superior, orientações de autocuidado e simulador de triagem. | Telas 01, 12, 17, 21 |\n")
        f.write("| **WCAG 2.2 AAA - 1.4.6: Contraste Aprimorado** | Modo Alto Contraste com razão superior a 15:1 (fundo preto #000000 e amarelo #FFFF00). | Telas 22 e 23 |\n")
        f.write("| **WCAG 2.2 AAA - 2.5.5: Alvo Tátil Ampliado** | Alvos de toque mínimos de 56x56px no fluxo mobile e 48x48px no assistencial. | Telas 15, 16, 18, 19 |\n")
        f.write("| **WCAG 2.2 AA - 1.4.4: Redimensionamento de Texto** | Escala dinâmica até +37% (22px) na raiz do documento sem quebra de leiaute. | Telas 21 e 24 |\n\n")
        f.write("---\n\n")
        f.write("## 4. Considerações Finais e Validação Técnica do Sistema\n\n")
        f.write("O catálogo técnico documentado comprova que o Sistema Zelo apresenta-se como uma plataforma web plenamente implementada, responsiva e funcional. Todas as 24 telas analisadas foram capturadas a partir dos componentes reais do sistema, atestando a coerência visual entre o design centrado no usuário idoso e a implementação de software.\n")

    print(f"Documento Markdown gerado com sucesso em: {OUT_MD_BRAIN}")

if __name__ == "__main__":
    create_document()
