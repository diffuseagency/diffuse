import { motion } from 'motion/react';
import { ShieldCheck, Eye, Target, Users2 } from 'lucide-react';

export default function About() {
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
          A Diffuse nasceu da necessidade de elevar o padrão do desenvolvimento web. Não apenas construímos sites; arquitetamos experiências que definem o futuro digital de nossos parceiros.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-20">
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nossa Visão</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            Ser a referência global em soluções digitais que harmonizam sofisticação artística e robustez técnica.
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nossa Missão</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            Transformar desafios complexos em soluções intuitivas e encantadoras através de engenharia sênior.
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/40 mb-8 font-mono">Nosso DNA</h3>
          <p className="text-white/80 leading-relaxed italic font-premium text-xl">
            Fusão entre design editorial, performance absoluta e tecnologia de processamento em tempo real.
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
