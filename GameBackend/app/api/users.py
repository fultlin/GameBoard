# app/api/users.py
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=list[schemas.UserWithOnline])
def get_all_users(
    db: Session = Depends(get_db),
):
    users = db.query(models.User).filter(models.User.is_active == True).all()
    
    # Используем timezone-aware datetime
    online_threshold = datetime.now(timezone.utc) - timedelta(minutes=5)
    
    users_with_online = []
    for user in users:
        # Проверяем, что last_seen не None
        if user.last_seen is None:
            is_online = False
        else:
            # Приводим к тому же типу (timezone-aware) для сравнения
            user_last_seen = user.last_seen.replace(tzinfo=timezone.utc) if user.last_seen.tzinfo is None else user.last_seen
            is_online = user_last_seen >= online_threshold
        
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "is_active": user.is_active,
            "last_seen": user.last_seen,
            "is_online": is_online  # Вычисляемое поле
        }
        users_with_online.append(schemas.UserWithOnline(**user_dict))
    
    return users_with_online

@router.get("/online", response_model=list[schemas.User])
def get_online_users(db: Session = Depends(get_db)):
    """Получить только онлайн пользователей"""
    online_threshold = datetime.now(timezone.utc) - timedelta(minutes=5)
    online_users = db.query(models.User).filter(
        models.User.is_active == True,
        models.User.last_seen >= online_threshold
    ).all()
    return online_users

@router.post("/update_online_status")
def update_online_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновляет время последней активности пользователя"""
    # Используем timezone-aware datetime
    current_user.last_seen = datetime.now(timezone.utc)
    db.commit()
    return {"status": "online_status_updated"}