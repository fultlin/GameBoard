import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Экран с правилами игры "Морской бой"
 * Содержит подробное описание правил и советов по игре
 */
export default function RulesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Правила игры "Морской бой"</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Об игре</Text>
        </View>
        <Text style={styles.text}>
          "Морской бой" - это классическая игра для двух игроков, в которой каждый 
          размещает свои корабли на скрытом от противника поле и по очереди стреляет 
          по клеткам поля противника, пытаясь потопить все его корабли.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="boat" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Состав флота</Text>
        </View>
        <Text style={styles.text}>Каждый игрок имеет флот из 10 кораблей:</Text>
        <Text style={styles.listItem}>• 1 авианосец (4 клетки)</Text>
        <Text style={styles.listItem}>• 2 крейсера (3 клетки каждый)</Text>
        <Text style={styles.listItem}>• 3 эсминца (2 клетки каждый)</Text>
        <Text style={styles.listItem}>• 4 катера (1 клетка каждый)</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="grid" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Расстановка кораблей</Text>
        </View>
        <Text style={styles.text}>
          Корабли можно располагать только по горизонтали или вертикали. 
          Они не должны соприкасаться друг с другом, даже по диагонали.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="play" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Ход игры</Text>
        </View>
        <Text style={styles.text}>
          Игроки по очереди называют координаты клетки на поле противника. 
          Если в указанной клетке находится корабль, фиксируется попадание, 
          и игрок получает право на дополнительный выстрел.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Условия победы</Text>
        </View>
        <Text style={styles.text}>
          Побеждает игрок, который первым потопит все корабли противника.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Советы по игре</Text>
        </View>
        <Text style={styles.listItem}>• Начинайте стрелять по клеткам в шахматном порядке</Text>
        <Text style={styles.listItem}>• После попадания обстреливайте соседние клетки</Text>
        <Text style={styles.listItem}>• Запоминайте расположение своих выстрелов</Text>
        <Text style={styles.listItem}>• Старайтесь сначала найти крупные корабли</Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    marginLeft: 8,
    marginBottom: 4,
  },
});