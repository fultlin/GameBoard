// Типы и интерфейсы для игры "Морской бой"

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'destroyer' | 'submarine';
export type ShipOrientation = 'horizontal' | 'vertical';
export type GamePhase = 'placement' | 'battle' | 'finished';
export type PlayerType = 'player' | 'computer';

export interface Ship {
  id: string;
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
  position: { row: number; col: number };
  hits: number;
  isSunk: boolean;
}

export interface Cell {
  state: CellState;
  shipId?: string;
  isHit: boolean;
}

export interface GameBoard {
  cells: Cell[][];
  ships: Ship[];
}

export interface GameState {
  playerBoard: GameBoard;
  computerBoard: GameBoard;
  currentPlayer: PlayerType;
  gamePhase: GamePhase;
  winner: PlayerType | null;
  playerHits: number;
  computerHits: number;
  totalHits: number;
}

export interface ShipConfig {
  type: ShipType;
  size: number;
  count: number;
}

// Конфигурация флота
export const SHIP_CONFIGS: ShipConfig[] = [
  { type: 'carrier', size: 5, count: 1 },
  { type: 'battleship', size: 4, count: 1 },
  { type: 'cruiser', size: 3, count: 2 },
  { type: 'destroyer', size: 2, count: 3 },
  { type: 'submarine', size: 1, count: 4 },
];

export const BOARD_SIZE = 10;
export const TOTAL_SHIP_CELLS = SHIP_CONFIGS.reduce((total, config) => total + (config.size * config.count), 0);
