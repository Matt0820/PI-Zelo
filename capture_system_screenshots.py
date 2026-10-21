import os
import subprocess
import time
import shutil
from pathlib import Path

BASE_DIR = Path(r"c:\Users\teste\Downloads\Zelo")
OUT_DIR_LOCAL = BASE_DIR / "docs" / "telas_sistema"
OUT_DIR_BRAIN = Path(r"C:\Users\teste\.gemini\antigravity\brain\22791596-8225-434f-8443-9b6d0e32ed31\telas\sistema_real")

OUT_DIR_LOCAL.mkdir(parents=True, exist_ok=True)
OUT_DIR_BRAIN.mkdir(parents=True, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

SCREENS = [
    # Desktop Screens (1280x850)
    {
        "id": "01_portal_acesso",
        "title": "Portal Central de Acesso e Perfis",
        "file": "frontend/index.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "02_login_unificado",
        "title": "Autenticação Unificada com Perfis Clínicos",
        "file": "frontend/login.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "03_assistencial_dashboard",
        "title": "Painel Geral de Cuidados Paliativos (Dashboard)",
        "file": "frontend/assistencial/dashboard.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "04_assistencial_pacientes",
        "title": "Gestão e Lista de Pacientes em Acompanhamento Domiciliar",
        "file": "frontend/assistencial/pacientes.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "05_assistencial_prontuario_esas",
        "title": "Prontuário Paliativo - Histórico ESAS e Gráfico Temporal",
        "file": "frontend/assistencial/paciente-detalhe.html",
        "params": "?tab=esas",
        "width": 1280,
        "height": 920
    },
    {
        "id": "06_assistencial_prontuario_triagem",
        "title": "Prontuário Paliativo - Respostas de Dor e Triagem Clínica",
        "file": "frontend/assistencial/paciente-detalhe.html",
        "params": "?tab=triage",
        "width": 1280,
        "height": 920
    },
    {
        "id": "07_assistencial_prontuario_prescricoes",
        "title": "Prontuário Paliativo - Prescrições Médicas e Doses de Resgate",
        "file": "frontend/assistencial/paciente-detalhe.html",
        "params": "?tab=meds",
        "width": 1280,
        "height": 920
    },
    {
        "id": "08_assistencial_prontuario_mapa_dor",
        "title": "Prontuário Paliativo - Mapeamento Corporal de Dor e Lesões",
        "file": "frontend/assistencial/paciente-detalhe.html",
        "params": "?tab=mapa",
        "width": 1280,
        "height": 920
    },
    {
        "id": "09_assistencial_prontuario_evolucoes",
        "title": "Prontuário Paliativo - Evoluções da Equipe Multidisciplinar",
        "file": "frontend/assistencial/paciente-detalhe.html",
        "params": "?tab=evolucoes",
        "width": 1280,
        "height": 920
    },
    {
        "id": "10_assistencial_alertas",
        "title": "Central de Alertas Clínicos com Prioridade Semafórica",
        "file": "frontend/assistencial/alertas.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "11_assistencial_acompanhamento",
        "title": "Monitoramento Longitudinal e Linha do Tempo",
        "file": "frontend/assistencial/acompanhamento.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    {
        "id": "12_assistencial_simulador_triagem",
        "title": "Simulador Clínico do Algoritmo de Triagem de Dor",
        "file": "frontend/assistencial/simulador-triagem.html",
        "params": "",
        "width": 1280,
        "height": 850
    },
    # Mobile Screens (390x844)
    {
        "id": "13_mobile_login_paciente",
        "title": "Acesso Acolhedor do Cuidador / Paciente",
        "file": "frontend/paciente/login.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "14_mobile_selecionar_paciente",
        "title": "Seleção de Paciente Vinculado ao Cuidador Familiar",
        "file": "frontend/paciente/selecionar-paciente.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "15_mobile_paciente_home",
        "title": "Tela Inicial do Paciente (Home Acolhedora com Botões de 80px)",
        "file": "frontend/paciente/index.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "16_mobile_paciente_esas",
        "title": "Registro Guiado de Sintomas ESAS (Alvos de Toque de 56px)",
        "file": "frontend/paciente/sintomas-passos.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "17_mobile_paciente_chatbot",
        "title": "Chatbot Zelo (Script Validado para Avaliação e Alívio da Dor)",
        "file": "frontend/paciente/chatbot-zelo.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "18_mobile_paciente_medicamentos",
        "title": "Medicamentos do Dia e Registro de Dose de Resgate",
        "file": "frontend/paciente/medicamentos.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "19_mobile_paciente_local_dor",
        "title": "Esquema Anatômico Corporal Interativo para Indicação de Dor",
        "file": "frontend/paciente/local-dor.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "20_mobile_paciente_notificacoes",
        "title": "Central de Avisos e Orientações da Equipe Paliativa",
        "file": "frontend/paciente/notificacoes.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    {
        "id": "21_mobile_paciente_configuracoes",
        "title": "Perfil, Ajustes e Opções de Acessibilidade",
        "file": "frontend/paciente/configuracoes.html",
        "params": "",
        "width": 390,
        "height": 844
    },
    # Demonstração de Acessibilidade Ativa no Sistema Real
    {
        "id": "22_mobile_acessibilidade_alto_contraste_perfil",
        "title": "Demonstração de Alto Contraste Ativo (Perfil e Configurações)",
        "file": "frontend/paciente/configuracoes.html",
        "params": "?contrast=high",
        "width": 390,
        "height": 844
    },
    {
        "id": "23_mobile_acessibilidade_alto_contraste_home",
        "title": "Demonstração de Alto Contraste Ativo (Tela Inicial do Paciente)",
        "file": "frontend/paciente/index.html",
        "params": "?contrast=high",
        "width": 390,
        "height": 844
    },
    {
        "id": "24_mobile_acessibilidade_fonte_grande",
        "title": "Demonstração de Escala de Fonte Muito Grande (+37%)",
        "file": "frontend/paciente/index.html",
        "params": "?fontSize=xlarge",
        "width": 390,
        "height": 844
    }
]

def capture_all():
    print(f"Iniciando captura de {len(SCREENS)} telas do sistema real...")
    for idx, item in enumerate(SCREENS, 1):
        html_file = (BASE_DIR / item["file"]).resolve()
        file_url = f"file:///{html_file.as_posix()}{item['params']}"
        out_file_local = OUT_DIR_LOCAL / f"{item['id']}.png"
        out_file_brain = OUT_DIR_BRAIN / f"{item['id']}.png"
        
        args = [
            EDGE_PATH,
            "--headless",
            "--disable-gpu",
            f"--window-size={item['width']},{item['height']}",
            f"--screenshot={out_file_local}",
            file_url
        ]
        print(f"[{idx}/{len(SCREENS)}] Capturando {item['id']} ({item['width']}x{item['height']})...")
        
        proc = subprocess.run(args, capture_output=True, text=True)
        
        if out_file_local.exists() and out_file_local.stat().st_size > 0:
            shutil.copy2(out_file_local, out_file_brain)
            print(f"   -> OK: {out_file_local.stat().st_size} bytes gerados.")
        else:
            print(f"   -> ERRO ao capturar {item['id']}. Returncode: {proc.returncode}. Output: {proc.stderr or proc.stdout}")
        
        time.sleep(0.3)

    print("\nCaptura concluida com sucesso!")

if __name__ == "__main__":
    capture_all()
