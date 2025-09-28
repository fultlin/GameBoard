import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  
  // Состояния настроек
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Запускаем анимации при монтировании
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  /**
   * Сохранение настроек с анимацией
   */
  const saveSettings = () => {
    // Анимация успешного сохранения
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert('⚓ Настройки сохранены', 'Ваши настройки успешно применены для флота!');
  };

  // Анимированный переключатель
  const AnimatedSwitch = ({ value, onValueChange, icon, text }: any) => {
    const switchAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

    const handleToggle = (newValue: boolean) => {
      Animated.spring(switchAnim, {
        toValue: newValue ? 1 : 0,
        useNativeDriver: false,
      }).start();
      onValueChange(newValue);
    };

    const backgroundColor = switchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#6B7280', '#10B981']
    });

    return (
      <Animated.View style={[styles.settingItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.settingInfo}>
          <Ionicons name={icon} size={24} color="#60A5FA" />
          <Text style={styles.settingText}>{text}</Text>
        </View>
        <TouchableOpacity 
          style={styles.switchContainer}
          onPress={() => handleToggle(!value)}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
            <Animated.View 
              style={[
                styles.switchThumb,
                {
                  transform: [{
                    translateX: switchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 22]
                    })
                  }]
                }
              ]} 
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Анимированная кнопка сложности
  const DifficultyButton = ({ level, label, isActive, onPress }: any) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.difficultyButton,
            isActive && styles.difficultyButtonActive,
            { transform: [{ scale: buttonScale }] }
          ]}
        >
          <LinearGradient
            colors={isActive ? ['#10B981', '#059669'] : ['rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.4)']}
            style={styles.difficultyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.difficultyButtonText,
              isActive && styles.difficultyButtonTextActive
            ]}>
              {label}
            </Text>
            {isActive && (
              <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#0A1D3F', '#1E3A8A', '#0F4C75']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Заголовок */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Ionicons name="settings" size={48} color="#60A5FA" />
          <Text style={styles.title}>КАЮТА АДМИРАЛА</Text>
          <Text style={styles.subtitle}>Управление флотом и настройками</Text>
        </Animated.View>

        {/* Настройки звука */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
            <Text style={styles.sectionTitle}>⚓ ЗВУК И СИГНАЛЫ</Text>
            
            <AnimatedSwitch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              icon="volume-high"
              text="Звуковые сигналы"
            />

            <AnimatedSwitch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              icon="vibrate"
              text="Вибрация корабля"
            />
          </BlurView>
        </Animated.View>

        {/* Настройки игры */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
            <Text style={styles.sectionTitle}>🎯 СЛОЖНОСТЬ БОЯ</Text>
            
            <AnimatedSwitch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              icon="notifications"
              text="Боевые уведомления"
            />

            <Animated.View 
              style={[styles.settingItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text style={styles.settingText}>Уровень сложности</Text>
              </View>
              <View style={styles.difficultyButtons}>
                <DifficultyButton
                  level="easy"
                  label="ШТУРМАН"
                  isActive={difficulty === 'easy'}
                  onPress={() => setDifficulty('easy')}
                />
                <DifficultyButton
                  level="medium"
                  label="КАПИТАН"
                  isActive={difficulty === 'medium'}
                  onPress={() => setDifficulty('medium')}
                />
                <DifficultyButton
                  level="hard"
                  label="АДМИРАЛ"
                  isActive={difficulty === 'hard'}
                  onPress={() => setDifficulty('hard')}
                />
              </View>
            </Animated.View>
          </BlurView>
        </Animated.View>

        {/* Кнопка сохранения */}
        <Animated.View 
          style={[
            styles.saveButtonContainer,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveSettings}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="save" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>СОХРАНИТЬ ПРИКАЗЫ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Информация о приложении */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
            <Text style={styles.sectionTitle}>📜 СВЕДЕНИЯ О ФЛОТЕ</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Ionicons name="boat" size={20} color="#60A5FA" />
                <Text style={styles.infoLabel}>Версия флота</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="construct" size={20} color="#F59E0B" />
                <Text style={styles.infoLabel}>Сборка</Text>
                <Text style={styles.infoValue}>2024.01</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="person" size={20} color="#10B981" />
                <Text style={styles.infoLabel}>Адмирал</Text>
                <Text style={styles.infoValue}>Капитан</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="time" size={20} color="#EF4444" />
                <Text style={styles.infoLabel}>В строю</Text>
                <Text style={styles.infoValue}>24/7</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Дополнительные действия */}
        <Animated.View 
          style={[
            styles.actionsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={20} color="#60A5FA" />
            <Text style={styles.actionButtonText}>Помощь</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.actionButtonText}>Безопасность</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Оценить</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#93C5FD',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  switchContainer: {
    padding: 4,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  difficultyButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyButtonActive: {
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  difficultyButtonTextActive: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 4,
  },
  saveButtonContainer: {
    marginVertical: 24,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: (width - 80) / 2,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  actionButtonText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
});