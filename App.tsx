import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import { Player, GameMode, Difficulty } from './types';
import { getAiMove } from './services/aiService';
import { Bot, User, RotateCcw, Trophy, BrainCircuit } from 'lucide-react';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [commentary, setCommentary] = useState<string>("Let's play! Your move.");
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });

  const checkWinner = useCallback((currentBoard: Player[]) => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line };
      }
    }
    if (!currentBoard.includes(null)) {
      return { winner: 'DRAW', line: null };
    }
    return null;
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || isAiThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    // Check win immediately after move
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner as Player | 'DRAW');
      setWinningLine(result.line);
      updateScore(result.winner as Player | 'DRAW');
    } else {
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, isAiThinking, checkWinner]);

  const updateScore = (result: Player | 'DRAW') => {
    setScores(prev => ({
      ...prev,
      [result === 'DRAW' ? 'Draw' : result as string]: prev[result === 'DRAW' ? 'Draw' : result as 'X' | 'O'] + 1
    }));
    if (result === 'DRAW') setCommentary("It's a draw! Well played.");
    else if (result === 'X') setCommentary("Player X wins! Nice job.");
    else if (result === 'O') setCommentary("Player O wins! Better luck next time.");
  };

  const makeAiMove = useCallback(async () => {
    if (winner || isXNext) return; // AI is always 'O' for now

    setIsAiThinking(true);
    // Minimal delay for UX so it doesn't feel instant/robotic in a bad way
    const minDelay = new Promise(resolve => setTimeout(resolve, 600)); 
    
    try {
      const [aiResponse] = await Promise.all([
        getAiMove(board, difficulty),
        minDelay
      ]);

      if (aiResponse.move !== -1 && !board[aiResponse.move]) {
        const newBoard = [...board];
        newBoard[aiResponse.move] = 'O';
        setBoard(newBoard);
        if (aiResponse.commentary) {
            setCommentary(aiResponse.commentary);
        }

        const result = checkWinner(newBoard);
        if (result) {
          setWinner(result.winner as Player | 'DRAW');
          setWinningLine(result.line);
          updateScore(result.winner as Player | 'DRAW');
        } else {
          setIsXNext(true);
        }
      }
    } catch (error) {
      console.error("AI failed to move", error);
      setIsXNext(true); // Skip turn if AI fails hard
    } finally {
      setIsAiThinking(false);
    }
  }, [board, difficulty, winner, isXNext, checkWinner]);

  // Trigger AI move effect
  useEffect(() => {
    if (gameMode === GameMode.PVE && !isXNext && !winner) {
      makeAiMove();
    }
  }, [isXNext, gameMode, winner, makeAiMove]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setCommentary("New game! Your move.");
    setIsAiThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-rose-400 mb-2 drop-shadow-sm">
          Tic Tac Toe
        </h1>
        <p className="text-slate-400 flex items-center justify-center gap-2">
          Powered by Gemini 2.5 Flash <BrainCircuit className="w-4 h-4 text-amber-400" />
        </p>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Panel: Stats & Controls */}
        <div className="w-full lg:w-64 space-y-4">
          
          {/* Score Board */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Scoreboard
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-blue-400"/> Player (X)</span>
                <span className="font-mono text-xl font-bold">{scores.X}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-rose-400"/> {gameMode === GameMode.PVE ? 'Gemini (O)' : 'Player (O)'}</span>
                <span className="font-mono text-xl font-bold">{scores.O}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Draws</span>
                <span className="font-mono text-xl">{scores.Draw}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl space-y-4">
            <div>
               <label className="text-xs text-slate-400 uppercase font-semibold block mb-2">Game Mode</label>
               <div className="flex bg-black/20 p-1 rounded-lg">
                 <button 
                   onClick={() => { setGameMode(GameMode.PVE); resetGame(); }}
                   className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${gameMode === GameMode.PVE ? 'bg-slate-700 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                   Vs AI
                 </button>
                 <button 
                   onClick={() => { setGameMode(GameMode.PVP); resetGame(); }}
                   className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${gameMode === GameMode.PVP ? 'bg-slate-700 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
                 >
                   Vs Player
                 </button>
               </div>
            </div>

            {gameMode === GameMode.PVE && (
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold block mb-2">Difficulty</label>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  <button 
                    onClick={() => setDifficulty(Difficulty.EASY)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${difficulty === Difficulty.EASY ? 'bg-green-600/80 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Casual
                  </button>
                  <button 
                    onClick={() => setDifficulty(Difficulty.HARD)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${difficulty === Difficulty.HARD ? 'bg-rose-600/80 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Hard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Board */}
        <div className="flex-1 flex flex-col items-center">
            
            {/* Status Bar */}
            <div className="mb-6 h-16 flex items-center justify-center">
                {winner ? (
                    <div className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full animate-bounce">
                        <span className="text-green-300 font-bold text-lg">
                            {winner === 'DRAW' ? 'Game Draw!' : `${winner} Wins!`}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50">
                        {isAiThinking ? (
                            <>
                                <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
                                <span className="text-purple-200">Gemini is thinking...</span>
                            </>
                        ) : (
                            <>
                                <span className={isXNext ? 'text-blue-400 font-bold' : 'text-slate-500'}>X's Turn</span>
                                <span className="text-slate-600">|</span>
                                <span className={!isXNext ? 'text-rose-400 font-bold' : 'text-slate-500'}>O's Turn</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Board 
              squares={board} 
              onClick={handleCellClick} 
              winningLine={winningLine}
              disabled={!!winner || (gameMode === GameMode.PVE && !isXNext)}
            />

            {/* Commentary Bubble */}
            <div className="mt-8 w-full max-w-md min-h-[80px] bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 relative">
                <div className="absolute -top-3 left-8 w-6 h-6 bg-indigo-900/30 border-t border-l border-indigo-500/20 transform rotate-45"></div>
                <div className="flex gap-4 items-start">
                    <div className="bg-indigo-600/20 p-2 rounded-full">
                        <Bot className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-indigo-200 text-sm italic leading-relaxed">
                          "{commentary}"
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={resetGame}
                className="mt-8 flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all active:scale-95 border border-white/10 shadow-lg group"
            >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Reset Game
            </button>
        </div>

      </div>
    </div>
  );
};

export default App;