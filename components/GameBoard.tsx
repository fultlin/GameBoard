import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cell, GameBoard as GameBoardType } from '../app/types/game';

/**
 * Интерфейс пропсов для компонента игрового поля
 */
interface GameBoardProps {
  gameBoard: GameBoardType;
  onCellPress: (row: number, col: number) => void;
  editable: boolean;
  showShips?: boolean;
  title?: string;
}

/**
 * Компонент игрового поля 10x10
 * Отображает поле для расстановки кораблей и стрельбы
 */
export default function GameBoard({ 
  gameBoard, 
  onCellPress, 
  editable, 
  showShips = false,
  title 
}: GameBoardProps) {
  // Буквенные обозначения столбцов
  const columnLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  /**
   * Получение стиля для клетки в зависимости от её состояния
   */
  const getCellStyle = (cell: Cell) => {
    // Сначала проверяем состояние клетки
    switch (cell.state) {
      case 'sunk':
        return styles.sunkCell;
      case 'hit':
        return styles.hitCell;
      case 'miss':
        return styles.missCell;
      case 'ship':
        if (showShips) {
          return styles.shipCell;
        }
        return styles.emptyCell;
      default:
        return styles.emptyCell;
    }
  };

  /**
   * Получение символа для отображения в клетке
   */
  const getCellSymbol = (cell: Cell) => {
    // Сначала проверяем состояние клетки
    switch (cell.state) {
      case 'sunk':
        return '💀'; // Потопленный корабль - череп
      case 'hit':
        return '💢'; // Раненый корабль - символ гнева/повреждения
      case 'miss':
        return '⚬'; // Промах
      case 'ship':
        if (showShips) {
          return '🚢'; // Корабль (только если показываем корабли)
        }
        return '';
      default:
        return '';
    }
  };

  /**
   * Проверка, можно ли нажать на клетку
   */
  const isCellPressable = (cell: Cell) => {
    if (!editable) return false;
    if (cell.isHit) return false;
    return true;
  };

  return (
    <View style={styles.boardContainer}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.container}>
        {/* Заголовки столбцов (буквы) */}
        <View style={styles.row}>
          <View style={styles.cornerCell} />
          {columnLabels.map((label) => (
            <View key={label} style={styles.headerCell}>
              <Text style={styles.headerText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Игровое поле с строками */}
        {gameBoard.cells.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {/* Заголовок строки (цифра) */}
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>{rowIndex + 1}</Text>
            </View>

            {/* Клетки игрового поля */}
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[styles.cell, getCellStyle(cell)]}
                onPress={() => onCellPress(rowIndex, colIndex)}
                disabled={!isCellPressable(cell)}
                activeOpacity={isCellPressable(cell) ? 0.7 : 1}
              >
                <Text style={styles.cellText}>{getCellSymbol(cell)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      
      {/* Статистика кораблей */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Кораблей: {gameBoard.ships.length} | 
          Потоплено: {gameBoard.ships.filter(ship => ship.isSunk).length} | 
          Попаданий: {gameBoard.ships.reduce((total, ship) => total + ship.hits, 0)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  container: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  cornerCell: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  cell: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: '#E3F2FD',
  },
  shipCell: {
    backgroundColor: '#78909C',
    borderColor: '#546E7A',
  },
  hitCell: {
    backgroundColor: '#FFCDD2',
    borderColor: '#EF5350',
  },
  sunkCell: {
    backgroundColor: '#424242',
    borderColor: '#212121',
  },
  missCell: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});