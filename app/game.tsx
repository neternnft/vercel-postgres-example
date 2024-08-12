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
      jumpHeight: 100,
    };

    const obstacles: { x: number; width: number; height: number }[] = [];
    let speed = 5;
    let animationFrameId: number;

    const drawDino = () => {
      ctx.fillStyle = '#535353';
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      ctx.fillStyle = '#535353';
      ctx.fillRect(obstacle.x, canvas.height - obstacle.height, obstacle.width, obstacle.height);
    };

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#535353';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      drawDino();

      // Update and draw obstacles
      obstacles.forEach((obstacle, index) => {
        obstacle.x -= speed;
        drawObstacle(obstacle);

        // Check collision
        if (
          dino.x < obstacle.x + obstacle.width &&
          dino.x + dino.width > obstacle.x &&
          dino.y + dino.height > canvas.height - obstacle.height
        ) {
          setGameOver(true);
          setHighScore(Math.max(highScore, score));
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(index, 1);
          setScore(score + 1);
        }
      });

      // Spawn new obstacles
      if (Math.random() < 0.02) {
        obstacles.push({
          x: canvas.width,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 40,
        });
      }

      // Update dino jump
      if (dino.jumping) {
        dino.y = Math.max(canvas.height - dino.height - dino.jumpHeight, dino.y - 5);
        if (dino.y === canvas.height - dino.height - dino.jumpHeight) {
          dino.jumping = false;
        }
      } else if (dino.y < canvas.height - dino.height) {
        dino.y = Math.min(canvas.height - dino.height, dino.y + 5);
      }

      // Draw score
      ctx.fillStyle = '#535353';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !dino.jumping && dino.y === canvas.height - dino.height) {
        dino.jumping = true;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, score, highScore]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <canvas ref={canvasRef} width={800} height={300} className="border border-gray-300" />
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
            }}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            {gameOver ? 'Play Again' : 'Restart'}
          </button>
          <button
            onClick={onClose}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Game;
