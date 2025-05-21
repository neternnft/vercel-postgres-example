import { useState, useRef, useCallback } from 'react';
import { sql } from '@vercel/postgres';

interface GameState {
  gameOver: boolean;
  gameStarted: boolean;
  score: number;
  highScore: number;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    gameOver: false,
    gameStarted: false,
    score: 0,
    highScore: 0,
  });

  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      score: 0,
    }));
    scoreRef.current = 0;
  }, []);

  const endGame = useCallback(async () => {
    const finalScore = scoreRef.current;
    const newHighScore = Math.max(highScoreRef.current, finalScore);
    
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gameStarted: false,
      score: finalScore,
      highScore: newHighScore,
    }));
    
    highScoreRef.current = newHighScore;
    
    try {
      await sql`INSERT INTO high_scores (score) VALUES (${finalScore})`;
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  }, []);

  const updateScore = useCallback(() => {
    scoreRef.current += 1;
    // Only update the state occasionally to prevent excessive re-renders
    if (scoreRef.current % 5 === 0) {
      setGameState(prev => ({
        ...prev,
        score: scoreRef.current,
      }));
    }
  }, []);

  return {
    gameState,
    scoreRef,
    highScoreRef,
    startGame,
    endGame,
    updateScore,
  };
}; 