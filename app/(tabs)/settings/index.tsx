import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal
} from 'react-native';
import { useSoundManager } from '../../hooks/useSoundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const soundManager = useSoundManager();
  
  // Локальное состояние для настроек
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'sound' | 'difficulty' | null>(null);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings();
    
    // Запускаем анимации
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

  // Загрузка настроек из AsyncStorage
  const loadSettings = async () => {
    try {
      const [
        soundSetting,
        vibrationSetting,
        difficultySetting,
        notificationsSetting
      ] = await Promise.all([
        AsyncStorage.getItem('soundEnabled'),
        AsyncStorage.getItem('vibrationEnabled'),
        AsyncStorage.getItem('difficulty'),
        AsyncStorage.getItem('notificationsEnabled')
      ]);

      if (soundSetting !== null) setSoundEnabled(JSON.parse(soundSetting));
      if (vibrationSetting !== null) setVibrationEnabled(JSON.parse(vibrationSetting));
      if (difficultySetting !== null) setDifficulty(difficultySetting as 'easy' | 'medium' | 'hard');
      if (notificationsSetting !== null) setNotificationsEnabled(JSON.parse(notificationsSetting));
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  // Сохранение настроек в AsyncStorage
  const saveSettingsToStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('soundEnabled', JSON.stringify(soundEnabled)),
        AsyncStorage.setItem('vibrationEnabled', JSON.stringify(vibrationEnabled)),
        AsyncStorage.setItem('difficulty', difficulty),
        AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled))
      ]);
      console.log('Настройки сохранены в хранилище');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  /**
   * Открытие мини-меню
   */
  const openMiniMenu = (tab: 'sound' | 'difficulty') => {
    setActiveTab(tab);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Закрытие мини-меню
   */
  const closeMiniMenu = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(null);
    });
  };

  /**
   * Переключение звука с немедленным применением
   */
  const toggleSoundImmediate = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    
    // Немедленно сохраняем настройку звука
    try {
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(newValue));
      console.log('Настройка звука немедленно сохранена:', newValue);
    } catch (error) {
      console.error('Ошибка сохранения настройки звука:', error);
    }
  };

  /**
   * Переключение вибрации с немедленным применением
   */
  const toggleVibrationImmediate = async () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabled(newValue);
    
    try {
      await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(newValue));
      console.log('Настройка вибрации немедленно сохранена:', newValue);
    } catch (error) {
      console.error('Ошибка сохранения настройки вибрации:', error);
    }
  };

  /**
   * Установка сложности с немедленным применением
   */
  const setDifficultyImmediate = async (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    
    try {
      await AsyncStorage.setItem('difficulty', level);
      console.log('Настройка сложности немедленно сохранена:', level);
    } catch (error) {
      console.error('Ошибка сохранения настройки сложности:', error);
    }
  };

  /**
   * Сохранение настроек с анимацией
   */
  const saveSettings = async () => {
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

    // Сохраняем все настройки (на всякий случай)
    await saveSettingsToStorage();
    
    // Воспроизводим звук только если звук включен
    // Используем прямое воспроизведение без хука
    await playButtonSoundSafe();
    
    Alert.alert('⚓ Настройки сохранены', 'Ваши настройки успешно применены для флота!');
  };

  /**
   * Безопасное воспроизведение звука кнопки
   */
  const playButtonSoundSafe = async () => {
    if (soundEnabled && soundManager.playButtonSound) {
      await soundManager.playButtonSound();
    }
  };

  // Компонент настройки с мини-меню
  const SettingWithMiniMenu = ({ 
    icon, 
    text, 
    value, 
    type,
  }: {
    icon: string;
    text: string;
    value: any;
    type: 'sound' | 'difficulty';
  }) => {
    const getDisplayValue = () => {
      if (type === 'sound') {
        return value ? 'ВКЛ' : 'ВЫКЛ';
      } else if (type === 'difficulty') {
        const difficultyLabels = {
          easy: 'ШТУРМАН',
          medium: 'КАПИТАН',
          hard: 'АДМИРАЛ'
        };
        return difficultyLabels[value as keyof typeof difficultyLabels];
      }
      return value;
    };

    const getStatusColor = () => {
      if (type === 'sound') {
        return value ? '#10B981' : '#EF4444';
      }
      return '#60A5FA';
    };

    return (
      <Animated.View style={[styles.settingItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.settingInfo}>
          <Ionicons name={icon} size={24} color="#60A5FA" />
          <Text style={styles.settingText}>{text}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.miniMenuTrigger, { backgroundColor: getStatusColor() + '20' }]}
          onPress={() => openMiniMenu(type)}
          activeOpacity={0.7}
        >
          <Text style={[styles.miniMenuTriggerText, { color: getStatusColor() }]}>
            {getDisplayValue()}
          </Text>
          <Ionicons name="chevron-down" size={16} color={getStatusColor()} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Мини-меню для настроек
  const MiniMenuModal = () => {
    if (!activeTab) return null;

    const modalTranslateY = modalAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0]
    });

    const modalOpacity = modalAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <Modal
        visible={!!activeTab}
        transparent
        animationType="none"
        onRequestClose={closeMiniMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMiniMenu}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ translateY: modalTranslateY }]
              }
            ]}
          >
            <BlurView intensity={30} tint="dark" style={styles.modalBlurContainer}>
              {/* Заголовок мини-меню */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeTab === 'sound' ? '⚓ НАСТРОЙКИ ЗВУКА' : '🎯 УРОВЕНЬ СЛОЖНОСТИ'}
                </Text>
                <TouchableOpacity onPress={closeMiniMenu} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Контент мини-меню */}
              <View style={styles.modalBody}>
                {activeTab === 'sound' && (
                  <View style={styles.soundOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        soundEnabled && styles.optionButtonActive
                      ]}
                      onPress={() => {
                        toggleSoundImmediate();
                        closeMiniMenu();
                      }}
                    >
                      <LinearGradient
                        colors={soundEnabled ? ['#10B981', '#059669'] : ['rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.4)']}
                        style={styles.optionButtonGradient}
                      >
                        <Ionicons 
                          name="volume-high" 
                          size={24} 
                          color={soundEnabled ? '#fff' : '#9CA3AF'} 
                        />
                        <Text style={[
                          styles.optionButtonText,
                          soundEnabled && styles.optionButtonTextActive
                        ]}>
                          ЗВУК ВКЛЮЧЕН
                        </Text>
                        {soundEnabled && (
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        !soundEnabled && styles.optionButtonActive
                      ]}
                      onPress={() => {
                        toggleSoundImmediate();
                        closeMiniMenu();
                      }}
                    >
                      <LinearGradient
                        colors={!soundEnabled ? ['#EF4444', '#DC2626'] : ['rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.4)']}
                        style={styles.optionButtonGradient}
                      >
                        <Ionicons 
                          name="volume-mute" 
                          size={24} 
                          color={!soundEnabled ? '#fff' : '#9CA3AF'} 
                        />
                        <Text style={[
                          styles.optionButtonText,
                          !soundEnabled && styles.optionButtonTextActive
                        ]}>
                          ЗВУК ВЫКЛЮЧЕН
                        </Text>
                        {!soundEnabled && (
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        styles.vibrationOption,
                        vibrationEnabled && styles.optionButtonActive
                      ]}
                      onPress={() => {
                        toggleVibrationImmediate();
                      }}
                    >
                      <View style={styles.vibrationOptionContent}>
                        <Ionicons 
                          name="vibrate" 
                          size={24} 
                          color={vibrationEnabled ? '#F59E0B' : '#9CA3AF'} 
                        />
                        <View style={styles.vibrationTextContainer}>
                          <Text style={[
                            styles.optionButtonText,
                            vibrationEnabled && styles.optionButtonTextActive
                          ]}>
                            ВИБРАЦИЯ
                          </Text>
                          <Text style={styles.optionSubtext}>
                            {vibrationEnabled ? 'Активна' : 'Неактивна'}
                          </Text>
                        </View>
                        <View style={[
                          styles.vibrationIndicator,
                          vibrationEnabled && styles.vibrationIndicatorActive
                        ]}>
                          <Ionicons 
                            name="checkmark" 
                            size={16} 
                            color={vibrationEnabled ? '#fff' : 'transparent'} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === 'difficulty' && (
                  <View style={styles.difficultyOptions}>
                    {[
                      { level: 'easy', label: 'ШТУРМАН', icon: 'compass', description: 'Для новичков' },
                      { level: 'medium', label: 'КАПИТАН', icon: 'boat', description: 'Стандартный бой' },
                      { level: 'hard', label: 'АДМИРАЛ', icon: 'trophy', description: 'Экспертный уровень' }
                    ].map((item) => (
                      <TouchableOpacity 
                        key={item.level}
                        style={[
                          styles.difficultyOption,
                          difficulty === item.level && styles.difficultyOptionActive
                        ]}
                        onPress={() => {
                          setDifficultyImmediate(item.level as any);
                          closeMiniMenu();
                        }}
                      >
                        <LinearGradient
                          colors={difficulty === item.level ? 
                            ['#8B5CF6', '#7C3AED'] : 
                            ['rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.4)']
                          }
                          style={styles.difficultyOptionGradient}
                        >
                          <View style={styles.difficultyOptionHeader}>
                            <Ionicons 
                              name={item.icon as any} 
                              size={28} 
                              color={difficulty === item.level ? '#fff' : '#8B5CF6'} 
                            />
                            <View style={styles.difficultyTextContainer}>
                              <Text style={[
                                styles.difficultyOptionLabel,
                                difficulty === item.level && styles.difficultyOptionLabelActive
                              ]}>
                                {item.label}
                              </Text>
                              <Text style={styles.difficultyOptionDescription}>
                                {item.description}
                              </Text>
                            </View>
                          </View>
                          
                          {difficulty === item.level && (
                            <View style={styles.selectedBadge}>
                              <Ionicons name="checkmark-circle" size={20} color="#fff" />
                              <Text style={styles.selectedBadgeText}>ВЫБРАНО</Text>
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
            
            <SettingWithMiniMenu
              icon="volume-high"
              text="Звуковые сигналы"
              value={soundEnabled}
              type="sound"
            />

            <SettingWithMiniMenu
              icon="trophy"
              text="Уровень сложности"
              value={difficulty}
              type="difficulty"
            />
          </BlurView>
        </Animated.View>

        {/* Другие настройки */}
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
            <Text style={styles.sectionTitle}>🔔 УВЕДОМЛЕНИЯ</Text>
            
            <Animated.View style={[styles.settingItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={24} color="#60A5FA" />
                <Text style={styles.settingText}>Боевые уведомления</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.simpleSwitch,
                  notificationsEnabled && styles.simpleSwitchActive
                ]}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <View style={[
                  styles.simpleSwitchThumb,
                  notificationsEnabled && styles.simpleSwitchThumbActive
                ]} />
              </TouchableOpacity>
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
      </ScrollView>

      {/* Мини-меню */}
      <MiniMenuModal />
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
    paddingBottom: 110,
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
  miniMenuTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  miniMenuTriggerText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Стили для мини-меню
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalBlurContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
  },
  // Стили для опций звука
  soundOptions: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  optionButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  vibrationOption: {
    marginTop: 8,
  },
  vibrationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  vibrationTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  vibrationIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibrationIndicatorActive: {
    backgroundColor: '#F59E0B',
  },
  // Стили для опций сложности
  difficultyOptions: {
    gap: 12,
  },
  difficultyOption: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  difficultyOptionActive: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyOptionGradient: {
    padding: 20,
  },
  difficultyOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  difficultyOptionLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 0.8,
  },
  difficultyOptionLabelActive: {
    color: '#fff',
  },
  difficultyOptionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Простой переключатель для уведомлений
  simpleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B7280',
    padding: 2,
    justifyContent: 'center',
  },
  simpleSwitchActive: {
    backgroundColor: '#10B981',
  },
  simpleSwitchThumb: {
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
  simpleSwitchThumbActive: {
    alignSelf: 'flex-end',
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
});