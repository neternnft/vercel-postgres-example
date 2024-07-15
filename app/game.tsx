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
    let playerY = canvas.height / 2;
    let velocity = 0;
    const gravity = 0.2;
    const jumpStrength = -10;
    const obstacles: { x: number; y: number; width: number; height: number }[] = [];

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player (DO token)
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(50, playerY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Update player position
      velocity += gravity;
      playerY += velocity;

      // Generate and draw obstacles
      if (Math.random() < 0.01) {
        let height;
        if (Math.random() < 0.5) {
          // Low obstacle
          height = 100;
        } else {
          // High obstacle
          height = Math.random() * (canvas.height - 200) + 150;
        }
        obstacles.push({ x: canvas.width, y: canvas.height - height, width: 50, height });
      }

      obstacles.forEach((obstacle, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.x -= 1;

        // Collision detection
        if (
          50 + 20 > obstacle.x &&
          50 - 20 < obstacle.x + obstacle.width &&
          playerY + 20 > obstacle.y &&
          playerY - 20 < obstacle.y + obstacle.height
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
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

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

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
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
        <canvas ref={canvasRef} width={400} height={600} className="border border-black" />
        {gameOver && (
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p>Your score: {score}</p>
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
        )}
      </div>
    </motion.div>
  );
};

export default Game;






