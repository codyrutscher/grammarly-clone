import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAkfmE8QJqP3BTXav5eaAf37B_oqndC3wA",
  authDomain: "grammarly-clone-for-gauntlet.firebaseapp.com",
  projectId: "grammarly-clone-for-gauntlet",
  storageBucket: "grammarly-clone-for-gauntlet.firebasestorage.app",
  messagingSenderId: "516476942882",
  appId: "1:516476942882:web:72c12e29d335f30abf287b",
  measurementId: "G-R51PWVLQW5"
};

// Initialize Firebase (check if already initialized to prevent duplicate app error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app; 