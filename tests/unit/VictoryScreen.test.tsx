import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { VictoryScreen } from '../../components/VictoryScreen';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  
  const Ionicons = ({ name, size, color, testID }: any) => 
    React.createElement('div', { 
      'data-testid': testID || `icon-${name}`,
      style: { fontSize: size, color }
    }, name);
  
  return { Ionicons };
});

describe('VictoryScreen Component', () => {
  const mockOnPlayAgain = jest.fn();
  const mockOnMainMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Victory State', () => {
    it('renders victory screen correctly', () => {
      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('🎉 ПОБЕДА! 🎉')).toBeTruthy();
      
      expect(screen.getByText('Вы потопили весь флот противника!')).toBeTruthy();
      
      expect(screen.getByText('Играть снова')).toBeTruthy();
      expect(screen.getByText('Главное меню')).toBeTruthy();
    });

    it('displays trophy icon for victory', () => {
      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const trophyIcon = screen.getByTestId('icon-trophy');
      expect(trophyIcon).toBeTruthy();
    });
  });

  describe('Defeat State', () => {
    it('renders defeat screen correctly', () => {
      render(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('💥 ПОРАЖЕНИЕ 💥')).toBeTruthy();
      
      expect(screen.getByText('Компьютер потопил ваш флот!')).toBeTruthy();
    });

    it('displays skull icon for defeat', () => {
      render(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const skullIcon = screen.getByTestId('icon-skull');
      expect(skullIcon).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('calls onPlayAgain when play again button is clicked', () => {
      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const playAgainButton = screen.getByText('Играть снова');
      fireEvent.click(playAgainButton);

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
      expect(mockOnMainMenu).not.toHaveBeenCalled();
    });

    it('calls onMainMenu when main menu button is clicked', () => {
      render(
        <VictoryScreen 
          isVictory={false}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const mainMenuButton = screen.getByText('Главное меню');
      fireEvent.click(mainMenuButton);

      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
      expect(mockOnPlayAgain).not.toHaveBeenCalled();
    });

    it('handles multiple button clicks correctly', () => {
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

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(2);
      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Elements', () => {
    it('renders both button icons correctly', () => {
      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const refreshIcon = screen.getByTestId('icon-refresh');
      const homeIcon = screen.getByTestId('icon-home');

      expect(refreshIcon).toBeTruthy();
      expect(homeIcon).toBeTruthy();
    });

    it('has correct overlay and container structure', () => {
      const { container } = render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has all interactive elements accessible', () => {
      render(
        <VictoryScreen 
          isVictory={true}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const playAgainButton = screen.getByText('Играть снова');
      const mainMenuButton = screen.getByText('Главное меню');

      expect(playAgainButton).toBeTruthy();
      expect(mainMenuButton).toBeTruthy();
    });
  });
});