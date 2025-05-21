import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameEngine } from './engine/GameEngine';
import { useGameState } from './hooks/useGameState';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameState, startGame, endGame, updateScore } = useGameState();

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.6;
      engineRef.current?.resize();
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      engineRef.current?.jump();
    }
  }, []);

  const handleTouch = useCallback(() => {
    engineRef.current?.jump();
  }, []);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) {
      engineRef.current?.stop();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    // Initialize game engine
    engineRef.current = new GameEngine(canvas, updateScore, endGame);
    engineRef.current.start();

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', resizeCanvas);
      engineRef.current?.stop();
    };
  }, [gameState.gameStarted, gameState.gameOver, endGame, updateScore, handleKeyDown, handleTouch, resizeCanvas]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75"
      style={{ overflow: 'hidden' }}
      role="dialog"
      aria-label="Game window"
    >
      <div
        className="bg-black p-4 rounded-lg shadow-lg relative"
        style={{ width: '90vw', height: '70vh' }}
      >
        <canvas 
          ref={canvasRef} 
          className="block w-full h-full"
          role="application"
          aria-label="Game canvas"
        />

        {!gameState.gameStarted && !gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={startGame}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              aria-label="Start game"
            >
              Start
            </button>
            <button
              disabled
              className="bg-gray-600 text-black font-bold py-3 px-6 rounded-lg shadow-md font-pixel cursor-not-allowed"
              aria-label="PvP mode (Coming Soon)"
            >
              PvP (Coming Soon)
            </button>
            <button
              disabled
              className="bg-gray-600 text-black font-bold py-3 px-6 rounded-lg shadow-md font-pixel cursor-not-allowed"
              aria-label="Settings (Coming Soon)"
            >
              Settings (Coming Soon)
            </button>
            <button
              onClick={onClose}
              className="bg-red-400 hover:bg-red-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              aria-label="Close game"
            >
              Close
            </button>
          </div>
        )}

        {gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4"
            style={{ zIndex: 10 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-2xl text-white mb-2">Score: {gameState.score}</p>
            <p className="text-xl text-white mb-4">High Score: {gameState.highScore}</p>
            <button
              onClick={startGame}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              aria-label="Play again"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="bg-red-400 hover:bg-red-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel mt-2"
              aria-label="Close game"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Game;
