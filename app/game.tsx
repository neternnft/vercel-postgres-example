import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  const [isMuted, setIsMuted] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const calculateOptimalGameSize = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isLandscape = screenWidth > screenHeight;
    const isMobileView = screenWidth < 640;

    setIsLandscape(isLandscape);
    setIsMobile(isMobileView);

    let gameWidth, gameHeight;

    if (isLandscape) {
      // Landscape mode
      gameWidth = Math.min(screenWidth * 0.8, 1200); // Max width of 1200px
      gameHeight = Math.min(screenHeight * 0.8, gameWidth * 0.6); // Maintain aspect ratio
    } else {
      // Portrait mode
      gameWidth = screenWidth * 0.95; // Use more width in portrait
      gameHeight = Math.min(screenHeight * 0.7, gameWidth * 1.2); // Taller in portrait
    }

    return {
      width: Math.floor(gameWidth),
      height: Math.floor(gameHeight)
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = calculateOptimalGameSize();
      setDimensions(newDimensions);
    };

    // Initial calculation
    handleResize();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [calculateOptimalGameSize]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      engineRef.current?.resize();
    }
  }, [dimensions]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      engineRef.current?.jump();
    }
  }, []);

  const handleTouch = useCallback((e: TouchEvent) => {
    e.preventDefault();
    engineRef.current?.jump();
  }, []);

  const toggleMute = useCallback(() => {
    if (engineRef.current) {
      const muted = engineRef.current.toggleMute();
      setIsMuted(muted);
    }
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
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
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
        className="bg-black rounded-lg shadow-lg relative flex flex-col items-center justify-center"
        style={{ 
          width: `${dimensions.width}px`, 
          height: `${dimensions.height}px`,
          maxWidth: '95vw',
          maxHeight: '90vh'
        }}
      >
        {isLandscape ? null : (
          <div className="absolute top-0 left-0 right-0 text-center py-2 text-white text-sm bg-black bg-opacity-50 rounded-t-lg">
            Tip: Rotate device for better gameplay
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="block rounded-lg"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            touchAction: 'none'
          }}
          role="application"
          aria-label="Game canvas"
        />

        {/* Sound control button */}
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-md transition-colors duration-300 z-20"
          aria-label={isMuted ? "Unmute game sounds" : "Mute game sounds"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Menu Overlays */}
        {!gameState.gameStarted && !gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={startGame}
              className="w-full sm:w-auto bg-green-400 hover:bg-green-500 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors duration-300 text-sm sm:text-base font-pixel"
              aria-label="Start game"
            >
              Start
            </button>
            <button
              disabled
              className="w-full sm:w-auto bg-gray-600 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md text-sm sm:text-base font-pixel cursor-not-allowed"
              aria-label="PvP mode (Coming Soon)"
            >
              PvP (Coming Soon)
            </button>
            <button
              disabled
              className="w-full sm:w-auto bg-gray-600 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md text-sm sm:text-base font-pixel cursor-not-allowed"
              aria-label="Settings (Coming Soon)"
            >
              Settings (Coming Soon)
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-red-400 hover:bg-red-500 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors duration-300 text-sm sm:text-base font-pixel"
              aria-label="Close game"
            >
              Close
            </button>
          </div>
        )}

        {gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4"
            style={{ zIndex: 10 }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Game Over!</h2>
            <p className="text-xl sm:text-2xl text-white mb-1 sm:mb-2">Score: {gameState.score}</p>
            <p className="text-lg sm:text-xl text-white mb-3 sm:mb-4">High Score: {gameState.highScore}</p>
            <button
              onClick={startGame}
              className="w-full sm:w-auto bg-green-400 hover:bg-green-500 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors duration-300 text-sm sm:text-base font-pixel"
              aria-label="Play again"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-red-400 hover:bg-red-500 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors duration-300 text-sm sm:text-base font-pixel mt-2"
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
