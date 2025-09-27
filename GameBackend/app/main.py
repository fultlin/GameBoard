from fastapi import FastAPI, Depends, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.api import auth, lobby
from app.database import Base

Base.metadata.create_all(bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

class CustomJSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"

app = FastAPI(
    title="Sea Battle API",
    description="API для игры Морской Бой",
    version="1.0.0",
    default_response_class=CustomJSONResponse
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_charset_header(request, call_next):
    response = await call_next(request)
    if response.headers.get("content-type", "").startswith("application/json"):
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response

app.include_router(auth.router)
app.include_router(lobby.router)

router = APIRouter()

@router.get("/welcome")
async def welcome_message():
    return {
        "message": "ДОБРО ПОЖАЛОВАТЬ В АПИ ДЛЯ МОРСКОГО БОЯ!",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth - регистрация и аутентификация",
            "lobby": "/api/lobby - управление лобби",
            "game": "/api/game - управление игрой"
        }
    }

@app.get("/")
async def root():
    return {"message": "ДОБРО ПОЖАЛОВАТЬ В АПИ ДЛЯ МОРСКОГО БОЯ!"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

app.include_router(router)