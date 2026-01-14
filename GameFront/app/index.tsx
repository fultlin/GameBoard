import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

/**
 * Главный экран приложения "Морской бой"
 * Содержит навигацию к основным разделам приложения
 */
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Заголовок приложения */}
      <View style={styles.header}>
        <Ionicons name="boat" size={64} color="#007AFF" />
        <Text style={styles.title}>Морской бой</Text>
        <Text style={styles.subtitle}>Классическая игра</Text>
      </View>

      {/* Навигационные кнопки */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/game')}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.buttonText}>Новая игра</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.buttonText}>Настройки</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/rules')}
        >
          <Ionicons name="book" size={24} color="#fff" />
          <Text style={styles.buttonText}>Правила игры</Text>
        </TouchableOpacity>
      </View>

      {/* Информация о версии */}
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