import { useState, useRef, useCallback, useEffect } from 'react';
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

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('glurbnokHighScore');
    if (savedHighScore) {
      const parsedHighScore = parseInt(savedHighScore, 10);
      setGameState(prev => ({ ...prev, highScore: parsedHighScore }));
      highScoreRef.current = parsedHighScore;
    }
  }, []);

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
    
    // Save new high score to localStorage if it's higher
    if (newHighScore > highScoreRef.current) {
      localStorage.setItem('glurbnokHighScore', newHighScore.toString());
    }
    
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