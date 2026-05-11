import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isUserAdmin, loading } = useAuth();

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
  
  if (!isUserAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
