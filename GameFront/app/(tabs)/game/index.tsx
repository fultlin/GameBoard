import { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameBoard from '../../../components/GameBoard';

/**
 * Экран игры "Морской бой"
 * Содержит игровое поле, управление игрой и статус игры
 */
export default function GameScreen() {
  // Состояния игры
  const [gameStarted, setGameStarted] = useState(false);
  const [playerBoard, setPlayerBoard] = useState(initializeBoard());
  const [computerBoard, setComputerBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'computer'>('player');

  /**
   * Инициализация пустого игрового поля 10x10
   */
  function initializeBoard(): number[][] {
    return Array(10).fill(null).map(() => Array(10).fill(0));
  }

  /**
   * Начало новой игры
   */
  const startNewGame = () => {
    setPlayerBoard(initializeBoard());
    setComputerBoard(initializeBoard());
    setGameStarted(true);
    setCurrentPlayer('player');
    Alert.alert('Игра началась!', 'Расставьте корабли или используйте автоматическую расстановку.');
  };

  /**
   * Обработка выстрела по клетке
   */
  const handleCellPress = (row: number, col: number, boardType: 'player' | 'computer') => {
    if (!gameStarted) {
      Alert.alert('Внимание', 'Сначала начните новую игру!');
      return;
    }

    if (boardType === 'computer' && currentPlayer === 'player') {
      // Логика выстрела игрока по полю компьютера
      Alert.alert('Выстрел', `Выстрел по клетке: ${row + 1}, ${String.fromCharCode(65 + col)}`);
      // Здесь будет логика обработки выстрела
      setCurrentPlayer('computer');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Морской бой</Text>

      {/* Управление игрой */}
      <View style={styles.controlPanel}>
        <TouchableOpacity style={styles.controlButton} onPress={startNewGame}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.controlButtonText}>
            {gameStarted ? 'Перезапуск' : 'Начать игру'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="shuffle" size={20} color="#fff" />
          <Text style={styles.controlButtonText}>Авторасстановка</Text>
        </TouchableOpacity>
      </View>

      {/* Игровые поля */}
      <View style={styles.boardsContainer}>
        <View style={styles.boardSection}>
          <Text style={styles.boardTitle}>Ваше поле</Text>
          <GameBoard 
            board={playerBoard} 
            onCellPress={(row, col) => handleCellPress(row, col, 'player')}
            editable={true}
          />
        </View>

        <View style={styles.boardSection}>
          <Text style={styles.boardTitle}>Поле противника</Text>
          <GameBoard 
            board={computerBoard} 
            onCellPress={(row, col) => handleCellPress(row, col, 'computer')}
            editable={false}
          />
        </View>
      </View>

      {/* Статус игры */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Статус: {gameStarted ? 'Игра в процессе' : 'Игра не начата'}
        </Text>
        <Text style={styles.statusText}>
          Ход: {currentPlayer === 'player' ? 'Ваш ход' : 'Ход противника'}
        </Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Ваши попадания</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Попадания противника</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#000',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 10,
  },
  controlButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
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
  },
  boardsContainer: {
    gap: 20,
  },
  boardSection: {
    alignItems: 'center',
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  statusText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});