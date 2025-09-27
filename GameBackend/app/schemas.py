from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        orm_mode = True

class LobbyBase(BaseModel):
    name: str
    max_players: int = 2

class LobbyCreate(LobbyBase):
    pass

class Lobby(LobbyBase):
    id: int
    creator_id: int
    current_players: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class LobbyBase(BaseModel):
    name: str
    max_players: int = 2

class LobbyCreate(LobbyBase):
    pass

class Lobby(LobbyBase):
    id: int
    creator_id: int
    current_players: int
    is_active: bool
    is_game_started: bool
    created_at: datetime
    creator: User
    
    class Config:
        from_attributes = True

class LobbyDetail(Lobby):
    players: List['Player']

class PlayerBase(BaseModel):
    user_id: int
    lobby_id: int

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    id: int
    is_ready: bool
    joined_at: datetime
    user: User
    
    class Config:
        from_attributes = True

class GameBase(BaseModel):
    lobby_id: int

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: int
    current_turn: int
    is_finished: bool
    winner_id: Optional[int]
    created_at: datetime
    winner: Optional[User]
    
    class Config:
        from_attributes = True

class GameState(BaseModel):
    player_board: List[List[str]]
    opponent_board: List[List[str]]
    player_ships: List[dict]
    opponent_ships: List[dict]
    current_turn: int
    game_status: str

class ShipPlacement(BaseModel):
    ship_type: str
    positions: List[List[int]]
    orientation: str

class AttackRequest(BaseModel):
    x: int
    y: int

class AttackResponse(BaseModel):
    hit: bool
    ship_sunk: bool
    game_status: str
    next_turn: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class WebSocketMessage(BaseModel):
    type: str
    data: dict
    user_id: int
    lobby_id: int

class LobbyJoinResponse(BaseModel):
    message: str
    lobby: LobbyDetail
    players: List[Player]

class ReadyRequest(BaseModel):
    is_ready: bool

class GameStartResponse(BaseModel):
    message: str
    game_id: int
    player_number: int

# Для обработки взаимных ссылок
LobbyDetail.update_forward_refs()