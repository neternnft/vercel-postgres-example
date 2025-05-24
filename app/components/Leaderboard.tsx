import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDatabase, ref, query, orderByChild, limitToLast, onValue, off, get } from 'firebase/database';

interface LeaderboardEntry {
  score: number;
  username: string;
  walletAddress: string;
  timestamp: number;
}

interface UserProfile {
  username: string;
  walletAddress: string;
  arenaUsername?: string;
  pfpUrl?: string;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add helper function to create Arena profile URL
const getArenaProfileUrl = (username: string) => `https://arena.social/${username}`;

// Add helper function to truncate wallet address
const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Add helper function to format username display
const formatUsername = (profile: UserProfile) => {
  // If no username is set, display truncated wallet address
  if (!profile.username || profile.username === profile.walletAddress) {
    return <span className="text-gray-400 font-mono">{truncateAddress(profile.walletAddress)}</span>;
  }

  if (profile.arenaUsername) {
    return (
      <a
        href={getArenaProfileUrl(profile.arenaUsername)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-[#54CA9B] transition-colors"
      >
        {profile.username}
      </a>
    );
  }
  return <span className="text-white">{profile.username}</span>;
};

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (!isOpen) return;

    let unsubscribe: (() => void) | undefined;

    async function fetchData() {
      console.log('Starting leaderboard data fetch...');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Initializing database connection...');
        const db = getDatabase();
        console.log('Database connection initialized');

        // First, fetch all user profiles
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        const profiles: Record<string, UserProfile> = {};
        
        if (usersSnapshot.exists()) {
          usersSnapshot.forEach((childSnapshot) => {
            const walletAddress = childSnapshot.key;
            const userData = childSnapshot.val();
            if (walletAddress && userData.username) {
              profiles[walletAddress] = {
                username: userData.username,
                walletAddress,
                arenaUsername: userData.arenaUsername || '',
                pfpUrl: userData.pfpUrl || ''
              };
            }
          });
        }
        setUserProfiles(profiles);
        console.log('Loaded user profiles:', profiles);

        const scoresRef = ref(db, 'scores');
        const topScoresQuery = query(
          scoresRef,
          orderByChild('score'),
          limitToLast(20) // Get more to handle duplicates
        );

        // Set up real-time listener for scores
        unsubscribe = onValue(topScoresQuery, (snapshot) => {
          console.log('Received real-time update');
          try {
            const scores: LeaderboardEntry[] = [];
            const walletHighScores: Record<string, LeaderboardEntry> = {};

            // Process all scores and keep only the highest score per wallet
            snapshot.forEach((childSnapshot) => {
              const score = childSnapshot.val();
              console.log('Processing score:', score);
              
              // Use current username from profiles if available
              const currentProfile = profiles[score.walletAddress];
              const entry = {
                ...score,
                username: currentProfile ? currentProfile.username : score.username
              };

              // Only keep the highest score for each wallet
              if (!walletHighScores[score.walletAddress] || 
                  walletHighScores[score.walletAddress].score < score.score) {
                walletHighScores[score.walletAddress] = entry;
                console.log('Updated high score for wallet:', {
                  wallet: score.walletAddress,
                  score: score.score,
                  username: entry.username
                });
              }
            });

            // Convert to array and sort
            const uniqueScores = Object.values(walletHighScores);
            uniqueScores.sort((a, b) => b.score - a.score);
            console.log('Final sorted scores:', uniqueScores);

            // Take only top 5
            setLeaderboardData(uniqueScores.slice(0, 5));
            setIsLoading(false);
          } catch (err) {
            console.error('Error processing score data:', err);
            setError('Error processing leaderboard data');
            setIsLoading(false);
          }
        }, (error) => {
          console.error('Firebase subscription error:', error);
          setError('Failed to load leaderboard data');
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Error in leaderboard setup:', err);
        setError('Failed to set up leaderboard');
        setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      console.log('Cleaning up leaderboard...');
      if (unsubscribe) {
        console.log('Unsubscribing from Firebase updates');
        unsubscribe();
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1A1A1A] p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#54CA9B]">Leaderboard</h2>
                <p className="text-sm text-gray-400 mt-1">Top 5 Players</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#54CA9B] mb-4"></div>
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">
                <p>Error loading leaderboard:</p>
                <p className="mt-2 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-[#54CA9B] text-black rounded hover:bg-[#3DA77B] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardData.map((entry, index) => (
                  <motion.div
                    key={`${entry.walletAddress}-${entry.score}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between bg-[#2A2A2A] p-3 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[#54CA9B] font-bold">{index + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[#54CA9B] flex items-center justify-center text-black overflow-hidden">
                        {userProfiles[entry.walletAddress]?.pfpUrl ? (
                          <img 
                            src={userProfiles[entry.walletAddress].pfpUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{entry.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      {formatUsername({
                        username: entry.username,
                        walletAddress: entry.walletAddress,
                        arenaUsername: userProfiles[entry.walletAddress]?.arenaUsername
                      })}
                    </div>
                    <span className="text-white">{entry.score}</span>
                  </motion.div>
                ))}
                
                {leaderboardData.length === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No scores yet. Be the first to play!
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#54CA9B] text-black hover:bg-[#3DA77B] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 