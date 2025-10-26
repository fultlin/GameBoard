import { BOARD_SIZE, GameBoard } from '../types/game';
import { makeShot } from './gameLogic';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AIState {
  mode: 'hunting' | 'targeting';
  lastHit: { row: number; col: number } | null;
  targetDirection: 'horizontal' | 'vertical' | 'both' | null;
  shots: Set<string>;
  potentialTargets: { row: number; col: number }[];
  difficulty: DifficultyLevel;
  hitStreak: number;
  missStreak: number;
  adaptiveStrategy: 'aggressive' | 'defensive' | 'balanced';
  lastShotTime: number;
  patternMemory: { row: number; col: number; result: 'hit' | 'miss' }[];
}

/**
 * Создает начальное состояние ИИ
 */
export const createAIState = (difficulty: DifficultyLevel = 'medium'): AIState => ({
  mode: 'hunting',
  lastHit: null,
  targetDirection: null,
  shots: new Set(),
  potentialTargets: [],
  difficulty,
  hitStreak: 0,
  missStreak: 0,
  adaptiveStrategy: 'balanced',
  lastShotTime: Date.now(),
  patternMemory: [],
});

/**
 * Получает конфигурацию сложности
 */
const getDifficultyConfig = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return {
        accuracy: 0.3, // 30% точность
        delay: 2000, // 2 секунды задержки
        patternRecognition: false,
        adaptiveBehavior: false,
        smartHunting: false,
      };
    case 'medium':
      return {
        accuracy: 0.6, // 60% точность
        delay: 1500, // 1.5 секунды задержки
        patternRecognition: true,
        adaptiveBehavior: false,
        smartHunting: true,
      };
    case 'hard':
      return {
        accuracy: 0.85, // 85% точность
        delay: 800, // 0.8 секунды задержки
        patternRecognition: true,
        adaptiveBehavior: true,
        smartHunting: true,
      };
    default:
      return {
        accuracy: 0.6,
        delay: 1500,
        patternRecognition: true,
        adaptiveBehavior: false,
        smartHunting: true,
      };
  }
};

/**
 * Генерирует выстрел с учетом сложности
 */
const generateHuntingShot = (aiState: AIState): { row: number; col: number } => {
  const config = getDifficultyConfig(aiState.difficulty);
  
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
    return { row: 0, col: 0 };
  }
  
  // Для легкого уровня - полностью случайные выстрелы
  if (aiState.difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }
  
  // Для среднего и сложного уровней - умная стратегия
  if (config.smartHunting) {
    return generateSmartHuntingShot(aiState, availableCells);
  }
  
  // Fallback к случайному выстрелу
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
};

/**
 * Генерирует умный выстрел в режиме охоты
 */
const generateSmartHuntingShot = (
  aiState: AIState, 
  availableCells: { row: number; col: number }[]
): { row: number; col: number } => {
  const config = getDifficultyConfig(aiState.difficulty);
  
  // Приоритетные клетки для выстрела (шахматный паттерн)
  const priorityCells: { row: number; col: number }[] = [];
  const regularCells: { row: number; col: number }[] = [];
  
  availableCells.forEach(cell => {
    const isPriority = (cell.row + cell.col) % 2 === 0;
    if (isPriority) {
      priorityCells.push(cell);
    } else {
      regularCells.push(cell);
    }
  });
  
  // Для сложного уровня - используем паттерн-анализ
  if (aiState.difficulty === 'hard' && config.patternRecognition) {
    const patternShot = analyzePatterns(aiState, availableCells);
    if (patternShot) {
      return patternShot;
    }
  }
  
  // Выбираем из приоритетных клеток с вероятностью
  const usePriority = Math.random() < (aiState.difficulty === 'hard' ? 0.8 : 0.6);
  
  if (usePriority && priorityCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * priorityCells.length);
    return priorityCells[randomIndex];
  } else if (regularCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * regularCells.length);
    return regularCells[randomIndex];
  } else {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }
};

