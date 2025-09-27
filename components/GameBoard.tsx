import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Интерфейс пропсов для компонента игрового поля
 */
interface GameBoardProps {
  board: number[][];
  onCellPress: (row: number, col: number) => void;
  editable: boolean;
}

/**
 * Компонент игрового поля 10x10
 * Отображает поле для расстановки кораблей и стрельбы
 */
export default function GameBoard({ board, onCellPress, editable }: GameBoardProps) {
  // Буквенные обозначения столбцов
  const columnLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  /**
   * Получение стиля для клетки в зависимости от её состояния
   */
  const getCellStyle = (cellValue: number) => {
    switch (cellValue) {
      case 1: return styles.shipCell;      // Корабль
      case 2: return styles.hitCell;       // Попадание
      case 3: return styles.missCell;      // Промах
      default: return styles.emptyCell;    // Пустая клетка
    }
  };

  /**
   * Получение символа для отображения в клетке
   */
  const getCellSymbol = (cellValue: number) => {
    switch (cellValue) {
      case 2: return '💥'; // Попадание
      case 3: return '⚬';  // Промах
      default: return '';
    }
  };

  return (
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
      {board.map((row, rowIndex) => (
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
              disabled={!editable && cell !== 0}
            >
              <Text style={styles.cellText}>{getCellSymbol(cell)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#C7C7CC',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cornerCell: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: '#E3F2FD',
  },
  shipCell: {
    backgroundColor: '#78909C',
  },
  hitCell: {
    backgroundColor: '#FFCDD2',
  },
  missCell: {
    backgroundColor: '#E3F2FD',
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});