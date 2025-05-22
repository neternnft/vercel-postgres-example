// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, FirebaseError } from 'firebase/app';
import { getDatabase, ref, set, query, orderByChild, limitToLast, Database, onValue, get } from 'firebase/database';

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
    console.log('Saving score:', { username, score, walletAddress });
    const scoreRef = ref(database, 'scores/' + Date.now());
    await set(scoreRef, {
      username,
      score,
      walletAddress,
      timestamp: Date.now()
    });
    console.log('Score saved successfully');
    return true;
  } catch (error: unknown) {
    console.error('Error saving score:', error);
    if (error instanceof FirebaseError && error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied. Please check Firebase Database Rules.');
    }
    return false;
  }
}

export async function getTopScores(limit = 10) {
  if (!database) {
    console.error('Database not initialized');
    return null;
  }

  try {
    console.log('Getting top scores, limit:', limit);
    const scoresRef = ref(database, 'scores');
    const topScoresQuery = query(
      scoresRef,
      orderByChild('score'),
      limitToLast(limit)
    );
    console.log('Top scores query created');
    return topScoresQuery;
  } catch (error: unknown) {
    console.error('Error getting top scores:', error);
    if (error instanceof FirebaseError && error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied. Please check Firebase Database Rules.');
    }
    return null;
  }
} 