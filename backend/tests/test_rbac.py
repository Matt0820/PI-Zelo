import pytest
from fastapi.testclient import TestClient


def create_patient_and_token(client: TestClient, email: str) -> tuple[int, str]:
    payload = {
        'nome': 'Paciente Teste RBAC',
        'email': email,
        'senha': 'senhaValida123',
        'perfil': 'paciente',
    }
    res = client.post('/api/users', json=payload)
    data = res.json()
    return data['user']['id'], data['access_token']


def test_patient_cannot_list_all_users(client: TestClient):
    _, token = create_patient_and_token(client, 'paciente.rbac1@teste.zelo.com.br')
    res = client.get('/api/users', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 403
    assert 'Acesso restrito à equipe assistencial' in res.json()['detail']


def test_patient_cannot_list_clinical_alerts(client: TestClient):
    _, token = create_patient_and_token(client, 'paciente.rbac2@teste.zelo.com.br')
    res = client.get('/api/alertas', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 403
    assert 'Acesso restrito à equipe assistencial' in res.json()['detail']


def test_patient_cannot_access_other_patient_data(client: TestClient):
    id1, token1 = create_patient_and_token(client, 'paciente.rbac3@teste.zelo.com.br')
    id2, _ = create_patient_and_token(client, 'paciente.rbac4@teste.zelo.com.br')

    # Paciente 1 tenta acessar os dados do Paciente 2
    res = client.get(f'/api/users/{id2}', headers={'Authorization': f'Bearer {token1}'})
    assert res.status_code == 403
    assert 'Acesso permitido apenas aos próprios dados' in res.json()['detail']

    # Paciente 1 acessa os próprios dados
    res_proprio = client.get(f'/api/users/{id1}', headers={'Authorization': f'Bearer {token1}'})
    assert res_proprio.status_code == 200
    assert res_proprio.json()['id'] == id1


def test_patient_cannot_create_clinical_evolution(client: TestClient):
    id1, token1 = create_patient_and_token(client, 'paciente.rbac5@teste.zelo.com.br')
    payload = {
        'profissional_nome': 'Tentativa Invalida',
        'cargo': 'Enfermeiro',
        'tipo_evolucao': 'Domiciliar',
        'conteudo': 'Nota não autorizada',
    }
    res = client.post(
        f'/api/users/{id1}/evolucoes',
        json=payload,
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res.status_code == 403
    assert 'Esta ação é restrita à equipe assistencial' in res.json()['detail']

def test_patient_can_confirm_and_undo_own_medication(client: TestClient):
    id1, token1 = create_patient_and_token(client, 'paciente.med1@teste.zelo.com.br')
    # Registra uma medicação
    res_post = client.post(
        f'/api/users/{id1}/medications',
        json={
            'nome': 'Morfina 10mg',
            'dose': '1 comprimido',
            'horario': '14:00',
            'frequencia': 'A cada 4 horas',
            'status': 'ativo',
            'eh_dose_resgate': True,
        },
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_post.status_code == 201
    med_id = res_post.json()['id']

    # Paciente confirma que tomou
    res_patch = client.patch(
        f'/api/users/{id1}/medications/{med_id}',
        json={'status': 'tomada', 'observacao': 'Confirmado às 14:15 via Zelo App'},
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()['status'] == 'tomada'
    assert 'Confirmado às 14:15' in res_patch.json()['observacao']

    # Paciente desfaz e reabre como ativo
    res_undo = client.patch(
        f'/api/users/{id1}/medications/{med_id}',
        json={'status': 'ativo'},
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_undo.status_code == 200
    assert res_undo.json()['status'] == 'ativo'


def test_patient_cannot_delete_medication(client: TestClient):
    id1, token1 = create_patient_and_token(client, 'paciente.med2@teste.zelo.com.br')
    res_post = client.post(
        f'/api/users/{id1}/medications',
        json={
            'nome': 'Dipirona 500mg',
            'dose': '1 comprimido',
            'horario': '14:00',
            'frequencia': 'A cada 6 horas',
            'status': 'ativo',
        },
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_post.status_code == 201
    med_id = res_post.json()['id']

    # Tentativa de remoção pelo paciente deve ser barrada
    res_del = client.delete(
        f'/api/users/{id1}/medications/{med_id}',
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_del.status_code == 403
    assert 'Apenas a equipe assistencial pode remover medicamentos' in res_del.json()['detail']


def test_patient_cannot_modify_other_patient_medication(client: TestClient):
    id1, token1 = create_patient_and_token(client, 'paciente.med3@teste.zelo.com.br')
    id2, token2 = create_patient_and_token(client, 'paciente.med4@teste.zelo.com.br')

    # Medicação criada para Paciente 1
    res_post = client.post(
        f'/api/users/{id1}/medications',
        json={
            'nome': 'Paracetamol 500mg',
            'dose': '1 cp',
            'horario': '08:00',
            'frequencia': 'A cada 8 horas',
            'status': 'ativo',
        },
        headers={'Authorization': f'Bearer {token1}'},
    )
    assert res_post.status_code == 201
    med_id = res_post.json()['id']

    # Paciente 2 tenta alterar medicação do Paciente 1
    res_hack = client.patch(
        f'/api/users/{id1}/medications/{med_id}',
        json={'status': 'tomada'},
        headers={'Authorization': f'Bearer {token2}'},
    )
    assert res_hack.status_code == 403

