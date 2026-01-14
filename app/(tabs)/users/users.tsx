// app/users/index.tsx
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username: string;
  email: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем токен из AsyncStorage
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      console.log('Loaded token from storage:', storedToken);
      setToken(storedToken);
      setError(null);
    } catch (error) {
      console.error('Error loading token:', error);
      setError('Ошибка загрузки токена');
    } finally {
      setLoading(false);
    }
  };

  const updateMyOnlineStatus = async () => {
    if (!token) {
      console.log('No token available for status update');
      return;
    }

    console.log('Updating online status with token:', token.substring(0, 20) + '...');
    
    try {
      const response = await fetch('https://board-back-mg7h.onrender.com/api/users/update_online_status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status update response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update failed:', errorText);
        if (response.status === 401) {
          setError('Токен устарел. Необходимо перезайти');
        }
      } else {
        console.log('Online status updated successfully');
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      setError('Ошибка соединения с сервером');
    }
  };

  const fetchUsers = async () => {
    if (!token) {
      console.log('No token available for fetching users');
      setError('Необходима авторизация');
      return;
    }

    try {
      setError(null);
      const response = await fetch('https://board-back-mg7h.onrender.com/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        console.log('Users fetched successfully:', data.length);
      } else {
        console.error('Failed to fetch users:', response.status);
        if (response.status === 401) {
          setError('Токен устарел. Необходимо перезайти');
        } else {
          setError('Ошибка загрузки пользователей');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Ошибка соединения с сервером');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await updateMyOnlineStatus();
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    if (token && !loading) {
      const initialize = async () => {
        console.log('Initializing users screen with token');
        await updateMyOnlineStatus();
        await fetchUsers();
      };
      
      initialize();
      
      // Обновляем список пользователей каждые 30 секунд
      const usersInterval = setInterval(fetchUsers, 30000);
      
      // Обновляем свой онлайн-статус каждую минуту
      const statusInterval = setInterval(updateMyOnlineStatus, 60000);
      
      return () => {
        clearInterval(usersInterval);
        clearInterval(statusInterval);
      };
    }
  }, [token, loading]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
    } catch (error) {
      return 'неизвестно';
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.85)', 'rgba(15, 76, 117, 0.9)']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Загрузка экипажа...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!token) {
    return (
      <LinearGradient
        colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.85)', 'rgba(15, 76, 117, 0.9)']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚓ ДОСТУП ЗАКРЫТ</Text>
          <Text style={styles.errorText}>
            Для просмотра экипажа необходимо авторизоваться
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.85)', 'rgba(15, 76, 117, 0.9)']}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ ОШИБКА</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>
              Потяните вниз для повторной попытки
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.85)', 'rgba(15, 76, 117, 0.9)']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>⚓ ЭКИПАЖ КОРАБЛЯ</Text>
          <Text style={styles.subtitle}>
            Всего моряков: {users.length} • Онлайн: {users.filter(u => u.is_online).length}
          </Text>
        </View>

        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Экипаж пуст</Text>
            <Text style={styles.emptySubtext}>
              На корабле пока нет других моряков
            </Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.id} style={[styles.userCard, user.is_online && styles.userCardOnline]}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.username}>{user.username}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, user.is_online ? styles.online : styles.offline]} />
                    <Text style={styles.statusText}>
                      {user.is_online ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.email}>{user.email}</Text>
                
                <View style={styles.userMeta}>
                  <Text style={styles.metaText}>
                    На борту с: {formatDate(user.created_at)}
                  </Text>
                  {!user.is_online && (
                    <Text style={styles.metaText}>
                      Последний раз видели: {formatDate(user.last_seen)}
                    </Text>
                  )}
                </View>
              </View>
              
              {user.is_online && (
                <View style={styles.onlinePulse}>
                  <View style={styles.pulseCircle} />
                </View>
              )}
            </View>
          ))
        )}
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
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardOnline: {
    borderLeftColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#10B981',
  },
  offline: {
    backgroundColor: '#6B7280',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  userMeta: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  onlinePulse: {
    position: 'relative',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});