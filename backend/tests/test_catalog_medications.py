import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.models import CatalogMedication, User
from app.security import _hash_password
from app.seed import seed_catalog_medications


def _create_user(email: str, perfil: str, nome: str) -> tuple[int, str]:
    with SessionLocal() as db:
        user = User(
            nome=nome,
            email=email,
            senha_hash=_hash_password("senhaTeste123"),
            perfil=perfil,
            prontuario=f"DOC-{email[:8]}",
            ativo=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

    from app.security import _make_access_token
    token = _make_access_token(user)
    return user_id, token


def test_seed_and_list_catalog_medications(client: TestClient, isolated_database):
    """Garante que o catálogo é populado e listado corretamente."""
    with SessionLocal() as db:
        seed_catalog_medications(db)

    _, doc_token = _create_user("medico.catalog1@zelo.saude.gov.br", "medico", "Dr. Roberto")
    headers = {"Authorization": f"Bearer {doc_token}"}

    res = client.get("/api/catalog/medications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 10
    assert any("Morfina" in m["nome"] for m in data)
    assert any("Lactulose" in m["nome"] for m in data)


def test_search_and_filter_catalog_medications(client: TestClient, isolated_database):
    """Testa filtros por termo de busca e sintoma-alvo."""
    with SessionLocal() as db:
        seed_catalog_medications(db)

    _, team_token = _create_user("enf.catalog2@zelo.saude.gov.br", "assistencial", "Enf. Carla")
    headers = {"Authorization": f"Bearer {team_token}"}

    # Busca por constipação
    res = client.get("/api/catalog/medications?sintoma_alvo=Constipação", headers=headers)
    assert res.status_code == 200
    constipacao_meds = res.json()
    assert len(constipacao_meds) >= 2
    assert all("Constipação" in (m["sintoma_alvo"] or "") for m in constipacao_meds)

    # Busca por texto livre (morfina)
    res_search = client.get("/api/catalog/medications?search=morfina", headers=headers)
    assert res_search.status_code == 200
    assert len(res_search.json()) >= 2


def test_doctor_can_create_and_update_catalog_medication(client: TestClient, isolated_database):
    """Médico cadastra um novo medicamento no banco e depois atualiza sua posologia."""
    _, doc_token = _create_user("medico.catalog3@zelo.saude.gov.br", "medico", "Dra. Juliana")
    headers = {"Authorization": f"Bearer {doc_token}"}

    payload = {
        "nome": "Gabapentina 300mg (VO)",
        "principio_ativo": "Gabapentina",
        "via_administracao": "Oral (VO)",
        "dose_padrao": "1 cápsula (300mg)",
        "frequencia_padrao": "A cada 8 horas",
        "eh_dose_resgate": False,
        "sintoma_alvo": "Dor neuropática",
        "orientacoes_padrao": "Titular dose progressivamente. Atenção para sedação em idosos.",
        "ativo": True,
    }

    res_post = client.post("/api/catalog/medications", json=payload, headers=headers)
    assert res_post.status_code == 201
    created = res_post.json()
    assert created["id"] > 0
    assert created["nome"] == "Gabapentina 300mg (VO)"
    med_id = created["id"]

    # Atualiza a posologia padrão
    res_patch = client.patch(
        f"/api/catalog/medications/{med_id}",
        json={"dose_padrao": "1 cápsula (400mg)", "frequencia_padrao": "A cada 12 horas"},
        headers=headers,
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["dose_padrao"] == "1 cápsula (400mg)"
    assert res_patch.json()["frequencia_padrao"] == "A cada 12 horas"


def test_patient_cannot_create_or_delete_catalog_medication(client: TestClient, isolated_database):
    """Paciente não tem permissão para cadastrar ou desativar itens do catálogo institucional."""
    _, patient_token = _create_user("paciente.catalog4@zelo.com.br", "paciente", "Paciente Teste")
    headers = {"Authorization": f"Bearer {patient_token}"}

    payload = {
        "nome": "Remédio Não Autorizado",
        "via_administracao": "Oral (VO)",
        "dose_padrao": "1 cp",
        "frequencia_padrao": "1x ao dia",
    }
    res_post = client.post("/api/catalog/medications", json=payload, headers=headers)
    assert res_post.status_code == 403
    assert "Apenas a equipe assistencial ou médica pode gerenciar o catálogo" in res_post.json()["detail"]

    res_del = client.delete("/api/catalog/medications/1", headers=headers)
    assert res_del.status_code == 403
