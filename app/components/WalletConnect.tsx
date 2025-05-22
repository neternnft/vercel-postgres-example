'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

export default function WalletConnect() {
  return (
    <motion.div
      className="fixed top-4 right-4 z-20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ConnectButton />
    </motion.div>
  );
} 