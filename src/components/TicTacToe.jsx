import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

const TicTacToe = ({ onGameOver }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      onGameOver(result.winner === 'X' ? 'win' : 'loss');
    } else if (!newBoard.includes(null)) {
      setWinner('draw');
      onGameOver('draw');
    }
  };

  // Simple AI for 'O' (Computer) if you are 'X'
  useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(() => {
        const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          handleClick(randomMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, board]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const renderSquare = (i) => {
    const isWinningSquare = winningLine.includes(i);
    return (
      <button
        key={i}
        className={`w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl font-black rounded-2xl transition-all duration-300 transform 
          ${!board[i] && !winner ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
          ${isWinningSquare ? 'bg-teal-500 text-white scale-105 rotate-3' : 'bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white shadow-sm'}
          flex items-center justify-center`}
        onClick={() => handleClick(i)}
      >
        <span className={`${board[i] === 'X' ? 'text-teal-600' : 'text-rose-500'} ${isWinningSquare ? 'text-white' : ''}`}>
          {board[i]}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
          {winner ? (
            winner === 'draw' ? '¡Empate!' : winner === 'X' ? '¡Has ganado!' : 'Has perdido'
          ) : (
            `Turno: ${isXNext ? 'Tuyo (X)' : 'Computadora (O)'}`
          )}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] shadow-inner border-4 border-white dark:border-gray-800">
        {board.map((_, i) => renderSquare(i))}
      </div>

      <Button
        onClick={resetGame}
        className="bg-teal-600 text-white px-10 h-12 rounded-full font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform"
      >
        Reiniciar Juego
      </Button>
    </div>
  );
};

export default TicTacToe;
