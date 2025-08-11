// Firebase configuration (ready for production)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config - these would come from environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-mode",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cleanscan-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cleanscan-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cleanscan-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase only if we have real config
let app, auth, db;

if (firebaseConfig.apiKey !== "demo-mode") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Demo mode - no real Firebase connection
  console.log('Firebase running in demo mode. Set environment variables for production.');
  auth = null;
  db = null;
}

export { auth, db };
export const isFirebaseEnabled = firebaseConfig.apiKey !== "demo-mode";
