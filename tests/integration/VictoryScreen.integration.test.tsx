import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { VictoryScreen } from '../../components/VictoryScreen';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  
  const Ionicons = ({ name, size, color }: any) => 
    React.createElement('div', { 
      'data-testid': `icon-${name}`,
      style: { fontSize: size, color }
    }, name);
  
  return { Ionicons };
});

describe('VictoryScreen Integration Tests', () => {
  it('integrates with game flow for victory scenario', () => {
    let gameState = 'playing';
    const handlePlayAgain = () => { gameState = 'restarting'; };
    const handleMainMenu = () => { gameState = 'menu'; };

    const { rerender } = render(
      <VictoryScreen 
        isVictory={true}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleMainMenu}
      />
    );

    expect(screen.getByText('🎉 ПОБЕДА! 🎉')).toBeTruthy();

    const playAgainButton = screen.getByText('Играть снова');
    fireEvent.click(playAgainButton);

    expect(gameState).toBe('restarting');
  });

  it('integrates with game flow for defeat scenario', () => {
    let gameState = 'playing';
    const handlePlayAgain = () => { gameState = 'restarting'; };
    const handleMainMenu = () => { gameState = 'menu'; };

    render(
      <VictoryScreen 
        isVictory={false}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleMainMenu}
      />
    );

    expect(screen.getByText('💥 ПОРАЖЕНИЕ 💥')).toBeTruthy();

    const mainMenuButton = screen.getByText('Главное меню');
    fireEvent.click(mainMenuButton);

    expect(gameState).toBe('menu');
  });

  it('handles rapid button clicks correctly', () => {
    const mockOnPlayAgain = jest.fn();
    const mockOnMainMenu = jest.fn();

    render(
      <VictoryScreen 
        isVictory={true}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    const playAgainButton = screen.getByText('Играть снова');
    const mainMenuButton = screen.getByText('Главное меню');

    fireEvent.click(playAgainButton);
    fireEvent.click(mainMenuButton);
    fireEvent.click(playAgainButton);
    fireEvent.click(playAgainButton);

    expect(mockOnPlayAgain).toHaveBeenCalledTimes(3);
    expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
  });
});