import pytest

from app.database import SessionLocal
from app.main import _hash_password
from app.models import User


ESAS_FIELDS = (
    "dor",
    "cansaco",
    "nausea",
    "depressao",
    "ansiedade",
    "sonolencia",
    "apetite",
    "mal_estar",
    "falta_de_ar",
    "constipacao",
)


@pytest.fixture(scope="module")
def clinical_accounts(isolated_database):
    with SessionLocal() as db:
        patient = User(
            nome="Paciente ESAS de teste",
            email="paciente.esas@example.com",
            senha_hash=_hash_password("senha-esas-123"),
            perfil="paciente",
            prontuario="ESAS-TESTE-001",
            ativo=True,
        )
        clinician = User(
            nome="Equipe ESAS de teste",
            email="equipe.esas@example.com",
            senha_hash=_hash_password("senha-esas-456"),
            perfil="assistencial",
            prontuario="ESAS-EQUIPE-001",
            ativo=True,
        )
        physician = User(
            nome="Médica ESAS de teste",
            email="medica.esas@example.com",
            senha_hash=_hash_password("senha-esas-789"),
            perfil="medico",
            prontuario="ESAS-MEDICO-001",
            ativo=True,
        )
        db.add_all([patient, clinician, physician])
        db.commit()
        db.refresh(patient)
        db.refresh(clinician)
        db.refresh(physician)
        return {"patient": patient, "clinician": clinician, "physician": physician}


