import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]"></div>

      <div className="text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="relative inline-block mb-12"
        >
          <h1 className="text-[180px] md:text-[250px] font-display font-light leading-none tracking-tighter text-white/5 italic">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-6 bg-blue-500 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <Zap size={40} className="text-white fill-white" />
             </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-light text-white tracking-tight mb-6">
            Página Perdida no <span className="italic text-blue-500">Ciberespaço</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-md mx-auto leading-relaxed">
            O conteúdo que você procura foi movido para outra dimensão ou nunca existiu nesta realidade. 
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Home size={14} /> Voltar à Base
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Página Anterior
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Text */}
      <div className="absolute bottom-10 left-10 text-[10px] text-white/10 uppercase tracking-[1em] font-black pointer-events-none hidden md:block">
        ERROR_O4_PAGE_NOT_FOUND_SYSTEM_HALT
      </div>
    </div>
  );
}
