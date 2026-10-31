"""Routers organizados por área funcional da API."""

from app.routers.auth import router as auth_router
from app.routers.clinical import router as clinical_router
from app.routers.medications import router as medications_router
from app.routers.users import router as users_router

__all__ = ['auth_router', 'clinical_router', 'medications_router', 'users_router']
