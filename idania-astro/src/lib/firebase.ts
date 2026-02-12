import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY || "AIzaSyAGBDa2z5QIqURECJGsb7gYi1pKM9gFkU0",
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN || "ida-2002.firebaseapp.com",
  projectId: import.meta.env.FIREBASE_PROJECT_ID || "ida-2002",
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET || "ida-2002.firebasestorage.app",
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID || "279955188647",
  appId: import.meta.env.FIREBASE_APP_ID || "1:279955188647:web:0884c17bb517aa7ba0e482"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;