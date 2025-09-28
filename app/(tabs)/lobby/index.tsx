import { API_BASE_URL } from '@/app/config';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Lobby {
  id: number;
  name: string;
  creator_id: number;
  current_players: number;
  max_players: number;
  is_game_started: boolean;
  created_at: string;
  creator: {
    id: number;
    username: string;
  };
}

export default function LobbyScreen() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchLobbies = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/lobby/`, { // Используем API_BASE_URL
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLobbies(data);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить лобби');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createLobby = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/lobby/`, { // Используем API_BASE_URL
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Лобби ${lobbies.length + 1}`,
          max_players: 2,
        }),
      });

      if (response.ok) {
        const newLobby = await response.json();
        Alert.alert('Успех', 'Лобби создано!');
        router.push(`/(tabs)/lobby/${newLobby.id}` as any);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать лобби');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать лобби');
    }
  };

  const joinLobby = async (lobbyId: number) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/lobby/${lobbyId}/join`, { // Используем API_BASE_URL
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Успех', 'Вы присоединились к лобби!');
        router.push(`/(tabs)/lobby/${lobbyId}` as any);
      } else {
        const errorData = await response.json();
        Alert.alert('Ошибка', errorData.detail || 'Не удалось присоединиться');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось присоединиться к лобби');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLobbies();
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  const renderLobbyItem = ({ item }: { item: Lobby }) => (
    <TouchableOpacity 
      style={[
        styles.lobbyItem,
        (item.current_players >= item.max_players || item.is_game_started) && styles.lobbyItemDisabled
      ]}
      onPress={() => joinLobby(item.id)}
      disabled={item.current_players >= item.max_players || item.is_game_started}
    >
      <View style={styles.lobbyInfo}>
        <Text style={styles.lobbyName}>{item.name}</Text>
        <Text style={styles.lobbyCreator}>Создатель: {item.creator.username}</Text>
        <Text style={styles.lobbyPlayers}>
          Игроков: {item.current_players}/{item.max_players}
          {item.is_game_started && ' • Игра началась'}
        </Text>
      </View>
      <Ionicons 
        name="enter" 
        size={24} 
        color={
          item.current_players >= item.max_players || item.is_game_started 
            ? '#8E8E93' 
            : '#007AFF'
        } 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка лобби...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Лобби</Text>
        <TouchableOpacity style={styles.createButton} onPress={createLobby}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Создать</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lobbies}
        renderItem={renderLobbyItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lobbyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>Нет активных лобби</Text>
            <Text style={styles.emptySubtext}>Создайте первое лобби!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 110, // 20 + 90 для отступа от нижнего меню
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  lobbyList: {
    gap: 12,
  },
  lobbyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lobbyItemDisabled: {
    opacity: 0.6,
  },
  lobbyInfo: {
    flex: 1,
  },
  lobbyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lobbyCreator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lobbyPlayers: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});