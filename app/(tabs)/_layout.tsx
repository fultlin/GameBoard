import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useSoundManager } from '../hooks/useSoundManager';

export default function TabLayout() {
  const tabFloat = useRef(new Animated.Value(0)).current;
  const soundManager = useSoundManager();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tabFloat, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tabFloat, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [tabFloat]);

  const TabIcon = ({ name, color, size, focused }: { name: string; color: string; size: number; focused: boolean }) => (
    <Animated.View
      style={[
        styles.tabIconContainer,
        focused && styles.tabIconContainerFocused,
        {
          transform: [
            {
              translateY: focused ? 
                tabFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10] // Увеличил амплитуду
                }) : 0
            },
            {
              scale: focused ? 
                tabFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2] // Добавил масштабирование
                }) : 1
            }
          ]
        }
      ]}
    >
      <Ionicons 
        name={name as any} 
        size={focused ? size + 4 : size} 
        color={color} 
      />
      {focused && (
        <Animated.View 
          style={[
            styles.activeIndicator,
            {
              transform: [
                {
                  scale: tabFloat.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3]
                  })
                }
              ]
            }
          ]} 
        />
      )}
    </Animated.View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 100,
          paddingBottom: 25,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          <>
            <LinearGradient
              colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.85)', 'rgba(15, 76, 117, 0.9)']}
              style={StyleSheet.absoluteFill}
            />
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          </>
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 6,
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        headerStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          letterSpacing: 1,
        },
        headerBackground: () => (
          <LinearGradient
            colors={['rgba(10, 29, 63, 0.98)', 'rgba(30, 58, 138, 0.95)', 'rgba(15, 76, 117, 0.92)']}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerShadowVisible: false,
      }}
      screenListeners={{
        tabPress: async () => {
          await soundManager.playMenuSound();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ШТУРМАН',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="compass" color={color} size={size} focused={focused} />
          ),
          headerTitle: '⚓ МОРСКОЙ ШТУРМАН',
        }}
      />
      <Tabs.Screen
        name="lobby"
        options={{
          title: 'ФЛОТИЛИЯ',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="people" color={color} size={size} focused={focused} />
          ),
          headerTitle: '⚓ ФЛОТИЛИЯ КОРАБЛЕЙ',
        }}
      />
      <Tabs.Screen
        name="game/index"
        options={{
          title: 'СРАЖЕНИЕ',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="play" color={color} size={size} focused={focused} />
          ),
          headerTitle: '⚓ МОРСКОЙ БОЙ',
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'КАЮТА',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="settings" color={color} size={size} focused={focused} />
          ),
          headerTitle: '⚓ КАЮТА АДМИРАЛА',
        }}
      />
      <Tabs.Screen
        name="rules/index"
        options={{
          title: 'УСТАВ',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="book" color={color} size={size} focused={focused} />
          ),
          headerTitle: '⚓ КОРАБЕЛЬНЫЙ УСТАВ',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIconContainerFocused: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
});