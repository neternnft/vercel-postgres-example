'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, updateUserProfile, uploadProfilePicture } from '../lib/firebase';

interface UserProfileData {
  username: string;
  arenaUsername: string;
  pfpUrl?: string;
}

export function useUserProfile() {
  const { address } = useAccount();
  const [profileData, setProfileData] = useState<UserProfileData>({
    username: '',
    arenaUsername: '',
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
            username: userData.username,
            arenaUsername: userData.arenaUsername || '',
            pfpUrl: userData.pfpUrl
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
      const result = await updateUserProfile(address, newData.username.trim(), newData.arenaUsername?.trim());
      console.log('Profile update result:', result);
      
      if (!result) {
        throw new Error('Failed to update profile');
      }

      setProfileData(prev => ({
        ...prev,
        username: result.username,
        arenaUsername: result.arenaUsername || '',
        pfpUrl: result.pfpUrl
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

  return { profileData, updateProfile, isMounted, isLoading, setIsLoading };
}

export default function UserProfileModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { profileData, updateProfile, isMounted, isLoading, setIsLoading } = useUserProfile();
  const [tempUsername, setTempUsername] = useState('');
  const [tempArenaUsername, setTempArenaUsername] = useState('');
  const [error, setError] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (isMounted) {
      setTempUsername(profileData.username || '');
      setTempArenaUsername(profileData.arenaUsername || '');
      setImagePreview(profileData.pfpUrl || null);
      setError('');
    }
  }, [profileData.username, profileData.arenaUsername, profileData.pfpUrl, isMounted]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB for base64 conversion)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!isMounted || !address) return;
    
    const startTime = Date.now();
    console.log('[Profile] Starting profile save process');
    
    try {
      setIsLoading(true);
      
      // Validate username
      const validationError = validateUsername(tempUsername);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Upload image if selected
      let pfpUrl = profileData.pfpUrl;
      if (imageFile) {
        try {
          console.log(`[Profile] Starting image upload at ${Date.now() - startTime}ms`);
          const uploadedUrl = await uploadProfilePicture(address, imageFile);
          console.log(`[Profile] Image upload completed at ${Date.now() - startTime}ms`);
          if (uploadedUrl) {
            pfpUrl = uploadedUrl;
          }
        } catch (err) {
          console.error(`[Profile] Failed to upload image at ${Date.now() - startTime}ms:`, err);
          setError('Failed to upload image. Please try again.');
          return;
        }
      }

      // Update profile
      console.log(`[Profile] Starting profile update at ${Date.now() - startTime}ms`);
      await updateProfile({ 
        username: tempUsername,
        arenaUsername: tempArenaUsername,
        pfpUrl
      });
      console.log(`[Profile] Profile update completed at ${Date.now() - startTime}ms`);
      
      onClose();
    } catch (err) {
      const errorTime = Date.now() - startTime;
      if (err instanceof Error) {
        console.error(`[Profile] Error at ${errorTime}ms:`, err.message);
        setError(err.message);
      } else {
        console.error(`[Profile] Unknown error at ${errorTime}ms:`, err);
        setError('An error occurred while saving');
      }
    } finally {
      setIsLoading(false);
      console.log(`[Profile] Total process time: ${Date.now() - startTime}ms`);
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

  const handleArenaUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempArenaUsername(e.target.value);
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
            
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="block text-[#54CA9B] text-sm font-bold mb-2">
                Profile Picture
              </label>
              <div 
                className="bg-[#2A2A2A] p-4 rounded border border-dashed border-[#54CA9B] text-center cursor-pointer hover:bg-[#3A3A3A] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">Change Picture</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-[#54CA9B] mb-2">Click to upload picture</p>
                    <p className="text-gray-400 text-sm">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* App Username Input */}
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

            {/* Arena Username Input */}
            <div className="mb-4">
              <label className="block text-[#54CA9B] text-sm font-bold mb-2">
                Arena Username (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">@</span>
                <input
                  type="text"
                  value={tempArenaUsername}
                  onChange={handleArenaUsernameChange}
                  className="flex-1 px-3 py-2 bg-[#2A2A2A] rounded border border-[#54CA9B] text-white focus:outline-none focus:ring-2 focus:ring-[#54CA9B]"
                  placeholder="Enter your Arena username"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                Your Arena profile will be linked at: https://arena.social/{tempArenaUsername || '[username]'}
              </p>
            </div>

            {/* Error display */}
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
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