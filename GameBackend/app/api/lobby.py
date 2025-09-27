from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/lobby", tags=["lobby"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, lobby_id: int):
        await websocket.accept()
        if lobby_id not in self.active_connections:
            self.active_connections[lobby_id] = []
        self.active_connections[lobby_id].append(websocket)

    def disconnect(self, websocket: WebSocket, lobby_id: int):
        if lobby_id in self.active_connections:
            self.active_connections[lobby_id].remove(websocket)

    async def broadcast(self, message: dict, lobby_id: int):
        if lobby_id in self.active_connections:
            for connection in self.active_connections[lobby_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

@router.post("/", response_model=schemas.Lobby)
def create_lobby(
    lobby: schemas.LobbyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_lobby = models.Lobby(
        name=lobby.name,
        creator_id=current_user.id,
        max_players=lobby.max_players
    )
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    
    # Создаем запись игрока
    player = models.Player(user_id=current_user.id, lobby_id=db_lobby.id)
    db.add(player)
    db.commit()
    
    return db_lobby

@router.get("/", response_model=list[schemas.Lobby])
def get_lobbies(db: Session = Depends(get_db)):
    return db.query(models.Lobby).filter(
        models.Lobby.is_active == True,
        models.Lobby.is_game_started == False
    ).all()

@router.get("/{lobby_id}", response_model=schemas.Lobby)
def get_lobby(lobby_id: int, db: Session = Depends(get_db)):
    lobby = db.query(models.Lobby).filter(models.Lobby.id == lobby_id).first()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby

@router.post("/{lobby_id}/join", response_model=schemas.Lobby)
def join_lobby(
    lobby_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    lobby = db.query(models.Lobby).filter(models.Lobby.id == lobby_id).first()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    
    if lobby.current_players >= lobby.max_players:
        raise HTTPException(status_code=400, detail="Lobby is full")
    
    if lobby.is_game_started:
        raise HTTPException(status_code=400, detail="Game already started")
    
    # Проверяем, не присоединился ли уже пользователь
    existing_player = db.query(models.Player).filter(
        models.Player.user_id == current_user.id,
        models.Player.lobby_id == lobby_id
    ).first()
    
    if existing_player:
        raise HTTPException(status_code=400, detail="Already in lobby")
    
    # Добавляем игрока
    player = models.Player(user_id=current_user.id, lobby_id=lobby_id)
    db.add(player)
    
    lobby.current_players += 1
    db.commit()
    db.refresh(lobby)
    
    return lobby

@router.post("/{lobby_id}/leave")
def leave_lobby(
    lobby_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    player = db.query(models.Player).filter(
        models.Player.user_id == current_user.id,
        models.Player.lobby_id == lobby_id
    ).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not in lobby")
    
    lobby = db.query(models.Lobby).filter(models.Lobby.id == lobby_id).first()
    lobby.current_players -= 1
    
    # Если лобби пустое, удаляем его
    if lobby.current_players == 0:
        db.delete(lobby)
    else:
        # Если вышел создатель, назначаем нового
        if lobby.creator_id == current_user.id:
            new_creator = db.query(models.Player).filter(
                models.Player.lobby_id == lobby_id,
                models.Player.user_id != current_user.id
            ).first()
            if new_creator:
                lobby.creator_id = new_creator.user_id
    
    db.delete(player)
    db.commit()
    
    return {"message": "Left lobby"}

@router.websocket("/ws/{lobby_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, lobby_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data, lobby_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, lobby_id)