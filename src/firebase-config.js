// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // for Firebase Storage
import { getAuth } from "firebase/auth"; // for Firebase Auth

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiqc0znVZyVoynsWZwDWIqiLduPbmPbkQ",              // Replace with your actual API key
  authDomain: "drc-political-science.firebaseapp.com",
  projectId: "drc-political-science",
  storageBucket: "drc-political-science.firebasestorage.app",
  messagingSenderId: "384002862311",
  appId: "1:384002862311:web:e316bd3979e7a676024642",
  measurementId: "G-2ZX8QPNVY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);
