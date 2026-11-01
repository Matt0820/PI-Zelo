"""API principal do projeto Zelo.

Modulo FastAPI com endpoints para:
- Autenticacao e gestao de usuarios (Equipe Assistencial, Pacientes e Cuidadores)
- Registro e consulta da Escala ESAS (10 sintomas multidimensionais, incluindo constipação)
- Fluxo conversacional da Triagem da Dor validado por juizes especialistas (IVC = 0,95)
- Central de Alertas e Triagem de Risco da Equipe de Saude (Novo -> Em revisao -> Tratado)
- Prontuario integrado, Medicamentos (RENAME), Mapa de Dor e Evolucoes Clinicas
"""

from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db, SessionLocal
from app.routers import auth_router, clinical_router, medications_router, users_router
from app.schemas import HealthResponse
from app.security import (
    _b64decode,
    _b64encode,
    _decode_access_token,
    _hash_password,
    _make_access_token,
    _verify_password,
    get_current_user,
)
from app.seed import seed_catalog_medications, seed_initial_data

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    swagger_ui_parameters={"persistAuthorization": True},
    dependencies=[Depends(get_current_user)],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(clinical_router)
app.include_router(medications_router)

frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
frontend_build_dir = frontend_dir / "dist"
frontend_static_dir = frontend_build_dir if (frontend_build_dir / "index.html").exists() else frontend_dir
if frontend_static_dir.exists():
    app.mount("/frontend", StaticFiles(directory=str(frontend_static_dir), html=True), name="frontend")





@app.on_event('startup')
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    user_columns = {column['name'] for column in inspect(engine).get_columns('users')}
    if 'motivo_cuidados_paliativos' not in user_columns:
        with engine.begin() as connection:
            connection.execute(
                text('ALTER TABLE users ADD COLUMN motivo_cuidados_paliativos TEXT NULL')
            )
    with SessionLocal() as db:
        seed_initial_data(db)
        seed_catalog_medications(db)


@app.get('/health', response_model=HealthResponse)
def health_check(db: Annotated[Session, Depends(get_db)]) -> dict:
    try:
        db.execute(text('SELECT 1'))
        db_type = 'sqlite' if settings.DATABASE_URL.startswith('sqlite') else 'mysql'
        return {'status': 'ok', 'database': db_type}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f'Database indisponivel: {exc}',
        ) from exc




















































@app.get('/favicon.ico', include_in_schema=False)
def favicon() -> FileResponse:
    return FileResponse(frontend_dir / 'favicon.ico', media_type='image/vnd.microsoft.icon')


@app.get('/')
def root(request: Request):
    if (frontend_build_dir / 'index.html').exists():
        return RedirectResponse(url='/frontend/index.html')
    host = request.url.hostname or '127.0.0.1'
    return RedirectResponse(url=f'{request.url.scheme}://{host}:5173/')


@app.get('/api')
def api_info() -> dict:
    return {
        'message': 'Zelo API ativa',
        'version': settings.APP_VERSION,
        'docs': '/docs',
        'swagger': '/openapi.json',
        'modulos': ['ESAS Multidimensional', 'Triagem Chatbot Zelo (Script Validado)', 'Central de Alertas', 'Prontuario Multiprofissional'],
    }
