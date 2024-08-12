import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
      yVelocity: 0,
    };

    const obstaclePool: { x: number; width: number; height: number; active: boolean }[] = Array(10).fill(null).map(() => ({ x: 0, width: 0, height: 0, active: false }));
    let speed = canvas.width / 160;
    let lastTime = 0;
    const fixedTimeStep = 1000 / 60;
    let accumulator = 0;

    const drawDino = () => {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    };

    const drawObstacle = (obstacle: typeof obstaclePool[0]) => {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(obstacle.x, canvas.height - obstacle.height, obstacle.width, obstacle.height);
    };

    const updateDinoJump = (deltaTime: number) => {
      if (dino.jumping) {
        dino.yVelocity += 0.0015 * deltaTime;
        dino.y += dino.yVelocity * deltaTime;

        if (dino.y > canvas.height - dino.height) {
          dino.y = canvas.height - dino.height;
          dino.jumping = false;
          dino.yVelocity = 0;
        }
      }
    };

    const checkCollision = (dino: typeof dino, obstacle: typeof obstaclePool[0]) => {
      return dino.x < obstacle.x + obstacle.width &&
             dino.x + dino.width > obstacle.x &&
             dino.y + dino.height > canvas.height - obstacle.height;
    };

    const updateGame = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += deltaTime;

      while (accumulator >= fixedTimeStep) {
        updateDinoJump(fixedTimeStep);

        obstaclePool.forEach(obstacle => {
          if (obstacle.active) {
            obstacle.x -= speed * (fixedTimeStep / 1000);

            if (checkCollision(dino, obstacle)) {
              setGameOver(true);
              setHighScore(Math.max(highScore, score));
            }

            if (obstacle.x + obstacle.width < 0) {
              obstacle.active = false;
              setScore(prevScore => prevScore + 1);
            }
          }
        });

        if (Math.random() < 0.02 && obstaclePool.some(o => !o.active)) {
          const obstacle = obstaclePool.find(o => !o.active);
          if (obstacle) {
            obstacle.x = canvas.width;
            obstacle.width = 20 + Math.random() * 30;
            obstacle.height = 40 + Math.random() * 40;
            obstacle.active = true;
          }
        }

        accumulator -= fixedTimeStep;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      drawDino();

      obstaclePool.forEach(obstacle => {
        if (obstacle.active) {
          drawObstacle(obstacle);
        }
      });

      ctx.fillStyle = '#4ade80';
      ctx.font = '20px pixel, Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (!gameOver) {
        requestAnimationFrame(updateGame);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ade80';
        ctx.font = '30px pixel, Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !dino.jumping && dino.y === canvas.height - dino.height) {
        dino.jumping = true;
        dino.yVelocity = -0.7;
      }
    };

    const handleTouch = () => {
      if (!dino.jumping && dino.y === canvas.height - dino.height) {
        dino.jumping = true;
        dino.yVelocity = -0.7;
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
    requestAnimationFrame(updateGame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameOver, score, highScore]);

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
