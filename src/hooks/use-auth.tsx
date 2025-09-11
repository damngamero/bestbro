
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithRedirect, signOut as firebaseSignOut, User, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, deleteUser, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'microsoft.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleUser = async (currentUser: User | null) => {
        if (currentUser && currentUser.emailVerified) {
            setUser(currentUser);
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const localCookbook = JSON.parse(localStorage.getItem('cookbookRecipes') || '[]');
                const localVariations = JSON.parse(localStorage.getItem('variationBook') || '[]');
                await setDoc(userDocRef, {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    lastLogin: new Date(),
                    createdAt: new Date(),
                    cookbook: localCookbook,
                    variationBook: localVariations
                }, { merge: true });
            } else {
                await updateDoc(userDocRef, { lastLogin: new Date() });
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleUser);

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
            toast({
                title: `Welcome back, ${result.user.displayName || 'friend'}!`,
                description: "You've successfully signed in.",
            });
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
        if (error.code !== 'auth/web-storage-unsupported') {
            toast({
                variant: "destructive",
                title: "Sign-In Failed",
                description: "An unexpected error occurred during sign-in.",
            });
        }
      });
    
    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
        await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Error during sign-in redirect: ", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        if (!result.user.emailVerified) {
            await firebaseSignOut(auth);
            throw new Error("Email not verified");
        }
        await updateDoc(doc(db, "users", result.user.uid), { lastLogin: new Date() });
        toast({
            title: `Welcome back, ${result.user.displayName || 'friend'}!`,
        });
    } catch (error: any) {
      console.error("Error signing in with email: ", error);
      throw error;
    }
  }

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const domain = email.split('@')[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
        throw new Error('Please use a valid email provider (Gmail, Yahoo, Outlook, or Microsoft).');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const userToVerify = userCredential.user;

    try {
        await updateProfile(userToVerify, { displayName: name });
        await sendEmailVerification(userToVerify);

        await setDoc(doc(db, "users", userToVerify.uid), {
              uid: userToVerify.uid,
              displayName: name,
              email: userToVerify.email,
              photoURL: null,
              lastLogin: new Date(),
              createdAt: new Date(),
              cookbook: [],
              variationBook: []
        });

        await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Error during sign up, attempting to clean up user:", error);
      
      await deleteUser(userToVerify).catch(e => console.error("Failed to cleanup user:", e));
      
      if (error.code === 'auth/network-request-failed' || error.message.includes('sendEmailVerification')) {
         throw new Error('Failed to send verification email.');
      }
      throw error;
    }
  }
  
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email: ", error);
        // Do not throw here, to prevent leaking user existence. The UI will handle this.
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); 
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error("Error during sign-out: ", error);
      toast({
        variant: "destructive",
        title: "Sign-Out Failed",
        description: (error as Error).message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, sendPasswordReset }}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
