import { motion } from 'framer-motion';

interface GameProps {
  onClose: () => void;
}

const Game: React.FC<GameProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div className="bg-green-400 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Loading ...</h2>
        <p>We are building meme</p>
        <button
          onClick={onClose}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default Game;

