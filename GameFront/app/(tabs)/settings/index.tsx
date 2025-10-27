import { useState } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Экран настроек приложения
 * Позволяет настраивать параметры игры и приложения
 */
export default function SettingsScreen() {
  // Состояния настроек
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  /**
   * Сохранение настроек
   */
  const saveSettings = () => {
    // Здесь будет логика сохранения настроек
    Alert.alert('Настройки сохранены', 'Ваши настройки успешно применены.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Настройки</Text>

      {/* Настройки звука */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Звук и вибрация</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.settingText}>Звуковые эффекты</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.settingText}>Вибрация</Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={vibrationEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Настройки игры */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки игры</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color="#007AFF" />
            <Text style={styles.settingText}>Уведомления</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="trophy" size={20} color="#007AFF" />
            <Text style={styles.settingText}>Сложность</Text>
          </View>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  difficulty === level && styles.difficultyButtonActive
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[
                  styles.difficultyButtonText,
                  difficulty === level && styles.difficultyButtonTextActive
                ]}>
                  {level === 'easy' ? 'Легко' : level === 'medium' ? 'Средне' : 'Сложно'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Кнопка сохранения */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Сохранить настройки</Text>
      </TouchableOpacity>

      {/* Информация о приложении */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Версия</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Разработчик</Text>
          <Text style={styles.infoValue}>Ваше имя</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Сборка</Text>
          <Text style={styles.infoValue}>2024.01</Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  difficultyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#000',
  },
  difficultyButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
});