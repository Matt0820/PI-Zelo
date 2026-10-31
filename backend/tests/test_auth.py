import base64
import hashlib
import hmac
import json
import time

import pytest
from sqlalchemy import event
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.main import _hash_password, settings
from app.models import User


@pytest.fixture(scope="session")
def accounts():
    with SessionLocal() as db:
        patient = User(
            nome="Paciente de teste",
            email="paciente.teste@example.com",
            senha_hash=_hash_password("senha-teste-123"),
            perfil="paciente",
            prontuario="TESTE-001",
            ativo=True,
        )
        other_patient = User(
            nome="Outro paciente de teste",
            email="outro.teste@example.com",
            senha_hash=_hash_password("senha-teste-456"),
            perfil="paciente",
            prontuario="TESTE-002",
            ativo=True,
        )
        clinician = User(
            nome="Profissional de teste",
            email="equipe.teste@example.com",
            senha_hash=_hash_password("senha-teste-789"),
            perfil="assistencial",
            prontuario="EQUIPE-001",
            ativo=True,
        )
        db.add_all([patient, other_patient, clinician])
        db.commit()
        db.refresh(patient)
        db.refresh(other_patient)
        db.refresh(clinician)
        return {"patient": patient, "other_patient": other_patient, "clinician": clinician}


def _expired_token(user_id: int) -> str:
    encode = lambda value: base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")
    payload = encode(json.dumps({"sub": user_id, "role": "paciente", "exp": int(time.time()) - 1}).encode())
    signature = encode(hmac.new(settings.AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{signature}"


def test_login_accepts_valid_credentials(client, accounts):
    response = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-teste-123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["id"] == accounts["patient"].id
    assert body["access_token"]


def test_login_rejects_invalid_password(client, accounts):
    response = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-incorreta"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais invalidas. Verifique o identificador e a senha."


def test_protected_route_rejects_missing_token(client):
    response = client.get("/api/users")

    assert response.status_code == 401
    assert response.json()["detail"] == "Autenticação necessária."


@pytest.mark.parametrize("token_kind", ["expired", "tampered"])
def test_protected_route_rejects_invalid_tokens(client, accounts, token_kind):
    login = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-teste-123"},
    ).json()
    if token_kind == "expired":
        token = _expired_token(accounts["patient"].id)
    else:
        token = login["access_token"].rsplit(".", 1)[0] + ".invalid-signature"

    response = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Sessão inválida ou expirada. Entre novamente."


def test_patient_cannot_list_users_but_clinician_can(client, accounts):
    patient_login = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-teste-123"},
    ).json()
    clinician_login = client.post(
        "/api/auth/login",
        json={"email": accounts["clinician"].email, "senha": "senha-teste-789"},
    ).json()

    patient_response = client.get(
        "/api/users", headers={"Authorization": f"Bearer {patient_login['access_token']}"}
    )
    clinician_response = client.get(
        "/api/users", headers={"Authorization": f"Bearer {clinician_login['access_token']}"}
    )

    assert patient_response.status_code == 403
    assert patient_response.json()["detail"] == "Acesso restrito à equipe assistencial."
    assert clinician_response.status_code == 200


def test_patient_can_read_own_record_but_not_another_patient(client, accounts):
    login = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-teste-123"},
    ).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    own_record = client.get(f"/api/users/{accounts['patient'].id}", headers=headers)
    other_record = client.get(f"/api/users/{accounts['other_patient'].id}", headers=headers)

    assert own_record.status_code == 200
    assert own_record.json()["id"] == accounts["patient"].id
    assert other_record.status_code == 403
    assert other_record.json()["detail"] == "Acesso permitido apenas aos próprios dados."


def test_authentication_and_endpoint_share_one_session_and_transaction(client, accounts):
    login = client.post(
        "/api/auth/login",
        json={"email": accounts["patient"].email, "senha": "senha-teste-123"},
    ).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}
    session_ids = []
    transaction_session_ids = []

    def record_query_session(execute_state):
        session_ids.append(id(execute_state.session))

    def record_transaction(session, transaction, connection):
        transaction_session_ids.append(id(session))

    event.listen(Session, "do_orm_execute", record_query_session)
    event.listen(Session, "after_begin", record_transaction)
    try:
        response = client.get(f"/api/users/{accounts['patient'].id}", headers=headers)
    finally:
        event.remove(Session, "do_orm_execute", record_query_session)
        event.remove(Session, "after_begin", record_transaction)

    assert response.status_code == 200
    assert len(session_ids) == 1
    assert len(set(session_ids)) == 1
    assert len(set(transaction_session_ids)) == 1
    assert len(transaction_session_ids) == 1
