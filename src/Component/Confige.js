import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyB7nkWb3Ce43JDhsNi9zrQ3W5tR10ivHA0",
  authDomain: "kavisdryfurits.firebaseapp.com",
  projectId: "kavisdryfurits",
  storageBucket: "kavisdryfurits.appspot.com", 
  messagingSenderId: "769801543519",
  appId: "1:769801543519:web:8beff84a084dee83ad60ea",
  measurementId: "G-9PFN97BGCL"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const handleGoogleLogin = async (setMessage) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log(user)
    setMessage("Google Sign-In Successful!");
    return user; 
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    setMessage("Google Sign-In Failed");
    return null;
  }
};


export { auth, googleProvider, handleGoogleLogin };
