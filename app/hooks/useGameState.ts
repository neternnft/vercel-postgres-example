import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUserProfile } from '../components/UserProfile';
import { saveScore } from '../lib/firebase';

interface GameState {
  gameOver: boolean;
  gameStarted: boolean;
  score: number;
  personalBest: number;
}

export const useGameState = () => {
  const { address } = useAccount();
  const { profileData } = useUserProfile();
  const [gameState, setGameState] = useState<GameState>({
    gameOver: false,
    gameStarted: false,
    score: 0,
    personalBest: 0
  });

  const scoreRef = useRef(0);

  // Load personal best from localStorage when component mounts
  useEffect(() => {
    const storedBest = localStorage.getItem('personalBest');
    if (storedBest) {
      setGameState(prev => ({
        ...prev,
        personalBest: parseInt(storedBest, 10)
      }));
    }
  }, []);

  const startGame = useCallback(() => {
    // Record game start time for anti-cheat
    localStorage.setItem('gameStartTime', Date.now().toString());
    
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
    console.log('Game ended with score:', finalScore);
    console.log('Current wallet address:', address);
    console.log('Current profile data:', profileData);
    
    // Update personal best if necessary
    const newPersonalBest = Math.max(finalScore, gameState.personalBest);
    if (newPersonalBest > gameState.personalBest) {
      localStorage.setItem('personalBest', newPersonalBest.toString());
    }

    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gameStarted: false,
      score: finalScore,
      personalBest: newPersonalBest
    }));
    
    try {
      // Only save score if wallet is connected and username is set
      if (address && profileData.username) {
        console.log('Attempting to save score:', {
          username: profileData.username,
          score: finalScore,
          address
        });
        
        const saved = await saveScore(
          profileData.username,
          finalScore,
          address
        );

        if (saved) {
          console.log('Score saved successfully to Firebase');
        } else {
          console.log('Failed to save score - saveScore returned false');
        }
      } else {
        console.log('Score not saved:', {
          hasAddress: !!address,
          hasUsername: !!profileData.username
        });
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }, [address, profileData.username, gameState.personalBest]);

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