import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBqTGT_A0LIc5QRLvbH0RzcUBRfrl8h-CY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invintell-dd772.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invintell-dd772",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invintell-dd772.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "609147410499",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:609147410499:web:fd54d64a234cdfc932dcf6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5QN1RXK282"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
};
