"""Autenticação, tokens e autorização das requisições da API."""

import base64
import hashlib
import hmac
import json
import re
import secrets
import time
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b'=').decode('ascii')


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + '=' * (-len(value) % 4))


def _make_access_token(user: User) -> str:
    payload = _b64encode(json.dumps({
        'sub': user.id,
        'role': user.perfil,
        'exp': int(time.time()) + settings.AUTH_TOKEN_TTL_SECONDS,
    }, separators=(',', ':')).encode())
    signature = _b64encode(hmac.new(settings.AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
    return f'{payload}.{signature}'


def _decode_access_token(token: str) -> dict:
    try:
        payload, signature = token.split('.', 1)
        expected = _b64encode(hmac.new(settings.AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError('assinatura inválida')
        claims = json.loads(_b64decode(payload))
        if int(claims['exp']) <= int(time.time()):
            raise ValueError('token expirado')
        return claims
    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=401, detail='Sessão inválida ou expirada. Entre novamente.') from exc


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 310_000)
    return f'pbkdf2_sha256$310000${_b64encode(salt)}${_b64encode(digest)}'


def _verify_password(password: str, stored: str) -> tuple[bool, bool]:
    """Retorna (válida, precisa migrar); atualiza hashes legados após login válido."""
    if stored.startswith('pbkdf2_sha256$'):
        try:
            _, rounds, salt, expected = stored.split('$', 3)
            actual = _b64encode(hashlib.pbkdf2_hmac('sha256', password.encode(), _b64decode(salt), int(rounds)))
            return hmac.compare_digest(actual, expected), False
        except (ValueError, TypeError):
            return False, False
    legacy = hashlib.sha256(password.encode('utf-8')).hexdigest()
    valid = hmac.compare_digest(stored, legacy)
    return valid, valid


def get_current_user(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> User | None:
    """Valida sessão e autorização usando a mesma sessão do endpoint."""
    path = request.url.path
    if not path.startswith('/api/') or request.method == 'OPTIONS':
        return None

    public = (path in {'/api/auth/login', '/api/login'} or (path == '/api/users' and request.method == 'POST'))
    if public:
        return None

    header = request.headers.get('authorization', '')
    if not header.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='Autenticação necessária.')

    claims = _decode_access_token(header[7:].strip())

    try:
        user = db.get(User, int(claims.get('sub')))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail='Sessão inválida. Entre novamente.') from None
    if not user or not user.ativo:
        raise HTTPException(status_code=401, detail='Conta inativa ou inexistente. Entre novamente.')

    is_team = user.perfil in {'admin', 'assistencial', 'medico'}
    is_medico = user.perfil == 'medico'
    if path == '/api/seed' and user.perfil != 'admin':
        raise HTTPException(status_code=403, detail='Apenas administradores podem popular a base.')
    if path.startswith('/api/catalog/medications') and request.method in {'POST', 'PATCH', 'PUT', 'DELETE'} and not is_team:
        raise HTTPException(status_code=403, detail='Apenas a equipe assistencial ou médica pode gerenciar o catálogo de medicamentos.')
    if path == '/api/users' and request.method == 'GET' and not is_team:
        if not is_medico or request.query_params.get('perfil') != 'paciente':
            raise HTTPException(status_code=403, detail='Acesso restrito à equipe assistencial.')
    if path.startswith('/api/alertas') and not is_team:
        if not is_medico or request.method not in {'GET', 'PATCH'}:
            raise HTTPException(status_code=403, detail='Acesso restrito à equipe assistencial.')
    user_path = re.match(r'^/api/users/(\d+)(?:/|$)', path)
    if user_path and not is_team:
        is_own_record = int(user_path.group(1)) == user.id
        if not is_own_record and not (is_medico and request.method == 'GET'):
            raise HTTPException(status_code=403, detail='Acesso permitido apenas aos próprios dados.')
        if is_medico and request.method not in {'GET', 'HEAD', 'OPTIONS'}:
            raise HTTPException(status_code=403, detail='O perfil médico possui acesso de leitura aos prontuários.')
    if user_path and not is_team and request.method in {'POST', 'PATCH', 'PUT', 'DELETE'} and re.search(r'/(evolucoes|medications|orientations|rescue-doses)(?:/|$)', path):
        patient_medication_action = request.method == 'POST' and (
            re.fullmatch(rf'/api/users/{user.id}/rescue-doses', path)
            or re.fullmatch(rf'/api/users/{user.id}/medications/\d+/(confirm|undo-confirmation)', path)
        )
        if not patient_medication_action:
            raise HTTPException(status_code=403, detail='Esta ação é restrita à equipe assistencial.')

    request.state.current_user = user
    return user
