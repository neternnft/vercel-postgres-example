import { useState, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useUserProfile } from '../components/UserProfile';
import { saveScore } from '../lib/firebase';

interface GameState {
  gameOver: boolean;
  gameStarted: boolean;
  score: number;
}

export const useGameState = () => {
  const { address } = useAccount();
  const { profileData } = useUserProfile();
  const [gameState, setGameState] = useState<GameState>({
    gameOver: false,
    gameStarted: false,
    score: 0,
  });

  const scoreRef = useRef(0);

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
    
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gameStarted: false,
      score: finalScore,
    }));
    
    try {
      // Only save score if wallet is connected and username is set
      if (address && profileData.username) {
        console.log('Saving score:', finalScore);
        
        const saved = await saveScore(
          profileData.username,
          finalScore,
          address
        );

        if (saved) {
          console.log('Score saved successfully');
        } else {
          console.log('Failed to save score');
        }
      } else if (address && !profileData.username) {
        console.log('Score not saved: Wallet connected but username not set');
      } else {
        console.log('Score not saved: Wallet not connected');
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }, [address, profileData.username]);

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
    startGame,
    endGame,
    updateScore,
  };
}; 