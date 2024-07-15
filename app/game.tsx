import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let playerY: number;
    let velocity = 0;
    const gravity = 0.2;
    const jumpStrength = -10;
    const obstacles: { x: number; y: number; width: number; height: number }[] = [];

    const calculateCanvasSize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const size = Math.min(windowWidth * 0.9, windowHeight * 0.9);
      return { width: size, height: size };
    };

    const resizeCanvas = () => {
      const { width, height } = calculateCanvasSize();
      canvas.width = width;
      canvas.height = height;
      playerY = height / 2;
    };

    resizeCanvas();

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const playerRadius = canvas.width * 0.05;

      // Draw player (DO token)
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.1, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update player position
      velocity += gravity;
      playerY += velocity;

      // Generate and draw obstacles
      if (Math.random() < 0.01) {
        let height;
        if (Math.random() < 0.5) {
          // Low obstacle
          height = canvas.height * 0.2;
        } else {
          // High obstacle
          height = Math.random() * (canvas.height * 0.6) + canvas.height * 0.2;
        }
        obstacles.push({ x: canvas.width, y: canvas.height - height, width: canvas.width * 0.1, height });
      }

      obstacles.forEach((obstacle, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.x -= canvas.width * 0.002;

        // Collision detection
        if (
          canvas.width * 0.1 + playerRadius > obstacle.x &&
          canvas.width * 0.1 - playerRadius < obstacle.x + obstacle.width &&
          playerY + playerRadius > obstacle.y &&
          playerY - playerRadius < obstacle.y + obstacle.height
        ) {
          setGameOver(true);
        }

        // Remove off-screen obstacles and increase score
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(index, 1);
          setScore(prevScore => prevScore + 1);
        }
      });

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = `${canvas.width * 0.05}px Arial`;
      ctx.fillText(`Score: ${score}`, canvas.width * 0.02, canvas.height * 0.05);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const handleJump = () => {
      velocity = jumpStrength;
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };

    const handleMouseClick = () => {
      handleJump();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleJump();
    };

    window.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('resize', resizeCanvas);

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, score]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div className="bg-green-400 p-6 rounded-lg shadow-lg">
        <canvas ref={canvasRef} className="border border-black" />
        <div className="mt-4 text-center">
          {gameOver && (
            <>
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <p>Your score: {score}</p>
            </>
          )}
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
            }}
            className="mt-2 bg-black text-white px-4 py-2 rounded mr-2"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="mt-2 bg-black text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Game;







