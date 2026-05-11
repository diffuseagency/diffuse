import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Super admin email bypass (emergency)
        if (user.email === 'diffuseagency@gmail.com') {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        try {
          const docRef = doc(db, 'admins', user.uid);
          const docSnap = await getDoc(docRef);
          setAuthorized(docSnap.exists());
        } catch (error) {
          console.error("Admin verification error:", error);
          setAuthorized(false);
        }
      } else {
        setAuthorized(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Verificando Credenciais</p>
        </div>
      </div>
    );
  }
  
  if (!authorized) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
