import React from 'react';
import Cell from './Cell';
import { Player } from '../types';

interface BoardProps {
  squares: Player[];
  onClick: (i: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 shadow-2xl backdrop-blur-md max-w-md w-full mx-auto">
      {squares.map((square, i) => (
        <Cell
          key={i}
          value={square}
          onClick={() => onClick(i)}
          highlight={winningLine?.includes(i) ?? false}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default Board;