/**
 * Анализирует паттерны для сложного уровня
 */
const analyzePatterns = (
  aiState: AIState, 
  availableCells: { row: number; col: number }[]
): { row: number; col: number } | null => {
  // Ищем области с высокой плотностью промахов
  const missDensity = calculateMissDensity(aiState);
  
  // Находим клетки с наименьшей плотностью промахов
  const lowDensityCells = availableCells.filter(cell => {
    const density = missDensity[cell.row]?.[cell.col] || 0;
    return density < 0.3; // Менее 30% промахов в области
  });
  
  if (lowDensityCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * lowDensityCells.length);
    return lowDensityCells[randomIndex];
  }
  
  return null;
};

/**
 * Вычисляет плотность промахов в каждой области
 */
const calculateMissDensity = (aiState: AIState): number[][] => {
  const density: number[][] = Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(0)
  );
  
  // Анализируем последние выстрелы
  const recentShots = aiState.patternMemory.slice(-20); // Последние 20 выстрелов
  
  recentShots.forEach(shot => {
    if (shot.result === 'miss') {
      // Увеличиваем плотность промахов в области 3x3 вокруг промаха
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const row = shot.row + dr;
          const col = shot.col + dc;
          if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            density[row][col] += 0.1;
          }
        }
      }
    }
  });
  
  return density;
};

/**
 * Генерирует выстрел в режиме преследования
 */
