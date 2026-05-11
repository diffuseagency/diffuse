import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Check if already exists
      const q = query(collection(db, 'newsletter_leads'), where('email', '==', email));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setStatus('success');
        return;
      }

      await addDoc(collection(db, 'newsletter_leads'), {
        email,
        status: 'active',
        createdAt: serverTimestamp()
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
      setErrorMessage('Erro ao processar inscrição.');
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500"
          >
            <Check size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Inscrição Confirmada</span>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="SEU MELHOR E-MAIL"
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="absolute right-2 top-2 bottom-2 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
            {status === 'error' && (
              <p className="absolute -bottom-6 left-0 text-[10px] text-red-400 uppercase font-bold tracking-widest">{errorMessage}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
