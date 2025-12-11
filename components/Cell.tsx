import React from 'react';
import { Player } from '../types';
import { X, Circle } from 'lucide-react';

interface CellProps {
  value: Player;
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, disabled, highlight }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        relative flex items-center justify-center w-full h-24 sm:h-32 rounded-xl text-4xl sm:text-6xl transition-all duration-300 ease-in-out
        ${highlight 
          ? 'bg-green-500/20 ring-4 ring-green-500/50 scale-105 z-10' 
          : 'bg-white/10 hover:bg-white/20 active:scale-95'
        }
        ${value === null && !disabled ? 'cursor-pointer' : 'cursor-default'}
        disabled:opacity-100
        backdrop-blur-sm shadow-lg
      `}
      aria-label={value ? `Cell filled with ${value}` : "Empty cell"}
    >
      <div className={`transition-all duration-500 transform ${value ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        {value === 'X' && (
          <X className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" strokeWidth={2.5} />
        )}
        {value === 'O' && (
          <Circle className="w-14 h-14 sm:w-16 sm:h-16 text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]" strokeWidth={3} />
        )}
      </div>
    </button>
  );
};

export default Cell;