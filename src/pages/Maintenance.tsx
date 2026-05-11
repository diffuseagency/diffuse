import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Rocket, Mail, Instagram, Linkedin, Globe } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <div className="mb-12 inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-[32px] text-blue-500">
          <Rocket size={48} className="animate-bounce" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Evoluindo para <br />o próximo nível.
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-12 max-w-lg mx-auto">
          Nosso laboratório está passando por atualizações críticas de performance. Voltaremos em breve com novidades.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card p-6 !rounded-2xl border-white/10">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Social</h3>
            <div className="flex justify-center gap-4 text-white/40">
               <Instagram size={18} className="hover:text-white transition-colors cursor-pointer" />
               <Linkedin size={18} className="hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="glass-card p-6 !rounded-2xl border-white/10">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Contato</h3>
            <div className="flex justify-center gap-2 text-white/40 italic text-xs">
               contato@diffuse.agency
            </div>
          </div>
          <div className="glass-card p-6 !rounded-2xl border-white/10">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Status</h3>
            <div className="flex justify-center items-center gap-2 text-amber-500 italic text-xs uppercase font-bold tracking-tighter">
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
               Em Manutenção
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-bold">Diffuse — High End Web Engineering</p>
        </div>
      </motion.div>
    </div>
  );
}
