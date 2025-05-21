import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sql } from '@vercel/postgres';

interface GameProps {
  onClose: () => void;
}

const DESKTOP_SPEED_MULTIPLIER = 1.5;
const MOBILE_SPEED_MULTIPLIER = 1.8;

const discoColors = [
  '#FF0000', // red
  '#FF7F00', // orange
  '#FFFF00', // yellow
  '#00FF00', // green
  '#0000FF', // blue
  '#4B0082', // indigo
  '#8F00FF', // violet
  '#00FFFF', // cyan
  '#FF00FF', // magenta
];

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

    // SCALE adjustment:
    // We'll NOT scale vertically because it distorts cubes,
    // instead keep 1:1 aspect for height & width so cubes are squares.
    // We'll adjust the width with scale but keep height unscaled to keep square shape on mobile.
    // So remove vertical scaling.
    // We'll apply scale only horizontally if needed for responsive width.

    const isMobile = window.innerWidth <= 768;
    const baseSpeed = canvas.width / 160;
    const speed = isMobile
      ? baseSpeed * MOBILE_SPEED_MULTIPLIER
      : baseSpeed * DESKTOP_SPEED_MULTIPLIER;

    const groundHeight = 20;
    const dino = {
      x: 50,
      y: 0,
      width: 60,
      height: 60,
      jumping: false,
      yVelocity: 0,
      landingGracePeriod: 0,
      jumpCount: 0,
    };

    dino.y = canvas.height - groundHeight - dino.height;

    const obstacles: { x: number; width: number; height: number; type: string }[] = [];
    const minObstacleDistance = canvas.width / 2;

    let frameCount = 0;
    let animationFrameId: number;

    // Sparkling particles under the player cube
    const sparkleParticles: { x: number; y: number; size: number; color: string; alpha: number; alphaDirection: number }[] = [];

    const createSparkle = () => {
      const size = Math.random() * 3 + 1;
      // Sparkles just below the player cube bottom, horizontally centered +/- spread
      const x = dino.x + dino.width / 2 + (Math.random() - 0.5) * dino.width * 0.8;
      const y = dino.y + dino.height + (Math.random() * 5);
      const color = discoColors[Math.floor(Math.random() * discoColors.length)];
      sparkleParticles.push({ x, y, size, color, alpha: 1, alphaDirection: -0.05 });
    };

    const updateAndDrawSparkles = () => {
      for (let i = sparkleParticles.length - 1; i >= 0; i--) {
        const p = sparkleParticles[i];
        p.alpha += p.alphaDirection;
        if (p.alpha <= 0) {
          sparkleParticles.splice(i, 1);
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      if (frameCount % 3 === 0) {
        createSparkle();
      }
    };

    const drawDino = () => {
      frameCount++;

      // Player cube color cycles through discoColors over time:
      const colorIndex = Math.floor(frameCount / 3) % discoColors.length;
      ctx.fillStyle = discoColors[colorIndex];
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      // Sparkles under player cube ONLY if sliding (not jumping)
      if (!dino.jumping) {
        updateAndDrawSparkles();
      }
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      const obstacleY = canvas.height - groundHeight - obstacle.height;
      ctx.fillStyle = '#4ade80'; // green cubes
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

      // Remove scaling to keep squares consistent:
      // No ctx.setTransform scaling here to avoid vertical distortion

      // Draw background:
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground:
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

      // Draw obstacles:
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

      // Possibly add new obstacle:
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

      drawDino();
      updateDinoJump();

      // Draw score on top left corner, with both current and high score:
      ctx.fillStyle = '#4ade80';
      ctx.font = '22px pixel, Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${scoreRef.current}`, 15, 30);
      ctx.fillText(`High Score: ${highScoreRef.current}`, 15, 55);

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
              Start Game
            </button>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
            >
              Close
            </button>
          </div>
        )}

        {gameOver && (
          <div
            className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center gap-8 px-4"
            style={{ zIndex: 20 }}
          >
            {/* Game Over Text BIG */}
            <h2 className="text-white font-pixel text-6xl select-none mb-2">Game Over</h2>

            {/* No score inside game over box, scores are top-left as requested */}

            <div className="flex gap-6 justify-center w-full max-w-xs">
              <button
                onClick={() => {
                  setGameStarted(true);
                  setGameOver(false);
                  scoreRef.current = 0;
                  setScore(0);
                }}
                className="bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 font-pixel"
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
