import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface AnimatedButtonProps {
  onPress: () => void;
  icon: string;
  title: string;
  color?: string;
  isPremium?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const boatFloatAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuth();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Основные анимации появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Плавающая анимация лодки
    Animated.loop(
      Animated.sequence([
        Animated.timing(boatFloatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(boatFloatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Анимация волн
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  };

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Анимированная кнопка с эффектом нажатия
  const AnimatedButton = ({ onPress, icon, title, color = '#2563EB', isPremium = false }: AnimatedButtonProps) => {
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
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: buttonScale }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.button,
            { backgroundColor: color },
            isPremium && styles.premiumButton
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={isPremium ? ['#F59E0B', '#D97706', '#B45309'] : [`${color}DD`, color, `${color}CC`]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buttonContent}>
              <Ionicons name={icon as any} size={24} color="#fff" />
              <Text style={[
                styles.buttonText,
                isPremium && styles.premiumButtonText
              ]}>
                {title}
              </Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⚡</Text>
              </View>
            )}
            
            {/* Блестящий эффект */}
            <Animated.View 
              style={[
                styles.buttonShine,
                {
                  transform: [{
                    translateX: buttonScale.interpolate({
                      inputRange: [0.95, 1],
                      outputRange: [100, -100]
                    })
                  }]
                }
              ]} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0A1D3F', '#1E3A8A']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <Ionicons name="boat" size={64} color="#60A5FA" />
          <Text style={styles.loadingText}>Поднимаем якоря...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Анимированный фон с волнами */}
      <View style={styles.background}>
        <Animated.View 
          style={[
            styles.wave,
            {
              transform: [{
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -width]
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.wave, 
            styles.wave2,
            {
              transform: [{
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width, 0]
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.wave, 
            styles.wave3,
            {
              transform: [{
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -width]
                })
              }]
            }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* Главный заголовок с плавающей лодкой */}
        <View style={styles.header}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [
                  { 
                    translateY: boatFloatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10]
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#60A5FA', '#3B82F6', '#2563EB']}
              style={styles.logo}
            >
              <Ionicons name="boat" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>
          
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text style={styles.title}>МОРСКОЙ БОЙ</Text>
            <Text style={styles.subtitle}>ЭПИЧЕСКИЕ СРАЖЕНИЯ</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.stats,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.stat}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>МОРЯКОВ</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>В ОКЕАНЕ</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>⚡</Text>
              <Text style={styles.statLabel}>РЕЙТИНГ</Text>
            </View>
          </Animated.View>
        </View>

        {/* Кнопки действий */}
        <BlurView intensity={25} tint="dark" style={styles.buttonsContainer}>
          {isAuthenticated ? (
            <>
              <AnimatedButton 
                onPress={() => router.push('/(tabs)/lobby')}
                icon="play"
                title="НОВАЯ БИТВА"
                color="#10B981"
                isPremium={true}
              />
              <AnimatedButton 
                onPress={() => router.push('/(tabs)/lobby')}
                icon="people"
                title="ПРИСОЕДИНИТЬСЯ"
                color="#3B82F6"
              />
              <AnimatedButton 
                onPress={() => router.push('/(tabs)/settings')}
                icon="settings"
                title="КАЮТА АДМИРАЛА"
                color="#6B7280"
              />
            </>
          ) : (
            <>
              <AnimatedButton 
                onPress={() => router.push('/(auth)/login')}
                icon="log-in"
                title="ВОЙТИ НА БОРТ"
                color="#10B981"
                isPremium={true}
              />
              <AnimatedButton 
                onPress={() => router.push('/(auth)/register')}
                icon="person-add"
                title="СТАТЬ АДМИРАЛОМ"
                color="#3B82F6"
              />
            </>
          )}
          
          <AnimatedButton 
            onPress={() => router.push('/(tabs)/rules')}
            icon="book"
            title="КОРАБЕЛЬНЫЙ УСТАВ"
            color="#8B5CF6"
          />
          
          {/* Дополнительные фичи */}
          <Animated.View 
            style={[
              styles.features,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.featureText}>Безопасно</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
              <Text style={styles.featureText}>Быстро</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={20} color="#EF4444" />
              <Text style={styles.featureText}>Рейтинги</Text>
            </View>
          </Animated.View>
        </BlurView>

        {/* Футер с анимацией */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.version}>⚓ АДМИРАЛТЕЙСТВО v1.0.0 ⚓</Text>
          <Text style={styles.copyright}>© 2024 Морской Штаб</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1D3F',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  wave2: {
    bottom: -20,
    height: 120,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    transform: [{ scaleX: 1.2 }],
  },
  wave3: {
    bottom: -40,
    height: 140,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    transform: [{ scaleX: 1.4 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 25,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(59, 130, 246, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#93C5FD',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 30,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 6,
    textShadowColor: 'rgba(245, 158, 11, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonsContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 28,
    padding: 26,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonContainer: {
    marginBottom: 18,
  },
  button: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 26,
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 14,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumButton: {
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  premiumButtonText: {
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 3,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 1,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(96, 165, 250, 0.25)',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  version: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  copyright: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#93C5FD',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 1,
  },
});