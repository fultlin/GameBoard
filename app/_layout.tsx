import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RootLayout() {
  return (
    <LinearGradient
      colors={['#0A1D3F', '#1E3A8A', '#0F4C75']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <Stack
          screenOptions={{
            headerStyle: { 
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: { 
              fontWeight: '800',
              fontSize: 20,
              fontFamily: 'System',
            },
            headerBackground: () => (
              <LinearGradient
                colors={['rgba(10, 29, 63, 0.95)', 'rgba(30, 58, 138, 0.9)']}
                style={StyleSheet.absoluteFill}
              />
            ),
            contentStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: '⚓ Морской Бой',
              headerShown: false
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});