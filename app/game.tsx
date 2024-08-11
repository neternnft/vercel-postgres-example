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
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let playerY: number;
    let velocity = 0;
    const gravity = 0.5;
    const jumpStrength = -10;
    const obstacles: { x: number; y: number; width: number; height: number; type: string }[] = [];
    let speed = 2;
    const maxSpeed = 5;
    const speedIncrease = 0.0002;
    let powerUpActive = false;
    let powerUpTimer = 0;
    let currentScore = 0;
    let currentFrameCount = 0;

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

    const drawPlayer = () => {
      const playerSize = canvas.width * 0.08;
      ctx.fillStyle = powerUpActive ? '#FFD700' : '#00BFFF';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.2, playerY, playerSize / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawObstacle = (obstacle: typeof obstacles[0]) => {
      ctx.fillStyle = obstacle.type === 'standard' ? '#2ecc71' : '#e74c3c';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${canvas.width * 0.04}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LEADERBOARD', canvas.width / 2, canvas.height * 0.1);

        const topScores = leaderboard.slice(0, 10);
        topScores.forEach((entry, index) => {
          ctx.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, canvas.height * (0.2 + index * 0.07));
        });
      } else if (paused || !gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${canvas.width * 0.05}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (paused) {
          ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        } else if (!gameStarted) {
          ctx.fillText('CLICK START', canvas.width / 2, canvas.height / 2);
        }
      } else {
        drawPlayer();

        if (powerUpActive) {
          powerUpTimer--;
          if (powerUpTimer <= 0) {
            powerUpActive = false;
          }
        }

        velocity += gravity;
        playerY += velocity;

        playerY = Math.max(canvas.height * 0.08, Math.min(canvas.height - canvas.height * 0.08, playerY));

        speed = Math.min(speed + speedIncrease, maxSpeed);

        if (Math.random() < 0.02) {
          const gapHeight = canvas.height * 0.3;
          const gapY = Math.random() * (canvas.height - gapHeight);
          const obstacleType = Math.random() < 0.8 ? 'standard' : 'dangerous';
          obstacles.push(
            { x: canvas.width, y: 0, width: canvas.width * 0.1, height: gapY, type: obstacleType },
            { x: canvas.width, y: gapY + gapHeight, width: canvas.width * 0.1, height: canvas.height - gapY - gapHeight, type: obstacleType }
          );
        }

        obstacles.forEach((obstacle, index) => {
          drawObstacle(obstacle);
          obstacle.x -= canvas.width * 0.005 * speed;

          if (
            !powerUpActive &&
            canvas.width * 0.2 + canvas.width * 0.04 > obstacle.x &&
            canvas.width * 0.2 - canvas.width * 0.04 < obstacle.x + obstacle.width &&
            playerY + canvas.width * 0.04 > obstacle.y &&
            playerY - canvas.width * 0.04 < obstacle.y + obstacle.height
          ) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameOver(true);
                setHighScore(prevHighScore => Math.max(prevHighScore, currentScore));
                setLeaderboard(prevLeaderboard => {
                  const existingEntry = prevLeaderboard.find(entry => entry.score === currentScore);
                  let newLeaderboard;
                  if (existingEntry) {
                    newLeaderboard = prevLeaderboard.map(entry =>
                      entry.score === currentScore ? { ...entry, name: 'Player' } : entry
                    );
                  } else {
                    newLeaderboard = [...prevLeaderboard, { name: 'Player', score: currentScore }];
                  }
                  return newLeaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
                });
              }
              return newLives;
            });
            obstacles.splice(index, 1);
          }

          if (obstacle.x + obstacle.width < canvas.width * 0.2) {
            currentScore += 1;
            obstacles.splice(index, 1);
          }
        });

        currentFrameCount++;
        if (currentFrameCount % 60 === 0) {
          currentScore++;
          setScore(currentScore);
        }

        ctx.fillStyle = '#2ecc71';
        ctx.font = `${canvas.width * 0.05}px Arial`;
        ctx.fillText(`Score: ${currentScore}`, canvas.width * 0.02, canvas.height * 0.05);
        ctx.fillText(`Lives: ${lives}`, canvas.width * 0.02, canvas.height * 0.1);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleJump = () => {
      if (!gameOver && gameStarted && !paused) {
        velocity = jumpStrength;
        if (Math.random() < 0.1) {
          powerUpActive = true;
          powerUpTimer = 100;
        }
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump();
      } else if (e.code === 'KeyP' && !gameOver) {
        setPaused(prev => !prev);
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
  }, [gameOver, lives, paused, gameStarted, leaderboard]);

  const handleStartPause = () => {
    if (!gameStarted) {
      setGameStarted(true);
    } else {
      setPaused(prev => !prev);
    }
  };

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
              <h2 className="text-2xl font-bold font-pixel">Game Over!</h2>
              <p className="font-pixel">Your score: {score}</p>
              <p className="font-pixel">High score: {highScore}</p>
            </>
          )}
          <button
            onClick={() => {
              setGameOver(false);
              setScore(0);
              setLives(3);
              setPaused(false);
              setGameStarted(false);
            }}
            className="mt-2 bg-black text-white px-4 py-2 rounded mr-2 font-pixel"
          >
            {gameOver ? 'Play Again' : 'Restart'}
          </button>
          {!gameOver && (
            <button
              onClick={handleStartPause}
              className="mt-2 bg-black text-white px-4 py-2 rounded mr-2 font-pixel"
            >
              {!gameStarted ? 'Start' : (paused ? 'Resume' : 'Pause')}
            </button>
          )}
          <button
            onClick={onClose}
            className="mt-2 bg-black text-white px-4 py-2 rounded font-pixel"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Game;
