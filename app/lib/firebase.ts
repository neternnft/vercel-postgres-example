// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, FirebaseError } from 'firebase/app';
import { getDatabase, ref, set, query, orderByChild, limitToLast, Database, onValue, get, equalTo } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  // You'll get these values from your Firebase project settings
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://glurbnok-default-rtdb.europe-west1.firebasedatabase.app"
};

// Log the configuration (safely)
console.log('Firebase configuration loaded:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  // Hide sensitive values
  apiKey: firebaseConfig.apiKey ? '***' : 'missing',
  appId: firebaseConfig.appId ? '***' : 'missing'
});

// Verify environment variables
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing Firebase config value for: ${key}`);
  }
});

// Initialize Firebase
let app: FirebaseApp;
let database: Database;

try {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  console.log('Initializing Realtime Database...');
  database = getDatabase(app);
  console.log('Realtime Database initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export async function saveScore(username: string, score: number, walletAddress: string) {
  if (!database) {
    console.error('Database not initialized');
    return false;
  }

  try {
    console.log('Starting saveScore process:', { username, score, walletAddress });

    // Get all scores for this wallet address
    const scoresRef = ref(database, 'scores');
    
    // First get all scores to check if this is a high score
    const allScoresSnapshot = await get(scoresRef);
    let currentHighScore = -1;
    let oldScoreKeys: string[] = [];

    if (allScoresSnapshot.exists()) {
      console.log('Found existing scores');
      allScoresSnapshot.forEach((childSnapshot) => {
        const existingScore = childSnapshot.val();
        if (existingScore.walletAddress === walletAddress) {
          console.log('Found score for wallet:', existingScore);
          oldScoreKeys.push(childSnapshot.key!);
          if (existingScore.score > currentHighScore) {
            currentHighScore = existingScore.score;
            console.log('New current high score found:', currentHighScore);
          }
        }
      });
    } else {
      console.log('No existing scores found');
    }

    console.log('Score comparison:', {
      currentHighScore,
      newScore: score,
      isHigher: score > currentHighScore
    });

    // Save if it's a new high score or no previous scores exist
    if (score > currentHighScore) {
      console.log('New high score! Saving...');
      
      // Generate a score ID that includes the wallet address for better querying
      const scoreId = `${Date.now()}_${walletAddress}`;
      const newScoreRef = ref(database, `scores/${scoreId}`);
      
      // Save new score
      await set(newScoreRef, {
        username,
        score,
        walletAddress,
        timestamp: Date.now()
      });

      // Clean up old scores for this wallet
      if (oldScoreKeys.length > 0) {
        console.log('Cleaning up old scores:', oldScoreKeys);
        for (const key of oldScoreKeys) {
          console.log('Deleting old score:', key);
          await set(ref(database, `scores/${key}`), null);
        }
      }

      console.log('Score saved successfully');
      return true;
    } else {
      console.log('Score not saved - not a high score for this wallet');
      return false;
    }
  } catch (error: unknown) {
    console.error('Error in saveScore:', error);
    if (error instanceof FirebaseError) {
      console.error('Firebase error details:', {
        code: error.code,
        message: error.message
      });
    }
    return false;
  }
}

export async function getTopScores(limit = 5) {
  if (!database) {
    console.error('Database not initialized');
    return null;
  }

  try {
    console.log('Getting top scores, limit:', limit);
    const scoresRef = ref(database, 'scores');
    // Query more scores to handle duplicates
    const topScoresQuery = query(
      scoresRef,
      orderByChild('score'),
      limitToLast(20) // Get more scores to handle duplicates
    );
    console.log('Top scores query created');
    return topScoresQuery;
  } catch (error: unknown) {
    console.error('Error getting top scores:', error);
    if (error instanceof FirebaseError) {
      console.error('Firebase error details:', {
        code: error.code,
        message: error.message
      });
    }
    return null;
  }
}

export async function getUserProfile(walletAddress: string) {
  if (!database) {
    console.error('Database not initialized');
    return null;
  }

  try {
    console.log('Getting user profile for:', walletAddress);
    const userRef = ref(database, `users/${walletAddress}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error: unknown) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function updateUserProfile(walletAddress: string, username: string) {
  if (!database) {
    console.error('Database not initialized');
    return null;
  }

  try {
    // First check if username is taken by another user
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      let isUsernameTaken = false;
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.username === username && childSnapshot.key !== walletAddress) {
          isUsernameTaken = true;
        }
      });
      
      if (isUsernameTaken) {
        throw new Error('Username is already taken');
      }
    }

    // Update or create user profile
    const userRef = ref(database, `users/${walletAddress}`);
    await set(userRef, {
      username,
      walletAddress,
      updatedAt: Date.now()
    });

    return { username, walletAddress };
  } catch (error: unknown) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update profile');
  }
} 