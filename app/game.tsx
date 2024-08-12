import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sql } from '@vercel/postgres';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    let lastObstaclePosition = -1;
    const minObstacleDistance = canvas.width / 2;

    const drawDino = () => {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      ctx.fillStyle = obstacle.type === 'cactus' ? '#4ade80' : '#ff4500';
      ctx.fillRect(obstacle.x, canvas.height - obstacle.height, obstacle.width, obstacle.height);
    };

    const drawPowerUp = (powerUp: typeof powerUps[0]) => {
      ctx.fillStyle = powerUp.type === 'invincibility' ? '#ffd700' : '#00ffff';
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 10, 0, 2 * Math.PI);
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
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

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
          setHighScore(Math.max(highScore, score));
          saveHighScore(score);
        }

        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(index, 1);
          setScore(score + 1);
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
            // Implement invincibility logic
          } else if (powerUp.type === 'slowMotion') {
            speed *= 0.5;
            setTimeout(() => { speed *= 2; }, 5000);
          }
          powerUps.splice(index, 1);
        }

        if (powerUp.x + 20 < 0) {
          powerUps.splice(index, 1);
        }
      });

      if (obstacles.length === 0 || 
          (canvas.width - obstacles[obstacles.length - 1].x > minObstacleDistance && 
           Math.random() < 0.02)) {
        obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 40,
          type: Math.random() > 0.7 ? 'fire' : 'cactus',
        });
        lastObstaclePosition = canvas.width;
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
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ade80';
        ctx.font = '30px pixel, Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
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
      canvas.width = window.innerWidth;
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
  }, [gameOver, score, highScore]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <canvas ref={canvasRef} className="border border-green-400" />
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
            }}
            className="mt-2 bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel mr-2"
          >
            {gameOver ? 'Play Again' : 'Restart'}
          </button>
          <button
            onClick={onClose}
            className="mt-2 bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Game;
