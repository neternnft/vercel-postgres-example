"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { GameEngine } from './engine/GameEngine';
import { useGameState } from './hooks/useGameState';
import Leaderboard from './components/Leaderboard';
import { useAccount } from 'wagmi';
import { useUserProfile } from './components/UserProfile';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  const { address } = useAccount();
  const { profileData } = useUserProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameState, startGame, endGame, updateScore } = useGameState();
  const [isMuted, setIsMuted] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
      gameWidth = Math.min(screenWidth * 0.9, 1200); // Use more width in landscape
      gameHeight = Math.min(screenHeight * 0.9, gameWidth * 0.6); // Maintain aspect ratio
    } else {
      // Portrait mode
      gameWidth = screenWidth * 0.95; // Use more width in portrait
      gameHeight = Math.min(screenHeight * 0.8, gameWidth * 1.2); // Taller in portrait
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

        {/* Menu Overlays */}
        {!gameState.gameStarted && !gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4"
            style={{ zIndex: 10 }}
          >
            <div className="w-full max-w-[200px] flex flex-col gap-3 sm:gap-4">
              <motion.button
                onClick={startGame}
                className="w-full bg-[#54CA9B] hover:bg-[#42A97A] text-black font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base font-pixel"
                aria-label="Start game"
              >
                Start
              </motion.button>

              <motion.button
                disabled
                className="relative w-full bg-gray-600 text-gray-400 font-bold py-3 px-6 rounded-lg text-sm sm:text-base font-pixel cursor-not-allowed"
                aria-label="PvP mode (Coming Soon)"
              >
                PvP
                <div className="absolute top-0 right-0 bg-gray-500 text-gray-200 text-xs px-2 py-0.5 rounded-bl-md rounded-tr-md">Soon</div>
              </motion.button>

              <motion.button
                onClick={() => setShowLeaderboard(true)}
                className="w-full bg-[#54CA9B] hover:bg-[#42A97A] text-black font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base font-pixel"
                aria-label="View leaderboard"
              >
                Leaderboard
              </motion.button>

              <motion.button
                onClick={onClose}
                className="w-full bg-red-400 hover:bg-red-500 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base font-pixel"
                aria-label="Close game"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}

        {gameState.gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4"
            style={{ zIndex: 10 }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Game Over!</h2>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xl sm:text-2xl text-white">Score: {gameState.score}</p>
              <p className="text-xl sm:text-2xl text-white">High Score: {gameState.personalBest}</p>
            </div>
            
            <div className="w-full max-w-[200px] flex flex-col gap-3">
              <motion.button
                onClick={startGame}
                className="w-full bg-[#54CA9B] hover:bg-[#42A97A] text-black font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base font-pixel"
                aria-label="Play again"
              >
                Play Again
              </motion.button>

              <motion.button
                onClick={onClose}
                className="w-full bg-red-400 hover:bg-red-500 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base font-pixel"
                aria-label="Close game"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}

        {/* Sound control button - only show when game is active and not on mobile */}
        {gameState.gameStarted && !gameState.gameOver && !isMobile && (
          <>
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
          </>
        )}

        {/* Power-ups Guide - show during active gameplay on all screen sizes */}
        {gameState.gameStarted && !gameState.gameOver && (
          <div className={`
            absolute 
            ${isMobile 
              ? 'bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/60 py-2 px-4' 
              : 'right-2 top-16 sm:right-4 sm:top-20 bg-gray-800/90 rounded-lg p-2'
            }
            shadow-md z-20
          `}>
            {!isMobile && <h3 className="text-[#54CA9B] font-semibold mb-1 text-center">Power-ups</h3>}
            <ul className={`
              text-white 
              ${isMobile 
                ? 'flex justify-around items-center max-w-md mx-auto' 
                : 'space-y-0.5'
              }
            `}>
              <li className={`flex items-center gap-1 ${isMobile ? 'flex-col justify-center' : ''}`}>
                <span className={`text-blue-400 ${isMobile ? 'text-lg' : 'text-sm'}`}>🛡️</span> 
                <span className={isMobile ? 'text-[10px] text-gray-300' : ''}>Invincibility</span>
              </li>
              <li className={`flex items-center gap-1 ${isMobile ? 'flex-col justify-center' : ''}`}>
                <span className={`text-green-400 ${isMobile ? 'text-lg' : 'text-sm'}`}>⚡</span> 
                <span className={isMobile ? 'text-[10px] text-gray-300' : ''}>Triple Jump</span>
              </li>
              <li className={`flex items-center gap-1 ${isMobile ? 'flex-col justify-center' : ''}`}>
                <span className={`text-pink-400 ${isMobile ? 'text-lg' : 'text-sm'}`}>⏰</span> 
                <span className={isMobile ? 'text-[10px] text-gray-300' : ''}>Slow Motion</span>
              </li>
            </ul>
          </div>
        )}
      </div>
      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </motion.div>
  );
};

export default Game;

