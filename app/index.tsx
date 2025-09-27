import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="boat" size={64} color="#007AFF" />
        <Text style={styles.title}>Морской бой</Text>
        <Text style={styles.subtitle}>Классическая игра</Text>
      </View>

      <View style={styles.buttonContainer}>
        {isAuthenticated ? (
          <>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/lobby')}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Новая игра</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings" size={24} color="#fff" />
              <Text style={styles.buttonText}>Настройки</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(auth)/login')}
            >
              <Ionicons name="log-in" size={24} color="#fff" />
              <Text style={styles.buttonText}>Войти</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/(auth)/register')}
            >
              <Ionicons name="person-add" size={24} color="#fff" />
              <Text style={styles.buttonText}>Регистрация</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(tabs)/rules')}
        >
          <Ionicons name="book" size={24} color="#fff" />
          <Text style={styles.buttonText}>Правила игры</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Версия 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#8E8E93',
  },
});