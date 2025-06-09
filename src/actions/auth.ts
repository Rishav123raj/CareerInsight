
'use server';

import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile // Renamed to avoid conflict
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: { 
    id: string; 
    name: string | null; // Firebase displayName can be null
    email: string | null; // Firebase email can be null
  };
  error?: { code?: string; message: string };
}

interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
}

export async function signUpUser(formData: FormData): Promise<AuthResponse> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth profile with display name
    await updateFirebaseProfile(firebaseUser, { displayName: name });

    // Store additional user information in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      name: name,
      email: firebaseUser.email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'User registered successfully!',
      user: { 
        id: firebaseUser.uid, 
        name: firebaseUser.displayName, 
        email: firebaseUser.email 
      },
    };
  } catch (error: any) {
    console.error('🔴 Firebase Sign Up Error:', error);
    // Firebase errors often have a 'code' property, e.g., 'auth/email-already-in-use'
    let message = 'An unexpected error occurred during sign up.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Please sign in or use a different email.';
    } else if (error.code === 'auth/weak-password') {
      message = 'The password is too weak. Please choose a stronger password.';
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, message: message, error: { code: error.code, message: error.message } };
  }
}

export async function signInUser(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Optionally, you could fetch additional user data from Firestore here if needed
    // For now, Firebase Auth's user object is usually sufficient for basic info.
    // const userDocRef = doc(db, "users", firebaseUser.uid);
    // const userDoc = await getDoc(userDocRef);
    // const userName = userDoc.exists() ? userDoc.data().name : firebaseUser.displayName;

    return {
      success: true,
      message: 'Signed in successfully!',
      user: { 
        id: firebaseUser.uid, 
        name: firebaseUser.displayName, // Or fetched name from Firestore
        email: firebaseUser.email 
      },
    };
  } catch (error: any) {
    console.error('🔴 Firebase Sign In Error:', error);
    let message = 'An unexpected error occurred during sign in.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password.';
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, message: message, error: { code: error.code, message: error.message } };
  }
}
