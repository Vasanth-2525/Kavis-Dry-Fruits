// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7nkWb3Ce43JDhsNi9zrQ3W5tR10ivHA0",
  authDomain: "kavisdryfurits.firebaseapp.com",
  projectId: "kavisdryfurits",
  storageBucket: "kavisdryfurits.appspot.com", // ✅ Corrected
  messagingSenderId: "769801543519",
  appId: "1:769801543519:web:8beff84a084dee83ad60ea",
  measurementId: "G-9PFN97BGCL",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ✅ Export Firebase services
export { app, auth, db, storage, provider };
