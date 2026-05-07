import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import SEO from '../components/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/admin');
    } catch (err: any) {
      setError((isSignup ? 'Erro no cadastro: ' : 'Erro no login: ') + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      setError('Erro no login com Google: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <SEO title="Login | Master Dashboard" />
      <div className="glass-card p-12 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-8 text-center uppercase tracking-widest">
          {isSignup ? 'Cadastro Administrativo' : 'Login Administrativo'}
        </h1>
        {error && <p className="text-red-500 mb-4 text-xs">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white/90">
            {isSignup ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <button onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
            Google
          </button>
          <button onClick={() => setIsSignup(!isSignup)} className="w-full text-gray-500 text-xs text-center hover:text-white transition-all">
            {isSignup ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
