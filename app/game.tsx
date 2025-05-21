import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sql } from '@vercel/postgres';

interface GameProps {
  onClose: () => void;
}

const DESKTOP_SPEED_MULTIPLIER = 1.5;
const MOBILE_SPEED_MULTIPLIER = 1.8;

const Game: React.FC<GameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set CSS size of the canvas
    const cssWidth = window.innerWidth * 0.9;
    const cssHeight = window.innerHeight * 0.6;

    // Set canvas internal resolution for sharpness
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    // Set CSS size to control on-screen size
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // Reset transform and scale context to DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Constants for the game
    const scale = window.innerWidth <= 768 ? 0.7 : 0.85;
    const baseSpeed = cssWidth / 160;
    const speed = window.innerWidth <= 768
      ? baseSpeed * MOBILE_SPEED_MULTIPLIER
      : baseSpeed * DESKTOP_SPEED_MULTIPLIER;

    const groundHeight = 20;

    // Player dino object (perfect square for width=height)
    const dino = {
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      jumping: false,
      yVelocity: 0,
      landingGracePeriod: 0,
      jumpCount: 0,
      jumpHeight: 100,
    };

    // Start player on the ground (account for scale)
    dino.y = cssHeight - groundHeight - dino.height;

    const obstacles: { x: number; width: number; height: number; type: string }[] = [];
    const minObstacleDistance = cssWidth / 2;

    const colorChangeSpeed = 5;
    const discoColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF', '#00FFFF', '#FF00FF'];
    let frameCount = 0;
    let animationFrameId: number;

    const drawDino = () => {
      frameCount++;
      const colorIndex = Math.floor(frameCount / colorChangeSpeed) % discoColors.length;
      ctx.fillStyle = discoColors[colorIndex];
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      const obstacleY = cssHeight - groundHeight - obstacle.height;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(obstacle.x, obstacleY, obstacle.width, obstacle.height);
    };

    const updateDinoJump = () => {
      if (dino.jumping) {
        dino.yVelocity += 0.7; // gravity
        dino.y += dino.yVelocity;

        const groundY = cssHeight - groundHeight - dino.height;
        if (dino.y > groundY) {
          dino.y = groundY;
          dino.jumping = false;
          dino.yVelocity = 0;
          dino.landingGracePeriod = 10;
          dino.jumpCount = 0;
        }
      } else if (dino.landingGracePeriod > 0) {
        dino.landingGracePeriod--;
      }
    };

    const updateGame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Draw background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Draw ground
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, cssHeight - groundHeight, cssWidth, groundHeight);

      drawDino();
      updateDinoJump();

      // Update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= speed;
        drawObstacle(obstacle);

        const obstacleY = cssHeight - groundHeight - obstacle.height;

        const isColliding =
          dino.landingGracePeriod === 0 &&
          dino.x < obstacle.x + obstacle.width &&
          dino.x + dino.width > obstacle.x &&
          dino.y + dino.height > obstacleY;

        if (isColliding) {
          setGameOver(true);
          setGameStarted(false);
          highScoreRef.current = Math.max(highScoreRef.current, scoreRef.current);
          setScore(scoreRef.current);
          setHighScore(highScoreRef.current);
          saveHighScore(scoreRef.current);
          return;
        }

        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1);
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      // Add new obstacles randomly with spacing
      if (
        obstacles.length === 0 ||
        (cssWidth - obstacles[obstacles.length - 1].x > minObstacleDistance &&
          Math.random() < 0.02)
      ) {
        obstacles.push({
          x: cssWidth,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 40,
          type: 'cactus',
        });
      }

      // Draw score
      ctx.fillStyle = '#4ade80';
      ctx.font = '20px pixel, Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      }
    };

    const jump = () => {
      if (dino.jumpCount < 2) {
        dino.jumping = true;
        dino.yVelocity = -14;
        dino.jumpCount++;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);
    window.addEventListener('resize', () => {
      // On resize, reset canvas size and update dino.y accordingly
      const newCssWidth = window.innerWidth * 0.9;
      const newCssHeight = window.innerHeight * 0.6;
      canvas.width = newCssWidth * dpr;
      canvas.height = newCssHeight * dpr;
      canvas.style.width = `${newCssWidth}px`;
      canvas.style.height = `${newCssHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      dino.y = newCssHeight - groundHeight - dino.height;
    });

    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, gameOver]);

  const saveHighScore = async (score: number) => {
    try {
      await sql`INSERT INTO high_scores (score) VALUES (${score})`;
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75"
      style={{ overflow: 'hidden' }}
    >
      <div
        className="bg-black p-4 rounded-lg shadow-lg relative"
        style={{ width: '90vw', height: '70vh' }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {!gameStarted && !gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4"
            style={{ zIndex: 10 }}
          >
            <button
              onClick={() => {
                setGameStarted(true);
                setGameOver(false);
                scoreRef.current = 0;
                setScore(0);
              }}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
            >
              Start
            </button>
            <button
              disabled
              className="bg-gray-600 text-black font-bold py-3 px-6 rounded-lg shadow-md font-pixel cursor-not-allowed"
            >
              PvP (Coming Soon)
            </button>
            <button
              disabled
              className="bg-gray-600 text-black font-bold py-3 px-6 rounded-lg shadow-md font-pixel cursor-not-allowed"
            >
              Leaderboard (Coming Soon)
            </button>
          </div>
        )}

        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70"
            style={{ zIndex: 10 }}
          >
            <h1 className="text-green-400 font-pixel text-6xl mb-10 select-none">
              GAME OVER
            </h1>
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setGameOver(false);
                  setGameStarted(true);
                  scoreRef.current = 0;
                  setScore(0);
                }}
                className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Game;
