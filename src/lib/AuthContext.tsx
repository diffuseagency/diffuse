import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  isUserAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isUserAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          // Manual override for primary dev/admin email if specified in settings or hardcoded
          const isHardcodedAdmin = currentUser.email === 'diffuseagency@gmail.com';
          setIsUserAdmin(adminDoc.exists() || isHardcodedAdmin);
        } catch (error) {
          console.error("Error checking admin status in context:", error);
          setIsUserAdmin(false);
        }
      } else {
        setIsUserAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isUserAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
