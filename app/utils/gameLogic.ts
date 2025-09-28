import { BOARD_SIZE, Cell, CellState, GameBoard, Ship, SHIP_CONFIGS, ShipOrientation, ShipType } from '../types/game';

/**
 * Общее количество клеток кораблей
 */
export const TOTAL_SHIP_CELLS = SHIP_CONFIGS.reduce((total, config) => total + (config.size * config.count), 0);

/**
 * Создает пустое игровое поле
 */
export const createEmptyBoard = (): Cell[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null).map(() => ({
      state: 'empty' as CellState,
      isHit: false,
    }))
  );
};

/**
 * Создает пустое игровое поле с кораблями
 */
export const createEmptyGameBoard = (): GameBoard => ({
  cells: createEmptyBoard(),
  ships: [],
});

/**
 * Проверяет, можно ли разместить корабль в указанной позиции
 */
export const canPlaceShip = (
  board: Cell[][],
  ship: Ship,
  row: number,
  col: number,
  orientation: ShipOrientation
): boolean => {
  const { size } = ship;
  
  // Проверяем границы поля
  if (orientation === 'horizontal') {
    if (col + size > BOARD_SIZE) return false;
  } else {
    if (row + size > BOARD_SIZE) return false;
  }

  // Проверяем, что клетки свободны и не соприкасаются с другими кораблями
  for (let i = 0; i < size; i++) {
    const checkRow = orientation === 'horizontal' ? row : row + i;
    const checkCol = orientation === 'horizontal' ? col + i : col;

    // Проверяем саму клетку
    if (board[checkRow][checkCol].state !== 'empty') {
      return false;
    }

    // Проверяем соседние клетки (включая диагонали)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const neighborRow = checkRow + dr;
        const neighborCol = checkCol + dc;
        
        if (neighborRow >= 0 && neighborRow < BOARD_SIZE && 
            neighborCol >= 0 && neighborCol < BOARD_SIZE) {
          if (board[neighborRow][neighborCol].state === 'ship') {
            return false;
          }
        }
      }
    }
  }

  return true;
};

/**
 * Размещает корабль на поле
 */
export const placeShip = (
  board: Cell[][],
  ship: Ship,
  row: number,
  col: number,
  orientation: ShipOrientation
): Cell[][] => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const { size } = ship;

  for (let i = 0; i < size; i++) {
    const shipRow = orientation === 'horizontal' ? row : row + i;
    const shipCol = orientation === 'horizontal' ? col + i : col;
    
    newBoard[shipRow][shipCol] = {
      state: 'ship',
      shipId: ship.id,
      isHit: false,
    };
  }

  return newBoard;
};

/**
 * Создает корабль
 */
export const createShip = (
  type: ShipType,
  id: string,
  row: number,
  col: number,
  orientation: ShipOrientation
): Ship => {
  const config = SHIP_CONFIGS.find(c => c.type === type);
  if (!config) {
    throw new Error(`Неизвестный тип корабля: ${type}`);
  }

  return {
    id,
    type,
    size: config.size,
    orientation,
    position: { row, col },
    hits: 0,
    isSunk: false,
  };
};

/**
 * Автоматическая расстановка кораблей
 */
export const autoPlaceShips = (): GameBoard => {
  const board = createEmptyGameBoard();
  const ships: Ship[] = [];
  let shipId = 0;

  for (const config of SHIP_CONFIGS) {
    for (let i = 0; i < config.count; i++) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;

      while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

        const ship = createShip(config.type, `ship_${shipId++}`, row, col, orientation);

        if (canPlaceShip(board.cells, ship, row, col, orientation)) {
          board.cells = placeShip(board.cells, ship, row, col, orientation);
          ships.push(ship);
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        throw new Error(`Не удалось разместить корабль ${config.type}`);
      }
    }
  }

  board.ships = ships;
  return board;
};

/**
 * Проверяет, завершена ли расстановка кораблей
 */
export const isPlacementComplete = (board: GameBoard): boolean => {
  return board.ships.length === SHIP_CONFIGS.reduce((total, config) => total + config.count, 0);
};

/**
 * Помечает клетки вокруг потопленного корабля как промахи
 */
