import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GameBoard from '../../../components/GameBoard';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useSoundManager } from '../../hooks/useSoundManager';
import {
    GameState,
    SHIP_CONFIGS,
    ShipOrientation,
    ShipType
} from '../../types/game';
import { createAIWithDifficulty, DifficultyLevel, executeAIShot } from '../../utils/ai';
import {
    areAllCellsShot,
    areAllShipsSunk,
    autoPlaceShips,
    canPlaceShip,
    createEmptyGameBoard,
    createShip,
    isPlacementComplete,
    makeShot,
    placeShip
} from '../../utils/gameLogic';

/**
 * Экран игры "Морской бой"
 * Содержит игровое поле, управление игрой и статус игры
 */
export default function GameScreen() {
  // Состояние игры
  const [gameState, setGameState] = useState<GameState>({
    playerBoard: createEmptyGameBoard(),
    computerBoard: createEmptyGameBoard(),
    currentPlayer: 'player',
    gamePhase: 'placement',
    winner: null,
    playerHits: 0,
    computerHits: 0,
    totalHits: 0,
  });

  // Состояние расстановки кораблей
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
  const [shipOrientation, setShipOrientation] = useState<ShipOrientation>('horizontal');
  
  // Настройка сложности
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  
  // Используем useRef для aiState чтобы избежать проблем с замыканиями
  const aiStateRef = useRef(createAIWithDifficulty('medium'));
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [victoryType, setVictoryType] = useState<'victory' | 'defeat'>('victory');

  // Звуковой менеджер
  const soundManager = useSoundManager();

  // Загрузка настройки сложности при монтировании
  useEffect(() => {
    loadDifficultySetting();
  }, []);

  /**
   * Загружает настройку сложности из AsyncStorage
   */
  const loadDifficultySetting = async () => {
    try {
      const difficultySetting = await AsyncStorage.getItem('difficulty');
      if (difficultySetting) {
        const loadedDifficulty = difficultySetting as DifficultyLevel;
        setDifficulty(loadedDifficulty);
        // Обновляем состояние ИИ с новой сложностью
        aiStateRef.current = createAIWithDifficulty(loadedDifficulty);
      }
    } catch (error) {
      console.error('Ошибка загрузки настройки сложности:', error);
    }
  };

  /**
   * Сброс состояния ИИ
   */
  const resetAIState = () => {
    aiStateRef.current = createAIWithDifficulty(difficulty);
  };

  /**
   * Обработка нажатия "Играть снова"
   */
  const handlePlayAgain = async () => {
    setShowVictoryScreen(false);
    await startNewGame();
  };

  /**
   * Обработка нажатия "Главное меню"
   */
  const handleMainMenu = () => {
    setShowVictoryScreen(false);
    // Здесь можно добавить навигацию к главному меню
    // router.push('/');
  };

  /**
   * Начало новой игры
   */
  const startNewGame = async () => {
    try {
      const newPlayerBoard = createEmptyGameBoard();
      const newComputerBoard = autoPlaceShips();
      
      // Сбрасываем состояние ИИ
      resetAIState();
      
      setGameState({
        playerBoard: newPlayerBoard,
        computerBoard: newComputerBoard,
        currentPlayer: 'player',
        gamePhase: 'placement',
        winner: null,
        playerHits: 0,
        computerHits: 0,
        totalHits: 0,
      });
      
      // Скрываем экран победы
      setShowVictoryScreen(false);
      
      await soundManager.playButtonSound();
      Alert.alert('Игра началась!', 'Расставьте свои корабли на поле.');
    } catch {
      await soundManager.playMissSound();
      Alert.alert('Ошибка', 'Не удалось создать новую игру');
    }
  };

  /**
   * Автоматическая расстановка кораблей игрока
   */
  const autoPlacePlayerShips = async () => {
    try {
      const newPlayerBoard = autoPlaceShips();
      // Сбрасываем состояние ИИ
      resetAIState();
      startNewGame()
      
      setGameState(prev => ({
        ...prev,
        playerBoard: newPlayerBoard,
        gamePhase: 'battle',
      }));
      
      await soundManager.playButtonSound();
      Alert.alert('Авторасстановка', 'Корабли расставлены автоматически! Игра начинается!');
    } catch {
      await soundManager.playMissSound();
      Alert.alert('Ошибка', 'Не удалось расставить корабли автоматически');
    }
  };

  /**
   * Обработка нажатия на клетку игрока (расстановка кораблей)
   */
  const handlePlayerCellPress = async (row: number, col: number) => {
    if (gameState.gamePhase !== 'placement') return;
    if (!selectedShip) {
      await soundManager.playMissSound();
      return;
    }

    try {
      const ship = createShip(selectedShip, `player_${Date.now()}`, row, col, shipOrientation);
      
      if (canPlaceShip(gameState.playerBoard.cells, ship, row, col, shipOrientation)) {
        const newBoard = { 
          ...gameState.playerBoard,
          cells: placeShip(gameState.playerBoard.cells, ship, row, col, shipOrientation),
          ships: [...gameState.playerBoard.ships, ship]
        };
        
        setGameState(prev => ({
          ...prev,
          playerBoard: newBoard,
        }));
        
        await soundManager.playButtonSound();
        
        // Проверяем, завершена ли расстановка
        if (isPlacementComplete(newBoard)) {
          setGameState(prev => ({
            ...prev,
            gamePhase: 'battle',
          }));
          Alert.alert('Расстановка завершена!', 'Игра начинается!');
        }
      } else {
        await soundManager.playMissSound();
        Alert.alert('Невозможно разместить', 'Корабль не может быть размещен в этой позиции');
      }
    } catch (error) {
      console.error('Ошибка при размещении корабля:', error);
      await soundManager.playMissSound();
      Alert.alert('Ошибка', 'Не удалось разместить корабль');
    }
  };

  /**
   * Обработка выстрела игрока по полю компьютера
   */
/**
 * Обработка выстрела игрока по полю компьютера
 */
const handlePlayerShot = async (row: number, col: number) => {
  if (gameState.gamePhase !== 'battle' || gameState.currentPlayer !== 'player') return;
  
  try {
    const result = makeShot(gameState.computerBoard, row, col);
    
    if (result.newBoard) {
      // Воспроизводим звук сразу
      if (result.hit) {
        await soundManager.playHitSound();
      } else {
        await soundManager.playMissSound();
      }

      // Создаем обновленное состояние
      const newGameState = {
        ...gameState,
        computerBoard: result.newBoard,
      };

      if (result.hit) {
        newGameState.playerHits = gameState.playerHits + 1;
        
        // Проверяем победу игрока
        const allShipsSunk = areAllShipsSunk(result.newBoard);
        const allCellsShot = areAllCellsShot(result.newBoard);
        
        if (allShipsSunk || allCellsShot) {
          console.log('Player won! Setting game state...');
          newGameState.gamePhase = 'finished';
          newGameState.winner = 'player';
          newGameState.currentPlayer = 'player';
          
          setGameState(newGameState);
          setVictoryType('victory');
          setShowVictoryScreen(true);
          await soundManager.playVictorySound();
          return;
        }

        setGameState(newGameState);
        
      } else {
        // Промах - передаем ход компьютеру
        newGameState.currentPlayer = 'computer';
        setGameState(newGameState);
        setTimeout(() => {
          executeComputerTurn();
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Ошибка при выстреле игрока:', error);
    await soundManager.playMissSound();
    Alert.alert('Ошибка', 'Не удалось выполнить выстрел');
  }
};
/**
 * Выполнение хода компьютера
 */
const executeComputerTurn = useCallback(async () => {
  // Получаем текущее состояние непосредственно перед выполнением хода
  setGameState(prevState => {
    // Проверяем условия еще раз на актуальном состоянии
    if (prevState.gamePhase !== 'battle' || prevState.currentPlayer !== 'computer') {
      return prevState;
    }

    // Выполняем ход ИИ
    const result = executeAIShot(prevState.playerBoard, aiStateRef.current);
    console.log('AI shot result:', result);
    
    if (!result.newBoard) {
      console.error('AI shot returned no newBoard, using current board');
      result.newBoard = prevState.playerBoard;
    }

    // Обрабатываем результат выстрела
    const processShotResult = async () => {
      try {
        // Воспроизводим звук
        if (result.hit) {
          await soundManager.playHitSound();
        } else {
          await soundManager.playMissSound();
        }

        if (result.hit) {
          // Проверяем победу компьютера
          const allShipsSunk = areAllShipsSunk(result.newBoard!);
          const allCellsShot = areAllCellsShot(result.newBoard!);
          
          if (allShipsSunk || allCellsShot) {
            console.log('Computer won!');
            setGameState(currentState => ({
              ...currentState,
              playerBoard: result.newBoard!,
              gamePhase: 'finished',
              winner: 'computer',
              computerHits: currentState.computerHits + 1,
            }));
            setVictoryType('defeat');
            setShowVictoryScreen(true);
            await soundManager.playVictorySound();
            return;
          }

          // Продолжаем ход компьютера после задержки
          setTimeout(() => {
            executeComputerTurn();
          }, 1500);
          
        } 
      } catch (error) {
        console.error('Ошибка при обработке выстрела компьютера:', error);
        // В случае ошибки передаем ход игроку
        setGameState(currentState => ({
          ...currentState,
          currentPlayer: 'player',
        }));
      }
    };

    // Запускаем обработку результата
    processShotResult();

    // Немедленно возвращаем обновленное состояние
    if (result.hit) {
      return {
        ...prevState,
        playerBoard: result.newBoard!,
        computerHits: prevState.computerHits + 1,
        // currentPlayer остается 'computer' для продолжения хода
      };
    } else {
      return {
        ...prevState,
        playerBoard: result.newBoard!,
        currentPlayer: 'player', // Передаем ход игроку
      };
    }
  });
}, [soundManager]); // Убрана зависимость от gameState

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>⚓ Морской бой</Text>
        <Text style={styles.difficultyText}>
          Сложность: {difficulty === 'easy' ? 'ШТУРМАН' : difficulty === 'medium' ? 'КАПИТАН' : 'АДМИРАЛ'}
        </Text>

        {/* Управление игрой */}
        <View style={styles.controlPanel}>
          <TouchableOpacity style={styles.controlButton} onPress={startNewGame}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.controlButtonText}>
              {gameState.gamePhase === 'placement' ? 'Новая игра' : 'Перезапуск'}
            </Text>
          </TouchableOpacity>

          {gameState.gamePhase === 'placement' && (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={autoPlacePlayerShips}
            >
              <Ionicons name="shuffle" size={20} color="#fff" />
              <Text style={styles.controlButtonText}>Авторасстановка</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Выбор корабля для расстановки */}
        {gameState.gamePhase === 'placement' && (
          <View style={styles.shipSelectionContainer}>
            <Text style={styles.sectionTitle}>Выберите корабль для размещения:</Text>
            <View style={styles.shipButtons}>
              {SHIP_CONFIGS.map((config) => (
                <TouchableOpacity
                  key={config.type}
                  style={[
                    styles.shipButton,
                    selectedShip === config.type && styles.shipButtonSelected
                  ]}
                  onPress={() => setSelectedShip(config.type)}
                >
                  <Text style={styles.shipButtonText}>
                    {config.type} ({config.size})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.orientationButtons}>
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  shipOrientation === 'horizontal' && styles.orientationButtonSelected
                ]}
                onPress={() => setShipOrientation('horizontal')}
              >
                <Ionicons name="arrow-forward" size={16} color="#fff" />
                <Text style={styles.orientationButtonText}>Горизонтально</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  shipOrientation === 'vertical' && styles.orientationButtonSelected
                ]}
                onPress={() => setShipOrientation('vertical')}
              >
                <Ionicons name="arrow-down" size={16} color="#fff" />
                <Text style={styles.orientationButtonText}>Вертикально</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Игровые поля */}
        <View style={styles.boardsContainer}>
          <GameBoard 
            gameBoard={gameState.playerBoard} 
            onCellPress={gameState.gamePhase === 'placement' ? handlePlayerCellPress : () => {}}
            editable={gameState.gamePhase === 'placement'}
            showShips={true}
            title="Ваше поле"
          />

          <GameBoard 
            gameBoard={gameState.computerBoard} 
            onCellPress={gameState.gamePhase === 'battle' && gameState.currentPlayer === 'player' ? handlePlayerShot : () => {}}
            editable={gameState.gamePhase === 'battle' && gameState.currentPlayer === 'player'}
            showShips={false}
            title="Поле противника"
          />
        </View>

        {/* Статус игры */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Фаза: {gameState.gamePhase === 'placement' ? 'Расстановка кораблей' : 
                  gameState.gamePhase === 'battle' ? 'Бой' : 'Игра завершена'}
          </Text>
          {gameState.gamePhase === 'battle' && (
            <Text style={styles.statusText}>
              Ход: {gameState.currentPlayer === 'player' ? 'Ваш ход' : 'Ход компьютера'}
            </Text>
          )}
          {gameState.winner && (
            <Text style={[styles.statusText, styles.winnerText]}>
              Победитель: {gameState.winner === 'player' ? 'Вы!' : 'Компьютер!'}
            </Text>
          )}
        </View>

        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameState.playerHits}</Text>
            <Text style={styles.statLabel}>Ваши попадания</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameState.computerHits}</Text>
            <Text style={styles.statLabel}>Попадания противника</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Экран победы/поражения */}
      {showVictoryScreen && (
        <VictoryScreen
          isVictory={victoryType === 'victory'}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 106,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1E3A8A',
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 10,
  },
  controlButton: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  shipSelectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  shipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  shipButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  shipButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  shipButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  orientationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  orientationButton: {
    flexDirection: 'row',
    backgroundColor: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
  },
  orientationButtonSelected: {
    backgroundColor: '#1E3A8A',
  },
  orientationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  boardsContainer: {
    gap: 20,
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  winnerText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});