import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "./firebase";

export const signInWithGoogle = async () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user; // Successfully signed-in user
    console.log("User signed in:", user);
    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};