const markCellsAroundShip = (board: GameBoard, ship: Ship): void => {
  const { position: { row, col }, size, orientation } = ship;
  
  // Обходим все клетки корабля и их соседей
  for (let i = 0; i < size; i++) {
    const shipRow = orientation === 'horizontal' ? row : row + i;
    const shipCol = orientation === 'horizontal' ? col + i : col;
    
    // Проверяем всех соседей клетки (включая диагонали)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const neighborRow = shipRow + dr;
        const neighborCol = shipCol + dc;
        
        // Проверяем, что координаты в пределах поля
        if (neighborRow >= 0 && neighborRow < BOARD_SIZE && 
            neighborCol >= 0 && neighborCol < BOARD_SIZE) {
          
          const neighborCell = board.cells[neighborRow][neighborCol];
          
          // Если клетка еще не обстреляна и в ней нет корабля, помечаем как промах
          if (!neighborCell.isHit && neighborCell.state !== 'ship') {
            neighborCell.isHit = true;
            neighborCell.state = 'miss';
          }
        }
      }
    }
  }
};

/**
 * Выполняет выстрел по указанной клетке
 */
export const makeShot = (
  board: GameBoard,
  row: number,
  col: number
): { hit: boolean; sunk: boolean; ship?: Ship; newBoard?: GameBoard } => {
  const cell = board.cells[row][col];
  
  if (cell.isHit) {
    return { hit: false, sunk: false }; // Уже стреляли по этой клетке
  }

  // Создаем копию доски
  const newBoard = {
    ...board,
    cells: board.cells.map(row => row.map(cell => ({ ...cell }))),
    ships: board.ships.map(ship => ({ 
      ...ship, 
      position: { ...ship.position }
    }))
  };

  const newCell = newBoard.cells[row][col];
  newCell.isHit = true;

  if (newCell.state === 'ship' && newCell.shipId) {
    // Попадание
    newCell.state = 'hit';
    const ship = newBoard.ships.find(s => s.id === newCell.shipId);
    
    if (ship) {
      ship.hits++;
      
      if (ship.hits >= ship.size) {
        ship.isSunk = true;
        // Помечаем все клетки корабля как потопленные
        markShipAsSunk(newBoard, ship);
        // Помечаем клетки вокруг корабля как промахи
        markCellsAroundShip(newBoard, ship);
        return { hit: true, sunk: true, ship, newBoard };
      }
      
      return { hit: true, sunk: false, ship, newBoard };
    } else {
      // Корабль не найден - это ошибка в данных
      console.error('Ship not found for shipId:', newCell.shipId);
      return { hit: false, sunk: false, newBoard };
    }
  } else {
    // Промах
    newCell.state = 'miss';
    return { hit: false, sunk: false, newBoard };
  }
};

/**
 * Помечает все клетки корабля как потопленные
 */
const markShipAsSunk = (board: GameBoard, ship: Ship): void => {
  const { position: { row, col }, size, orientation } = ship;
  
  for (let i = 0; i < size; i++) {
    const shipRow = orientation === 'horizontal' ? row : row + i;
    const shipCol = orientation === 'horizontal' ? col + i : col;
    
    // Проверяем, что координаты в пределах поля
    if (shipRow >= 0 && shipRow < BOARD_SIZE && shipCol >= 0 && shipCol < BOARD_SIZE) {
      board.cells[shipRow][shipCol].state = 'sunk';
    }
  }
};

/**
 * Проверяет, потоплены ли все корабли
 */
export const areAllShipsSunk = (board: GameBoard): boolean => {
  return board.ships.every(ship => ship.isSunk);
};

/**
 * Проверяет, все ли клетки обстреляны
 */
export const areAllCellsShot = (board: GameBoard): boolean => {
  return board.cells.every(row => row.every(cell => cell.isHit));
};

/**
 * Подсчитывает количество попаданий
 */
export const countHits = (board: GameBoard): number => {
  return board.ships.reduce((total, ship) => total + ship.hits, 0);
};

/**
 * Получает статистику по кораблям
 */
export const getShipStats = (board: GameBoard) => {
  const totalShips = board.ships.length;
  const sunkShips = board.ships.filter(ship => ship.isSunk).length;
  const totalHits = countHits(board);
  
  return {
    totalShips,
    sunkShips,
    remainingShips: totalShips - sunkShips,
    totalHits,
    totalCells: TOTAL_SHIP_CELLS,
  };
};