const generateTargetingShot = (aiState: AIState): { row: number; col: number } => {
  if (!aiState.lastHit) {
    return generateHuntingShot(aiState);
  }

  const { row: hitRow, col: hitCol } = aiState.lastHit;
  const config = getDifficultyConfig(aiState.difficulty);
  
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
    // Для сложного уровня - умный выбор направления
    if (aiState.difficulty === 'hard' && config.adaptiveBehavior) {
      return selectBestTargetingDirection(aiState, availableDirections);
    }
    
    // Для среднего и легкого уровней - случайный выбор
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
 * Выбирает лучшее направление для преследования (для сложного уровня)
 */
const selectBestTargetingDirection = (
  aiState: AIState, 
  availableDirections: { row: number; col: number }[]
): { row: number; col: number } => {
  // Анализируем историю выстрелов для выбора оптимального направления
  const directionScores = availableDirections.map(direction => {
    let score = 0;
    
    // Проверяем, есть ли в этом направлении другие попадания
    const hitsInDirection = aiState.patternMemory.filter(shot => 
      shot.result === 'hit' && 
      (shot.row === direction.row || shot.col === direction.col)
    );
    
    score += hitsInDirection.length * 2;
    
    // Проверяем, не было ли в этом направлении промахов
    const missesInDirection = aiState.patternMemory.filter(shot => 
      shot.result === 'miss' && 
      (shot.row === direction.row || shot.col === direction.col)
    );
    
    score -= missesInDirection.length;
    
    // Предпочитаем направления, которые ведут к краю поля (где могут быть большие корабли)
    if (direction.row === 0 || direction.row === BOARD_SIZE - 1 || 
        direction.col === 0 || direction.col === BOARD_SIZE - 1) {
      score += 1;
    }
    
    return { direction, score };
  });
  
  // Сортируем по очкам и выбираем лучшее
  directionScores.sort((a, b) => b.score - a.score);
  
  // С вероятностью 80% выбираем лучшее направление, 20% - случайное
  if (Math.random() < 0.8 && directionScores[0].score > 0) {
    return directionScores[0].direction;
  } else {
    const randomIndex = Math.floor(Math.random() * availableDirections.length);
    return availableDirections[randomIndex];
  }
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
  
  // Обновляем память паттернов
  aiState.patternMemory.push({
    row: shot.row,
    col: shot.col,
    result: hit ? 'hit' : 'miss'
  });
  
  // Ограничиваем размер памяти
  if (aiState.patternMemory.length > 50) {
    aiState.patternMemory = aiState.patternMemory.slice(-30);
  }
  
  // Обновляем статистику попаданий/промахов
  if (hit) {
    aiState.hitStreak++;
    aiState.missStreak = 0;
  } else {
    aiState.missStreak++;
    aiState.hitStreak = 0;
  }
  
  // Адаптивное поведение для сложного уровня
  if (aiState.difficulty === 'hard') {
    updateAdaptiveStrategy(aiState);
  }
  
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
    
    // Для сложного уровня - анализируем потопленный корабль
    if (aiState.difficulty === 'hard') {
      analyzeSunkShip(aiState, shot);
    }
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
  
  // Обновляем время последнего выстрела
  aiState.lastShotTime = Date.now();
};

/**
 * Обновляет адаптивную стратегию ИИ
 */
const updateAdaptiveStrategy = (aiState: AIState): void => {
  const recentShots = aiState.patternMemory.slice(-10);
  const hitRate = recentShots.filter(shot => shot.result === 'hit').length / recentShots.length;
  
  if (hitRate > 0.7) {
    // Высокая точность - агрессивная стратегия
    aiState.adaptiveStrategy = 'aggressive';
  } else if (hitRate < 0.3) {
    // Низкая точность - оборонительная стратегия
    aiState.adaptiveStrategy = 'defensive';
  } else {
    // Средняя точность - сбалансированная стратегия
    aiState.adaptiveStrategy = 'balanced';
  }
};

/**
 * Анализирует потопленный корабль для улучшения стратегии
 */
const analyzeSunkShip = (aiState: AIState, lastShot: { row: number; col: number }): void => {
  // Находим все попадания в последнем корабле
  const shipHits = aiState.patternMemory.filter(shot => 
    shot.result === 'hit' && 
    Math.abs(shot.row - lastShot.row) <= 1 && 
    Math.abs(shot.col - lastShot.col) <= 1
  );
  
  if (shipHits.length > 1) {
    // Анализируем размер и расположение корабля
    const minRow = Math.min(...shipHits.map(hit => hit.row));
    const maxRow = Math.max(...shipHits.map(hit => hit.row));
    const minCol = Math.min(...shipHits.map(hit => hit.col));
    const maxCol = Math.max(...shipHits.map(hit => hit.col));
    
    const shipSize = Math.max(maxRow - minRow, maxCol - minCol) + 1;
    
    // Запоминаем информацию о корабле для будущих игр
    console.log(`Потоплен корабль размером ${shipSize} в позиции (${minRow},${minCol}) - (${maxRow},${maxCol})`);
  }
};

/**
 * Генерирует следующий выстрел ИИ
 */
export const generateAIShot = (aiState: AIState): { row: number; col: number } => {
  try {
    // Добавляем задержку в зависимости от сложности
    const config = getDifficultyConfig(aiState.difficulty);
    const timeSinceLastShot = Date.now() - aiState.lastShotTime;
    
    // Если прошло недостаточно времени, ждем
    if (timeSinceLastShot < config.delay) {
      // Возвращаем последний выстрел (не должно происходить в нормальной игре)
      return aiState.lastHit || { row: 0, col: 0 };
    }
    
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

/**
 * Создает ИИ с заданной сложностью
 */
export const createAIWithDifficulty = (difficulty: DifficultyLevel): AIState => {
  return createAIState(difficulty);
};

/**
 * Получает информацию о текущей стратегии ИИ
 */
export const getAIStrategyInfo = (aiState: AIState): string => {
  const config = getDifficultyConfig(aiState.difficulty);
  const hitRate = aiState.patternMemory.length > 0 
    ? aiState.patternMemory.filter(shot => shot.result === 'hit').length / aiState.patternMemory.length 
    : 0;
  
  return `Сложность: ${aiState.difficulty}, Режим: ${aiState.mode}, Стратегия: ${aiState.adaptiveStrategy}, Точность: ${(hitRate * 100).toFixed(1)}%`;
};