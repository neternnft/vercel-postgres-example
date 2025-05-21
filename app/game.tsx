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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.6;
    };

    resizeCanvas();

    const scale = window.innerWidth <= 768 ? 1 : 1;
    const baseSpeed = canvas.width / 160;
    const speed = window.innerWidth <= 768
      ? baseSpeed * MOBILE_SPEED_MULTIPLIER
      : baseSpeed * DESKTOP_SPEED_MULTIPLIER;

    const groundHeight = 20;
    const squareSize = 60;
    const dino = {
      x: 50,
      y: 0,
      width: squareSize,
      height: squareSize,
      jumping: false,
      jumpHeight: 100,
      yVelocity: 0,
      landingGracePeriod: 0,
      jumpCount: 0,
    };

    dino.y = canvas.height - groundHeight - dino.height;

    const obstacles: { x: number; width: number; height: number; type: string }[] = [];
    const minObstacleDistance = canvas.width / 2;

    const discoColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF', '#00FFFF', '#FF00FF'];
    let frameCount = 0;
    let animationFrameId: number;

    const drawSparkles = () => {
      const sparkleCount = 6;
      for (let i = 0; i < sparkleCount; i++) {
        const x = dino.x + Math.random() * dino.width;
        const y = dino.y + dino.height - 5 - Math.random() * 4;
        const size = 2 + Math.random() * 2;
        ctx.fillStyle = discoColors[Math.floor(Math.random() * discoColors.length)];
        ctx.fillRect(x, y, size, size);
      }
    };

    const drawDino = () => {
      frameCount++;
      const colorIndex = Math.floor(frameCount / 5) % discoColors.length;
      ctx.fillStyle = discoColors[colorIndex];
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      if (!dino.jumping && dino.landingGracePeriod === 0) {
        drawSparkles();
      }
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      const obstacleY = canvas.height - groundHeight - obstacle.height;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(obstacle.x, obstacleY, obstacle.width, obstacle.height);
    };

    const updateDinoJump = () => {
      if (dino.jumping) {
        dino.yVelocity += 0.7;
        dino.y += dino.yVelocity;

        const groundY = canvas.height - groundHeight - dino.height;
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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

      drawDino();
      updateDinoJump();

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= speed;
        drawObstacle(obstacle);

        const obstacleY = canvas.height - groundHeight - obstacle.height;
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

      if (
        obstacles.length === 0 ||
        (canvas.width - obstacles[obstacles.length - 1].x > minObstacleDistance &&
          Math.random() < 0.02)
      ) {
        obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 40,
          type: 'cactus',
        });
      }

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
    window.addEventListener('resize', resizeCanvas);

    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', resizeCanvas);
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
