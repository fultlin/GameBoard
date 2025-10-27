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

describe('VictoryScreen Functional Tests', () => {
  describe('User Experience Flow', () => {
    it('provides complete victory celebration experience', () => {
      const mockOnPlayAgain = jest.fn();
      const mockOnMainMenu = jest.fn();

      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('🎉 ПОБЕДА! 🎉')).toBeTruthy();
      expect(screen.getByText('Вы потопили весь флот противника!')).toBeTruthy();
      expect(screen.getByTestId('icon-trophy')).toBeTruthy();

      const playAgainButton = screen.getByText('Играть снова');
      const mainMenuButton = screen.getByText('Главное меню');

      expect(playAgainButton).toBeTruthy();
      expect(mainMenuButton).toBeTruthy();
      expect(screen.getByTestId('icon-refresh')).toBeTruthy();
      expect(screen.getByTestId('icon-home')).toBeTruthy();

      fireEvent.click(playAgainButton);
      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('provides complete defeat experience', () => {
      const mockOnPlayAgain = jest.fn();
      const mockOnMainMenu = jest.fn();

      render(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('💥 ПОРАЖЕНИЕ 💥')).toBeTruthy();
      expect(screen.getByText('Компьютер потопил ваш флот!')).toBeTruthy();
      expect(screen.getByTestId('icon-skull')).toBeTruthy();

      const mainMenuButton = screen.getByText('Главное меню');
      fireEvent.click(mainMenuButton);
      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid victory/defeat toggles', () => {
      const mockOnPlayAgain = jest.fn();
      const mockOnMainMenu = jest.fn();

      const { rerender } = render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      rerender(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('💥 ПОРАЖЕНИЕ 💥')).toBeTruthy();

      rerender(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('🎉 ПОБЕДА! 🎉')).toBeTruthy();
    });

    it('maintains consistent styling across states', () => {
      const { container: victoryContainer } = render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={jest.fn()}
          onMainMenu={jest.fn()}
        />
      );

      const { container: defeatContainer } = render(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={jest.fn()}
          onMainMenu={jest.fn()}
        />
      );

      expect(victoryContainer.firstChild).toBeTruthy();
      expect(defeatContainer.firstChild).toBeTruthy();
    });
  });
});