import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Target, Users2, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function About() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        const sData: any = {};
        snap.docs.forEach(d => sData[d.data().key] = d.data().value);
        setSettings(sData);
      } catch (e) {
        console.error("Error fetching settings:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">
          <Loader2 size={40} />
        </motion.div>
      </div>
    );
  }

  const content = {
    manifesto: settings.about_manifesto || "A Diffuse nasceu da necessidade de elevar o padrão do desenvolvimento web. Não apenas construímos sites; arquitetamos experiências que definem o futuro digital de nossos parceiros.",
    vision: settings.about_vision || "Ser a referência global em soluções digitais que harmonizam sofisticação artística e robustez técnica.",
    mission: settings.about_mission || "Transformar desafios complexos em soluções intuitivas e encantadoras através de engenharia sênior.",
    dna: settings.about_dna || "Fusão entre design editorial, performance absoluta e tecnologia de processamento em tempo real."
  };

  return (
    <div className="pt-40 pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-32"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Manifesto</span>
        <h1 className="text-6xl md:text-8xl font-display font-light mb-12 tracking-tighter">
          Excelência como <br /> ponto de partida.
        </h1>
        <p className="text-2xl text-white/60 font-light leading-relaxed">
          {content.manifesto}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-20">
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nossa Visão</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            {content.vision}
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nossa Missão</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            {content.mission}
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nosso DNA</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            {content.dna}
          </p>
        </div>
      </div>

      <div className="mt-40 grid md:grid-cols-2 gap-8">
        <div className="glass-card p-12 aspect-square flex flex-col justify-end bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000 group">
          <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <h4 className="text-2xl mb-2 italic font-premium">Engenharia de Precisão</h4>
            <p className="text-white/60 text-sm">Cada linha de código é revisada para garantir máxima segurança e velocidade.</p>
          </div>
        </div>
        <div className="glass-card p-12 aspect-square flex flex-col justify-end bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000 group">
         <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <h4 className="text-2xl mb-2 italic font-premium">Design Encantador</h4>
            <p className="text-white/60 text-sm">Interfaces que respiram sofisticação e guiam o usuário intuitivamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
