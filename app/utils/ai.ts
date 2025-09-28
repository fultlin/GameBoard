import { BOARD_SIZE, GameBoard } from '../types/game';
import { makeShot } from './gameLogic';

export interface AIState {
  mode: 'hunting' | 'targeting';
  lastHit: { row: number; col: number } | null;
  targetDirection: 'horizontal' | 'vertical' | 'both' | null;
  shots: Set<string>;
  potentialTargets: { row: number; col: number }[];
}

/**
 * Создает начальное состояние ИИ
 */
export const createAIState = (): AIState => ({
  mode: 'hunting',
  lastHit: null,
  targetDirection: null,
  shots: new Set(),
  potentialTargets: [],
});

/**
 * Генерирует случайный выстрел в режиме охоты
 */
const generateHuntingShot = (aiState: AIState): { row: number; col: number } => {
  // Создаем список всех доступных клеток
  const availableCells: { row: number; col: number }[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const shotKey = `${row},${col}`;
      if (!aiState.shots.has(shotKey)) {
        availableCells.push({ row, col });
      }
    }
  }
  
  if (availableCells.length === 0) {
    // Если все клетки обстреляны, возвращаем первую клетку (это не должно происходить в нормальной игре)
    return { row: 0, col: 0 };
  }
  
  // Выбираем случайную клетку из доступных
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
};

/**
 * Генерирует выстрел в режиме преследования
 */
const generateTargetingShot = (aiState: AIState): { row: number; col: number } => {
  if (!aiState.lastHit) {
    return generateHuntingShot(aiState);
  }

  const { row: hitRow, col: hitCol } = aiState.lastHit;
  
  // Создаем список возможных целей в зависимости от направления
  let directions: { row: number; col: number }[] = [];
  
  // Если направление не определено, пробуем все направления
  if (!aiState.targetDirection || aiState.targetDirection === 'both') {
    directions = [
      { row: hitRow - 1, col: hitCol }, // вверх
      { row: hitRow + 1, col: hitCol }, // вниз
      { row: hitRow, col: hitCol - 1 }, // влево
      { row: hitRow, col: hitCol + 1 }, // вправо
    ];
  } else if (aiState.targetDirection === 'horizontal') {
    // Пробуем влево и вправо от попадания
    directions = [
      { row: hitRow, col: hitCol - 1 },
      { row: hitRow, col: hitCol + 1 },
    ];
  } else if (aiState.targetDirection === 'vertical') {
    // Пробуем вверх и вниз от попадания
    directions = [
      { row: hitRow - 1, col: hitCol },
      { row: hitRow + 1, col: hitCol },
    ];
  }
  
  // Фильтруем доступные направления
  const availableDirections = directions.filter(({ row, col }) => {
    const shotKey = `${row},${col}`;
    return row >= 0 && row < BOARD_SIZE && 
           col >= 0 && col < BOARD_SIZE && 
           !aiState.shots.has(shotKey);
  });
  
  if (availableDirections.length > 0) {
    // Выбираем случайное доступное направление
    const randomIndex = Math.floor(Math.random() * availableDirections.length);
    return availableDirections[randomIndex];
  }
  
  // Если не удалось найти цель в текущем направлении, переходим в режим охоты
  aiState.mode = 'hunting';
  aiState.lastHit = null;
  aiState.targetDirection = null;
  
  return generateHuntingShot(aiState);
};

/**
 * Обновляет состояние ИИ после выстрела
 */
export const updateAIState = (
  aiState: AIState,
  shot: { row: number; col: number },
  hit: boolean,
  sunk: boolean
): void => {
  const shotKey = `${shot.row},${shot.col}`;
  aiState.shots.add(shotKey);
  
  if (hit && !sunk) {
    // Попадание, но корабль не потоплен
    if (aiState.mode === 'hunting') {
      // Первое попадание - переходим в режим преследования
      aiState.mode = 'targeting';
      aiState.lastHit = shot;
      aiState.targetDirection = 'both';
    } else if (aiState.mode === 'targeting') {
      // Определяем направление корабля
      if (aiState.lastHit) {
        const { row: lastRow, col: lastCol } = aiState.lastHit;
        
        if (shot.row === lastRow) {
          // Горизонтальное направление
          aiState.targetDirection = 'horizontal';
        } else if (shot.col === lastCol) {
          // Вертикальное направление
          aiState.targetDirection = 'vertical';
        }
      }
      
      aiState.lastHit = shot;
    }
  } else if (hit && sunk) {
    // Корабль потоплен - возвращаемся в режим охоты
    aiState.mode = 'hunting';
    aiState.lastHit = null;
    aiState.targetDirection = null;
  } else {
    // Промах
    if (aiState.mode === 'targeting') {
      // Если в режиме преследования и промах, пробуем другое направление
      if (aiState.targetDirection === 'both') {
        // Определяем направление на основе предыдущих попаданий
        if (aiState.lastHit) {
          const { row: lastRow, col: lastCol } = aiState.lastHit;
          
          if (shot.row === lastRow) {
            aiState.targetDirection = 'horizontal';
          } else if (shot.col === lastCol) {
            aiState.targetDirection = 'vertical';
          }
        }
      }
    }
  }
};

/**
 * Генерирует следующий выстрел ИИ
 */
export const generateAIShot = (aiState: AIState): { row: number; col: number } => {
  try {
    if (aiState.mode === 'hunting') {
      return generateHuntingShot(aiState);
    } else {
      return generateTargetingShot(aiState);
    }
  } catch (error) {
    console.error('Error generating AI shot:', error);
    // В случае ошибки возвращаем безопасный выстрел
    return { row: 0, col: 0 };
  }
};

/**
 * Выполняет выстрел ИИ
 */
export const executeAIShot = (
  board: GameBoard,
  aiState: AIState
): { shot: { row: number; col: number }; hit: boolean; sunk: boolean; ship?: any; newBoard?: GameBoard } => {
  try {
    const shot = generateAIShot(aiState);
    const result = makeShot(board, shot.row, shot.col);
    
    updateAIState(aiState, shot, result.hit, result.sunk);
    
    return {
      shot,
      hit: result.hit,
      sunk: result.sunk,
      ship: result.ship || undefined,
      newBoard: result.newBoard,
    };
  } catch (error) {
    console.error('Error executing AI shot:', error);
    // В случае ошибки возвращаем безопасный результат
    return {
      shot: { row: 0, col: 0 },
      hit: false,
      sunk: false,
      newBoard: board
    };
  }
};