def _login(client, user, password):
    response = client.post("/api/auth/login", json={"email": user.email, "senha": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _esas_payload(**overrides):
    payload = {field: 0 for field in ESAS_FIELDS}
    payload.update(overrides)
    return payload


@pytest.mark.parametrize(
    ("score", "severity", "triage", "creates_alert"),
    [
        (0, "leve", False, False),
        (3, "leve", False, False),
        (4, "moderada", False, False),
        (6, "moderada", False, False),
        (7, "grave", True, True),
        (10, "grave", True, True),
    ],
)
def test_pain_threshold_calculates_severity_triage_and_alert(
    client, clinical_accounts, score, severity, triage, creates_alert
):
    patient = clinical_accounts["patient"]
    patient_headers = _login(client, patient, "senha-esas-123")
    team_headers = _login(client, clinical_accounts["clinician"], "senha-esas-456")

    before = client.get("/api/alertas", headers=team_headers)
    assert before.status_code == 200
    previous_alert_ids = {
        alert["id"] for alert in before.json() if alert["user_id"] == patient.id
    }

    response = client.post(
        f"/api/users/{patient.id}/esas",
        headers=patient_headers,
        json=_esas_payload(dor=score),
    )

    assert response.status_code == 201
    assert response.json()["gravidade_maxima"] == severity
    assert response.json()["acionou_triagem_dor"] is triage

    after = client.get("/api/alertas", headers=team_headers)
    assert after.status_code == 200
    new_alerts = [
        alert for alert in after.json()
        if alert["user_id"] == patient.id and alert["id"] not in previous_alert_ids
    ]
    assert len(new_alerts) == int(creates_alert)
    if creates_alert:
        assert new_alerts[0]["tipo_alerta"] == "dor_grave"
        assert f"({score}/10)" in new_alerts[0]["titulo"]
        assert new_alerts[0]["severidade"] == "grave"
        assert new_alerts[0]["estado"] == "Novo"


@pytest.mark.parametrize("score", [0, 10])
def test_esas_accepts_inclusive_score_bounds(client, clinical_accounts, score):
    patient = clinical_accounts["patient"]
    headers = _login(client, patient, "senha-esas-123")

    response = client.post(
        f"/api/users/{patient.id}/esas",
        headers=headers,
        json=_esas_payload(**{field: score for field in ESAS_FIELDS}),
    )

    assert response.status_code == 201
    assert all(response.json()[field] == score for field in ESAS_FIELDS)


@pytest.mark.parametrize("score", [-1, 11])
def test_esas_rejects_scores_outside_bounds(client, clinical_accounts, score):
    patient = clinical_accounts["patient"]
    headers = _login(client, patient, "senha-esas-123")

    response = client.post(
        f"/api/users/{patient.id}/esas",
        headers=headers,
        json=_esas_payload(dor=score),
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "field",
    ["cansaco", "nausea", "depressao", "ansiedade", "sonolencia", "apetite", "mal_estar", "falta_de_ar", "constipacao"],
)
def test_any_severe_non_pain_esas_symptom_creates_clinical_alert(client, clinical_accounts, field):
    patient = clinical_accounts["patient"]
    patient_headers = _login(client, patient, "senha-esas-123")
    team_headers = _login(client, clinical_accounts["clinician"], "senha-esas-456")
    before = client.get("/api/alertas", headers=team_headers).json()
    previous_alert_ids = {
        alert["id"] for alert in before if alert["user_id"] == patient.id
    }

    response = client.post(
        f"/api/users/{patient.id}/esas",
        headers=patient_headers,
        json=_esas_payload(dor=3, **{field: 9}),
    )

    assert response.status_code == 201
    assert response.json()["gravidade_maxima"] == "grave"
    assert response.json()["acionou_triagem_dor"] is False

    after = client.get("/api/alertas", headers=team_headers).json()
    new_patient_alerts = [
        alert for alert in after
        if alert["user_id"] == patient.id and alert["id"] not in previous_alert_ids
    ]
    assert len(new_patient_alerts) == 1
    assert new_patient_alerts[0]["tipo_alerta"] == "sintoma_grave"
    assert new_patient_alerts[0]["severidade"] == "grave"
    assert new_patient_alerts[0]["estado"] == "Novo"


def test_medico_can_review_alerts_and_read_patient_records_but_not_write_them(client, clinical_accounts):
    patient = clinical_accounts["patient"]
    patient_headers = _login(client, patient, "senha-esas-123")
    physician_headers = _login(client, clinical_accounts["physician"], "senha-esas-789")

    created_esas = client.post(
        f"/api/users/{patient.id}/esas",
        headers=patient_headers,
        json=_esas_payload(dor=8),
    )
    assert created_esas.status_code == 201

    patient_list = client.get("/api/users?perfil=paciente", headers=physician_headers)
    assert patient_list.status_code == 200
    assert any(item["id"] == patient.id for item in patient_list.json())

    patient_record = client.get(f"/api/users/{patient.id}/esas", headers=physician_headers)
    assert patient_record.status_code == 200
    assert len(patient_record.json()) >= 1

    alerts = client.get("/api/alertas", headers=physician_headers)
    assert alerts.status_code == 200
    alert = next(item for item in alerts.json() if item["user_id"] == patient.id)

    updated = client.request(
        "PATCH",
        f"/api/alertas/{alert['id']}",
        headers=physician_headers,
        json={"estado": "Em revisao"},
    )
    assert updated.status_code == 200
    assert updated.json()["estado"] == "Em revisao"

    denied_write = client.post(
        f"/api/users/{patient.id}/esas",
        headers=physician_headers,
        json=_esas_payload(dor=1),
    )
    assert denied_write.status_code == 403

    unfiltered_list = client.get("/api/users", headers=physician_headers)
    assert unfiltered_list.status_code == 403


def test_esas_alert_reports_each_high_symptom_and_correct_pain_score(client, clinical_accounts):
    patient = clinical_accounts["patient"]
    patient_headers = _login(client, patient, "senha-esas-123")
    team_headers = _login(client, clinical_accounts["clinician"], "senha-esas-456")
    before = client.get("/api/alertas", headers=team_headers).json()
    previous_alert_ids = {
        alert["id"] for alert in before if alert["user_id"] == patient.id
    }

    response = client.post(
        f"/api/users/{patient.id}/esas",
        headers=patient_headers,
        json=_esas_payload(dor=7, nausea=9, constipacao=8),
    )
    assert response.status_code == 201

    after = client.get("/api/alertas", headers=team_headers).json()
    alert = next(
        item for item in after
        if item["user_id"] == patient.id and item["id"] not in previous_alert_ids
    )
    assert "Dor intensa (7/10)" in alert["titulo"]
    assert "dor 7/10" in alert["descricao"]
    assert "náusea 9/10" in alert["descricao"]
    assert "constipação 8/10" in alert["descricao"]
