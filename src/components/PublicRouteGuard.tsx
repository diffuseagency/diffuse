import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

interface PublicRouteGuardProps {
  children: React.ReactNode;
  path: string;
}

export default function PublicRouteGuard({ children, path }: PublicRouteGuardProps) {
  const [status, setStatus] = useState<'loading' | 'active' | 'inactive'>('loading');

  useEffect(() => {
    async function checkVisibility() {
      try {
        const q = query(
          collection(db, 'navigation'), 
          where('path', '==', path),
          where('isActive', '==', false)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          setStatus('inactive');
        } else {
          setStatus('active');
        }
      } catch (error) {
        console.error("Error checking route visibility:", error);
        setStatus('active'); // Default to active on error
      }
    }

    checkVisibility();
  }, [path]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === 'inactive') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
