from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship


class Lobby(Base):
    __tablename__ = "lobbies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    max_players = Column(Integer, default=2)
    current_players = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    is_game_started = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    creator = relationship("User")


    def __repr__(self):
        return f"<Lobby(name='{self.name}')>"