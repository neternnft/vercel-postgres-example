import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  score: number;
  username: string;
  created_at: string;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to fetch leaderboard data');
        }
        
        console.log('Received leaderboard data:', data);
        setLeaderboardData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
        setError(errorMessage);
        console.error('Leaderboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
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
            <h2 className="text-2xl font-bold mb-4 text-[#54CA9B]">Leaderboard</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#54CA9B]"></div>
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
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[#54CA9B] font-bold w-6">
                        #{index + 1}
                      </span>
                      <span className="text-white">
                        {entry.username || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-[#54CA9B] font-bold">
                      {entry.score}
                    </span>
                  </div>
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