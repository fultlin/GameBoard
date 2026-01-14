import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface VictoryScreenProps {
  isVictory: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  isVictory,
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isVictory ? "trophy" : "skull"} 
            size={80} 
            color={isVictory ? "#FFD700" : "#FF4444"} 
          />
        </View>
        
        <Text style={styles.title}>
          {isVictory ? "🎉 ПОБЕДА! 🎉" : "💥 ПОРАЖЕНИЕ 💥"}
        </Text>
        
        <Text style={styles.subtitle}>
          {isVictory 
            ? "Вы потопили весь флот противника!" 
            : "Компьютер потопил ваш флот!"
          }
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.buttonText}>Играть снова</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton} onPress={onMainMenu}>
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.buttonText}>Главное меню</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
    borderWidth: 2,
    borderColor: '#333',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
