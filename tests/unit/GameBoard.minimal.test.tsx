import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const MinimalGameBoard = ({ 
  gameBoard, 
  onCellPress, 
  editable = true,
  title 
}: any) => {
  return (
    <div>
      {title && <div>{title}</div>}
      <button 
        data-testid="cell-0-0"
        onClick={() => onCellPress(0, 0)}
        disabled={!editable}
      >
        Cell 0-0
      </button>
      <div>Кораблей: {gameBoard.ships.length}</div>
    </div>
  );
};

describe('Minimal GameBoard Test', () => {
  it('renders minimal component', () => {
    const mockGameBoard = {
      cells: [],
      ships: []
    };
    
    render(
      <MinimalGameBoard 
        gameBoard={mockGameBoard}
        onCellPress={jest.fn()}
        editable={true}
        title="Test Board"
      />
    );

    expect(screen.getByText('Test Board')).toBeTruthy();
    expect(screen.getByText('Кораблей: 0')).toBeTruthy();
  });

  it('calls onCellPress when clicked', () => {
    const mockOnCellPress = jest.fn();
    const mockGameBoard = {
      cells: [],
      ships: []
    };
    
    render(
      <MinimalGameBoard 
        gameBoard={mockGameBoard}
        onCellPress={mockOnCellPress}
        editable={true}
      />
    );

    const cell = screen.getByTestId('cell-0-0');
    fireEvent.click(cell);

    expect(mockOnCellPress).toHaveBeenCalledWith(0, 0);
  });
});