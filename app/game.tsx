import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (window.innerWidth <= 768) {
        // Mobile
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.5;
      } else {
        // Desktop
        canvas.width = window.innerWidth * 0.7;
        canvas.height = window.innerHeight * 0.7;
      }
    };

    resizeCanvas();

    // Recalculate sizes dynamically based on canvas size
    const isMobile = window.innerWidth <= 768;

    // Player and obstacle size relative to canvas height
    const playerSize = isMobile ? canvas.height * 0.15 : canvas.height * 0.1; // bigger on mobile relatively
    const groundHeight = canvas.height * 0.1; // 10% of canvas height
    const obstacleWidth = playerSize * 0.6;
    const obstacleMinHeight = playerSize * 0.6;
    const obstacleMaxHeight = playerSize * 1.2;

    // Speed relative to canvas width
    const baseSpeed = canvas.width / 160;
    const speed = isMobile ? baseSpeed * 1.8 : baseSpeed * 1.5;

    const dino = {
      x: canvas.width * 0.1,
      y: canvas.height - groundHeight - playerSize,
      width: playerSize,
      height: playerSize,
      jumping: false,
      yVelocity: 0,
      jumpCount: 0,
      landingGracePeriod: 0,
    };

    const obstacles: { x: number; width: number; height: number }[] = [];
    const minObstacleDistance = canvas.width / 2;

    const discoColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF', '#00FFFF', '#FF00FF'];
    let frameCount = 0;
    let animationFrameId: number;

    type Particle = { x: number; y: number; alpha: number; size: number; color: string; life: number };
    const particles: Particle[] = [];

    const drawParticles = () => {
      particles.forEach((p, i) => {
        p.alpha -= 0.03;
        p.y += 0.5;
        p.life--;
        if (p.alpha <= 0 || p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    };

    const createSparkle = () => {
      const color = discoColors[Math.floor(Math.random() * discoColors.length)];
      const size = Math.random() * 1.5 + 0.5;
      particles.push({
        x: dino.x + dino.width / 2 + (Math.random() * 20 - 10),
        y: dino.y + dino.height + 2,
        alpha: 1,
        size,
        color,
        life: 20 + Math.floor(Math.random() * 10),
      });
    };

    const drawDino = () => {
      frameCount++;
      const colorIndex = Math.floor(frameCount / 5) % discoColors.length;
      ctx.fillStyle = discoColors[colorIndex];
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      if (!dino.jumping && dino.landingGracePeriod > 0) {
        createSparkle();
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

      // Draw ground
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

      drawDino();
      drawParticles();
      updateDinoJump();

      if (obstacles.length === 0 || (canvas.width - obstacles[obstacles.length - 1].x) > minObstacleDistance) {
        const obsHeight = obstacleMinHeight + Math.random() * (obstacleMaxHeight - obstacleMinHeight);
        obstacles.push({
          x: canvas.width,
          width: obstacleWidth,
          height: obsHeight,
        });
      }

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
          return;
        }

        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1);
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      ctx.fillStyle = '#4ade80';
      ctx.font = `${Math.floor(canvas.height * 0.04)}px pixel, Arial`;
      ctx.fillText(`Score: ${scoreRef.current}`, 10, canvas.height * 0.06);

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          backgroundColor: 'black',
          borderRadius: '1rem',
          padding: '20px',
          maxWidth: 720,
          width: '100%',
          border: '4px solid #4ade80',
          boxShadow: '0 0 30px #4ade80',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: '1rem',
            display: 'block',
            margin: '0 auto 20px',
            width: '100%',
            maxHeight: '70vh',
            backgroundColor: 'black',
            userSelect: 'none',
          }}
        />
        {!gameStarted && (
          <motion.button
            onClick={() => {
              setGameOver(false);
              scoreRef.current = 0;
              setScore(0);
              setGameStarted(true);
            }}
            style={{
              backgroundColor: '#54CA9B',
              color: 'black',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1.25rem',
              marginBottom: 10,
            }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </motion.button>
        )}
        {gameOver && (
          <div style={{ textAlign: 'center', color: 'white', marginTop: 10 }}>
            <p>Game Over! Your score: {score}</p>
            <p>High Score: {highScore}</p>
          </div>
        )}
        <motion.button
          onClick={onClose}
          style={{
            backgroundColor: '#54CA9B',
            color: 'black',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1.25rem',
          }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Game;
