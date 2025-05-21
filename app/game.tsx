import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sql } from '@vercel/postgres';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);

  useEffect(() => {
    if (!gameStarted || gameOver) return; // don't run game loop if not started or game over

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 0.85; // Zoom out scale factor (adjust if needed)

    const dino = {
      x: 50,
      y: canvas.height - 60,
      width: 40,
      height: 60,
      jumping: false,
      jumpHeight: 100,
      yVelocity: 0,
      landingGracePeriod: 0,
      jumpCount: 0,
    };

    const obstacles: { x: number; width: number; height: number; type: string }[] = [];
    const powerUps: { x: number; y: number; type: string }[] = [];
    let speed = canvas.width / 160;
    let animationFrameId: number;
    const minObstacleDistance = canvas.width / 2;

    // ======= Disco colors setup for player cube =======
    const colorChangeSpeed = 5; // frames per color change (lower = faster)
    const discoColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF', '#00FFFF', '#FF00FF'];
    let frameCount = 0;

    const drawDino = () => {
      frameCount++;
      const colorIndex = Math.floor(frameCount / colorChangeSpeed) % discoColors.length;
      ctx.fillStyle = discoColors[colorIndex];
      ctx.fillRect(dino.x, dino.y / scale, dino.width, dino.height);
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      ctx.fillStyle = obstacle.type === 'cactus' ? '#4ade80' : '#ff4500';
      ctx.fillRect(obstacle.x, (canvas.height - obstacle.height) / scale, obstacle.width, obstacle.height);
    };

    const drawPowerUp = (powerUp: typeof powerUps[0]) => {
      ctx.fillStyle = powerUp.type === 'invincibility' ? '#ffd700' : '#00ffff';
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y / scale, 10, 0, 2 * Math.PI);
      ctx.fill();
    };

    const updateDinoJump = () => {
      if (dino.jumping) {
        dino.yVelocity += 0.7;
        dino.y += dino.yVelocity;

        if (dino.y > canvas.height - dino.height) {
          dino.y = canvas.height - dino.height;
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
      // Reset transform and clear canvas scaled correctly
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply scaling transform for zoom out effect
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      // Draw background and ground (adjust for scale)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, (canvas.height - 20) / scale, canvas.width / scale, 20 / scale);

      drawDino();
      updateDinoJump();

      obstacles.forEach((obstacle, index) => {
        obstacle.x -= speed;
        drawObstacle(obstacle);

        if (
          dino.landingGracePeriod === 0 &&
          dino.x < obstacle.x + obstacle.width &&
          dino.x + dino.width * 0.8 > obstacle.x &&
          dino.y + dino.height * 0.9 > canvas.height - obstacle.height
        ) {
          setGameOver(true);
          setGameStarted(false);
          scoreRef.current = scoreRef.current; // hold final score
          highScoreRef.current = Math.max(highScoreRef.current, scoreRef.current);
          setScore(scoreRef.current);
          setHighScore(highScoreRef.current);
          saveHighScore(scoreRef.current);
          return; // stop further processing in this frame
        }

        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(index, 1);
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      });

      powerUps.forEach((powerUp, index) => {
        powerUp.x -= speed;
        drawPowerUp(powerUp);

        if (
          dino.x < powerUp.x + 20 &&
          dino.x + dino.width > powerUp.x &&
          dino.y < powerUp.y + 20 &&
          dino.y + dino.height > powerUp.y
        ) {
          if (powerUp.type === 'invincibility') {
            // Implement invincibility logic here
          } else if (powerUp.type === 'slowMotion') {
            speed *= 0.5;
            setTimeout(() => {
              speed *= 2;
            }, 5000);
          }
          powerUps.splice(index, 1);
        }

        if (powerUp.x + 20 < 0) {
          powerUps.splice(index, 1);
        }
      });

      if (
        obstacles.length === 0 ||
        (canvas.width - obstacles[obstacles.length - 1].x > minObstacleDistance &&
          Math.random() < 0.02)
      ) {
        obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 40,
          type: Math.random() > 0.7 ? 'fire' : 'cactus',
        });
      }

      if (Math.random() < 0.005) {
        powerUps.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 100) + 50,
          type: Math.random() > 0.5 ? 'invincibility' : 'slowMotion',
        });
      }

      ctx.fillStyle = '#4ade80';
      ctx.font = '20px pixel, Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      } else {
        // Reset transform before drawing overlay (full canvas size)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#4ade80';
        ctx.font = '50px pixel, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && dino.jumpCount < 2) {
        dino.jumping = true;
        dino.yVelocity = -14;
        dino.jumpCount++;
      }
    };

    const handleTouch = () => {
      if (dino.jumpCount < 2) {
        dino.jumping = true;
        dino.yVelocity = -14;
        dino.jumpCount++;
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.6;
      dino.y = canvas.height - dino.height;
      speed = canvas.width / 160;
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
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

        {/* Start menu overlay */}
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

        {/* Game Over overlay and buttons */}
        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70"
            style={{ zIndex: 10 }}
          >
            <h1
              className="text-green-400 font-pixel text-6xl mb-10 select-none"
              style={{ userSelect: 'none' }}
            >
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
