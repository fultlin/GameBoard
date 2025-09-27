from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.get("/welcome")
async def welcome_message():
    return {
        "message": "ДОБРО ПОЖАЛОВАТЬ В АПИ ДЛЯ МОРСКОГО БОЯ!",
        "version": "1.0.0",
        "endpoints": {
            "game": "/api/game - управление игрой",
            "ships": "/api/ships - расстановка кораблей",
            "battle": "/api/battle - ходы в битве"
        }
    }

@router.get("/api/game")
async def game_info():
    return {
        "game": "Морской Бой",
        "status": "ready",
        "description": "API для игры в морской бой"
    }

@router.post("/api/test-db")
async def test_database(db: Session = Depends(get_db)):
    """Тестовый эндпоинт для проверки работы с БД"""
    try:
        result = db.execute("SELECT version()").fetchone()
        return {
            "status": "success", 
            "database_version": result[0],
            "message": "PostgreSQL подключен успешно!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка БД: {str(e)}")