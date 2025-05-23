'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../lib/firebase';

interface UserProfileData {
  username: string;
  pfpUrl?: string;
}

export function useUserProfile() {
  const { address } = useAccount();
  const [profileData, setProfileData] = useState<UserProfileData>({
    username: '',
    pfpUrl: undefined
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load profile data when component mounts or address changes
  useEffect(() => {
    async function loadProfile() {
      if (!isMounted || !address) return;
      
      console.log('Loading profile data for address:', address);
      setIsLoading(true);
      try {
        const userData = await getUserProfile(address);
        console.log('Loaded user data:', userData);
        if (userData) {
          setProfileData(prev => ({
            ...prev,
            username: userData.username
          }));
        } else {
          console.log('No profile found for address');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [address, isMounted]);

  // Update profile data
  const updateProfile = async (newData: Partial<UserProfileData>) => {
    if (!address || !isMounted || !newData.username) return;
    
    console.log('Updating profile:', { address, newData });
    setIsLoading(true);
    try {
      const result = await updateUserProfile(address, newData.username.trim());
      console.log('Profile update result:', result);
      
      if (!result) {
        throw new Error('Failed to update profile');
      }

      setProfileData(prev => ({
        ...prev,
        username: result.username
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      } else {
        throw new Error('An unexpected error occurred while saving');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { profileData, updateProfile, isMounted, isLoading };
}

export default function UserProfileModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { profileData, updateProfile, isMounted, isLoading } = useUserProfile();
  const [tempUsername, setTempUsername] = useState('');
  const [error, setError] = useState<string>('');
  const { address } = useAccount();

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

    return null;
  };

  const handleSave = async () => {
    if (!isMounted || !address) return;
    
    try {
      // Validate username
      const validationError = validateUsername(tempUsername);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Try to update profile
      await updateProfile({ username: tempUsername });
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-[#54CA9B] text-black hover:bg-[#3DA77B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 