'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AppUser } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Set persistence on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence initialized');
      } catch (error) {
        console.error('Error initializing auth persistence:', error);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<AppUser> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUser: Omit<AppUser, 'id'> = {
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'user',
          createdAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        return {
          id: firebaseUser.uid,
          ...newUser,
        };
      }
      
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        role: userData.role || 'user',
        createdAt: userData.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Return basic user info from Firebase Auth
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        role: 'user',
        createdAt: new Date(),
      };
    }
  };

  useEffect(() => {
    if (!initialized) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser);
          console.log('User data fetched:', userData.email);
          setUser(userData);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        }
      } else {
        console.log('No user found, setting user to null');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [initialized]);

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google login...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user.email);
      
      const userData = await fetchUserData(result.user);
      setUser(userData);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Google login error:', error);
      return Promise.reject(error);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      console.log('Starting email login for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email login successful:', result.user.email);
      
      const userData = await fetchUserData(result.user);
      setUser(userData);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Email login error:', error);
      return Promise.reject(error);
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      console.log('Starting registration for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', result.user.email);
      
      const newUser: Omit<AppUser, 'id'> = {
        email,
        name,
        role: 'user',
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      
      setUser({
        id: result.user.uid,
        ...newUser,
      });
      return Promise.resolve();
    } catch (error: any) {
      console.error('Registration error:', error);
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
      return Promise.resolve();
    } catch (error: any) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};