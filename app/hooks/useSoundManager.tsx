import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

interface SoundManager {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  playMenuSound: () => Promise<void>;
  playHitSound: () => Promise<void>;
  playMissSound: () => Promise<void>;
  playVictorySound: () => Promise<void>;
  playButtonSound: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleVibration: () => Promise<void>;
}

export const useSoundManager = (): SoundManager => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundObjects, setSoundObjects] = useState<{[key: string]: Audio.Sound}>({});

  // Загружаем настройки при инициализации
  useEffect(() => {
    loadSettings();
    loadSounds();
    
    return () => {
      Object.values(soundObjects).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
    };
  }, []);

  const loadSettings = async () => {
    try {
      const [soundSetting, vibrationSetting] = await Promise.all([
        AsyncStorage.getItem('soundEnabled'),
        AsyncStorage.getItem('vibrationEnabled'),
      ]);
      
      if (soundSetting !== null) {
        setSoundEnabled(JSON.parse(soundSetting));
      }
      if (vibrationSetting !== null) {
        setVibrationEnabled(JSON.parse(vibrationSetting));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек звука:', error);
    }
  };

  const loadSounds = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const sounds = {
        menu: require('../../assets/sounds/button-26.mp3'),
        hit: require('../../assets/sounds/hit.mp3'),
        miss: require('../../assets/sounds/miss.mp3'),
        victory: require('../../assets/sounds/winner.mp3'),
        button: require('../../assets/sounds/button-26.mp3'),
      };

      const loadedSounds: {[key: string]: Audio.Sound} = {};

      for (const [key, source] of Object.entries(sounds)) {
        const { sound } = await Audio.Sound.createAsync(source, { 
          shouldPlay: false,
          volume: 0.7,
        });
        loadedSounds[key] = sound;
      }

      setSoundObjects(loadedSounds);
    } catch (error) {
      console.error('Ошибка загрузки звуков:', error);
    }
  };

  const playSound = async (soundKey: string) => {
    // Всегда проверяем актуальное состояние soundEnabled
    if (!soundEnabled || !soundObjects[soundKey]) return;

    try {
      await soundObjects[soundKey].setPositionAsync(0);
      await soundObjects[soundKey].playAsync();
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
    }
  };

  const playMenuSound = async () => {
    if (!soundEnabled) return;
    await playSound('menu');
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const playHitSound = async () => {
    if (!soundEnabled) return;
    await playSound('hit');
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const playMissSound = async () => {
    if (!soundEnabled) return;
    await playSound('miss');
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const playVictorySound = async () => {
    if (!soundEnabled) return;
    await playSound('victory');
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 200);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 400);
    }
  };

  const playButtonSound = async () => {
    if (!soundEnabled) return;
    await playSound('button');
    if (vibrationEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    
    try {
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(newValue));
    } catch (error) {
      console.error('Ошибка сохранения настройки звука:', error);
    }
  };

  const toggleVibration = async () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabled(newValue);
    
    try {
      await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(newValue));
    } catch (error) {
      console.error('Ошибка сохранения настройки вибрации:', error);
    }
  };

  return {
    soundEnabled,
    vibrationEnabled,
    playMenuSound,
    playHitSound,
    playMissSound,
    playVictorySound,
    playButtonSound,
    toggleSound,
    toggleVibration,
  };
};