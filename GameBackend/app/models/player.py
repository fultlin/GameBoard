from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lobby_id = Column(Integer, ForeignKey("lobbies.id"))
    is_ready = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Player(user_id='{self.user_id}')>"