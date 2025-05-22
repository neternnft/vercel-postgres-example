import { useState, useRef, useCallback } from 'react';
import { sql } from '@vercel/postgres';
import { useAccount } from 'wagmi';
import { useUserProfile } from '../components/UserProfile';

interface GameState {
  gameOver: boolean;
  gameStarted: boolean;
  score: number;
  highScore: number;
}

export const useGameState = () => {
  const { address } = useAccount();
  const { profileData } = useUserProfile();
  const [gameState, setGameState] = useState<GameState>({
    gameOver: false,
    gameStarted: false,
    score: 0,
    highScore: 0,
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
        console.log('Checking if score qualifies for top 10:', finalScore);

        // First, get the current lowest score in top 10
        const { rows: lowestScore } = await sql`
          SELECT MIN(score) as min_score 
          FROM (
            SELECT score 
            FROM high_scores 
            ORDER BY score DESC 
            LIMIT 10
          ) as top_10
        `;

        const minTopScore = lowestScore[0]?.min_score || 0;
        console.log('Current lowest top 10 score:', minTopScore);

        // Only proceed if this score is higher than the lowest top 10 score
        // or if there are less than 10 scores
        const { rows: scoreCount } = await sql`
          SELECT COUNT(*) as count FROM high_scores
        `;

        if (finalScore > minTopScore || scoreCount[0].count < 10) {
          console.log('Score qualifies for top 10!');

          // Get or create user
          let userId;
          const { rows: userRows } = await sql`
            SELECT id FROM users WHERE wallet_address = ${address}
          `;

          if (userRows.length > 0) {
            userId = userRows[0].id;
          } else {
            const { rows: newUser } = await sql`
              INSERT INTO users (username, wallet_address)
              VALUES (${profileData.username}, ${address})
              RETURNING id
            `;
            userId = newUser[0].id;
          }

          // Insert the new score
          await sql`
            INSERT INTO high_scores (score, user_id)
            VALUES (${finalScore}, ${userId})
          `;

          // Keep only top 10 scores
          await sql`
            WITH RankedScores AS (
              SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as rn
              FROM high_scores
            )
            DELETE FROM high_scores
            WHERE id IN (
              SELECT id FROM RankedScores WHERE rn > 10
            )
          `;

          console.log('Score saved and leaderboard updated');
        } else {
          console.log('Score did not qualify for top 10');
        }
      } else if (address && !profileData.username) {
        console.log('Score not saved: Wallet connected but username not set');
      } else {
        console.log('Score not saved: Wallet not connected');
      }
    } catch (error) {
      console.error('Failed to save high score:', error);
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