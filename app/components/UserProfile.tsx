'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileData {
  username: string;
  pfpUrl?: string;
}

// Global username registry
const USERNAMES_KEY = 'glurbnok_usernames_registry';

function useUsernameRegistry() {
  // Get all registered usernames
  const getAllUsernames = () => {
    try {
      const data = localStorage.getItem(USERNAMES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading username registry:', e);
      return {};
    }
  };

  // Check if username is taken
  const isUsernameTaken = (username: string, currentAddress: string): boolean => {
    const registry = getAllUsernames();
    const normalizedUsername = username.toLowerCase().trim();
    
    // Check each address's username
    for (const [addr, data] of Object.entries(registry)) {
      if (addr !== currentAddress) {
        const existingUsername = (data as any).username.toLowerCase().trim();
        if (existingUsername === normalizedUsername) {
          return true;
        }
      }
    }
    return false;
  };

  // Register a username
  const registerUsername = (username: string, address: string) => {
    try {
      const registry = getAllUsernames();
      registry[address] = {
        username: username.trim(),
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem(USERNAMES_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error('Error registering username:', e);
      throw new Error('Failed to register username');
    }
  };

  return { isUsernameTaken, registerUsername, getAllUsernames };
}

export function useUserProfile() {
  const { address } = useAccount();
  const [profileData, setProfileData] = useState<UserProfileData>({
    username: '',
    pfpUrl: undefined
  });
  const [isMounted, setIsMounted] = useState(false);
  const { isUsernameTaken, registerUsername } = useUsernameRegistry();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load profile data when component mounts
  useEffect(() => {
    if (isMounted && address) {
      // Load from username registry first
      const registry = JSON.parse(localStorage.getItem(USERNAMES_KEY) || '{}');
      const registeredData = registry[address];
      
      if (registeredData) {
        setProfileData(prev => ({
          ...prev,
          username: registeredData.username
        }));
      } else {
        // Fallback to old storage method
        const savedProfile = localStorage.getItem(`profile-${address}`);
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setProfileData(data);
          // Migrate to new registry
          if (data.username) {
            registerUsername(data.username, address);
          }
        }
      }
    }
  }, [address, isMounted, registerUsername]);

  // Save profile data
  const updateProfile = (newData: Partial<UserProfileData>) => {
    if (!address || !isMounted) return;
    
    if (newData.username) {
      const trimmedUsername = newData.username.trim();
      
      // Check if username is taken
      if (isUsernameTaken(trimmedUsername, address)) {
        throw new Error('This username is already taken by another player');
      }

      // Register in the global registry
      registerUsername(trimmedUsername, address);
      newData.username = trimmedUsername;
    }

    const updatedData = { ...profileData, ...newData };
    setProfileData(updatedData);
    localStorage.setItem(`profile-${address}`, JSON.stringify(updatedData));
  };

  return { profileData, updateProfile, isMounted };
}

export default function UserProfileModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { profileData, updateProfile, isMounted } = useUserProfile();
  const [tempUsername, setTempUsername] = useState('');
  const [error, setError] = useState<string>('');
  const { address } = useAccount();
  const { isUsernameTaken } = useUsernameRegistry();

  useEffect(() => {
    if (isMounted) {
      setTempUsername(profileData.username || '');
      setError('');
    }
  }, [profileData.username, isMounted]);

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
      return 'Username cannot be empty';
    }
    
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (username.trim().length > 20) {
      return 'Username must be less than 20 characters';
    }

    if (!address) {
      return 'Please connect your wallet first';
    }

    // Check for unique username
    if (isUsernameTaken(username, address)) {
      return 'This username is already taken by another player';
    }

    return null;
  };

  const handleSave = () => {
    if (!isMounted || !address) return;
    
    try {
      // Validate username
      const validationError = validateUsername(tempUsername);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Try to update profile
      updateProfile({ username: tempUsername });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while saving');
      }
    }
  };

  // Validate on input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setTempUsername(newUsername);
    
    // Only show errors if the user has typed something
    if (newUsername.trim()) {
      const validationError = validateUsername(newUsername);
      setError(validationError || '');
    } else {
      setError('');
    }
  };

  if (!isMounted) return null;

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
            <h2 className="text-2xl font-bold mb-4 text-[#54CA9B]">Edit Profile</h2>
            
            {/* Username Input */}
            <div className="mb-4">
              <label className="block text-[#54CA9B] text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={tempUsername}
                onChange={handleUsernameChange}
                className="w-full px-3 py-2 bg-[#2A2A2A] rounded border border-[#54CA9B] text-white focus:outline-none focus:ring-2 focus:ring-[#54CA9B]"
                placeholder="Enter username (3-20 characters)"
                maxLength={20}
              />
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
            </div>

            {/* Profile Picture - Coming Soon */}
            <div className="mb-6">
              <label className="block text-[#54CA9B] text-sm font-bold mb-2">
                Profile Picture
              </label>
              <div className="bg-[#2A2A2A] p-4 rounded border border-dashed border-[#54CA9B] text-center">
                <p className="text-gray-400">Coming Soon</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#2A2A2A] text-[#54CA9B] hover:bg-[#3A3A3A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-[#54CA9B] text-black hover:bg-[#3DA77B] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 