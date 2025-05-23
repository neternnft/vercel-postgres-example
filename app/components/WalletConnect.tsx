'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserProfileModal, { useUserProfile } from './UserProfile';

export default function WalletConnect() {
  const { isConnected } = useAccount();
  const { profileData } = useUserProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on server-side
  if (!isMounted) {
    return null;
  }
  
  return (
    <>
      <div className="flex flex-col items-end">
        <div>
          <ConnectButton label="Wallet" />
        </div>
        {isConnected && (
          <div 
            className="mt-2 flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity self-start"
            onClick={() => setIsProfileOpen(true)}
          >
            {/* Profile picture or initial */}
            <div className="w-8 h-8 rounded-full bg-[#54CA9B] flex items-center justify-center text-black">
              {profileData.username ? profileData.username[0].toUpperCase() : '?'}
            </div>
            
            {/* Username display */}
            <span className="text-[#54CA9B] text-sm flex items-center">
              {profileData.username}
              {profileData.arenaUsername && (
                <svg 
                  className="ml-1 w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M7 7h10v10M7 17L17 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Render modal in a portal */}
      {isMounted && isProfileOpen && createPortal(
        <UserProfileModal 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />,
        document.body
      )}
    </>
  );
} 