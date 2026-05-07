import { motion } from 'motion/react';
import { ArrowRight, Cpu, Shield, Globe, Terminal, Zap, Layers, Smartphone, 
  Music, Search, Database, Code2, Rocket, Layout, Mic2, Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';

const iconMap: any = { Globe, Smartphone, Music, Search, Database, Code2, Rocket, Layout, Cpu, Layers };

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-4xl font-light tracking-tighter text-white">{value}</span>
    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">{label}</span>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, ...props }: { icon: any, title: string, description: string, [key: string]: any }) => (
  <div className="glass-card p-8 group hover:bg-white/10 transition-all" {...props}>
    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-medium mb-3">{title}</h3>
    <p className="text-white/60 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function Home() {
  const { settings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testSnap = await getDocs(collection(db, 'testimonials'));
        setTestimonials(testSnap.docs.map(doc => doc.data()));

        const servSnap = await getDocs(query(collection(db, 'services'), limit(4)));
        setServices(servSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error('Error fetching data', e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-20">
      <SEO />
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase mb-6 inline-block">
              Agência Digital de Alta Performance
            </span>
            <h1 className="text-7xl md:text-8xl font-light leading-[0.9] tracking-tight mb-10 text-white">
              {settings.hero_title ? (
                <>
                  {settings.hero_title.split(',')[0]} 
                  {settings.hero_title.split(',')[1] && (
                    <span className="brand-gradient-text font-bold italic"> {settings.hero_title.split(',')[1]}</span>
                  )}
                </>
              ) : (
                <>Architecture of <span className="brand-gradient-text font-bold italic">Precision</span></>
              )}
            </h1>
            <p className="text-xl text-gray-400 max-w-xl font-light leading-relaxed mb-12">
              {settings.hero_subtitle || 'Engenharia de software sênior para marcas que exigem o absoluto topo da performance e design.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/contato" className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold uppercase tracking-widest text-sm inline-flex items-center group shadow-2xl shadow-blue-500/20 text-white hover:scale-105 transition-all">
                Iniciar Projeto <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/portfolio" className="button-glass px-10 py-5 !text-sm flex items-center justify-center">
                Ver Portfólio
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 border-t border-white/10 pt-12"
        >
          <Stat label="Projetos Entregues" value="120+" />
          <Stat label="Prêmios de Design" value="12" />
          <Stat label="Anos de Experiência" value="08+" />
          <Stat label="Países Alcançados" value="05" />
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Especialidades</span>
              <h2 className="text-5xl font-display font-light">Nossos diferenciais de desenvolvimento.</h2>
            </div>
            <Link to="/servicos" className="text-sm uppercase tracking-widest font-bold border-b border-white/40 pb-2 hover:border-white transition-all">Ver Todos os Serviços</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <FeatureCard 
                key={service.id}
                icon={iconMap[service.icon] || Layout} 
                title={service.title} 
                description={service.description} 
              />
            ))}
            {services.length === 0 && (
              <>
                <FeatureCard 
                  icon={Globe} 
                  title="Sistemas Web" 
                  description="Aplicações robustas e escaláveis, focadas em otimização de fluxos e experiência do usuário." 
                />
                <FeatureCard 
                  icon={Smartphone} 
                  title="Soluções Mobile" 
                  description="Desenvolvimento mobile nativo e híbrido com performance impecável e UI sofisticada." 
                />
                <FeatureCard 
                  icon={Rocket} 
                  title="Tech-Driven Design" 
                  description="Design que não é apenas bonito, mas construído sobre as melhores práticas de SEO e acessibilidade." 
                />
                <FeatureCard 
                  icon={Layout} 
                  title="UX/UI Design" 
                  description="Interfaces intuitivas e memoráveis que convertem e encantam os usuários." 
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Audio Lab Showcase */}
      <section className="py-32 px-4 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/[0.02] blur-[150px] rounded-full -z-10" />
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
               <span className="text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-4 block font-bold">Research & Development</span>
               <h2 className="text-5xl md:text-7xl font-display font-light italic mb-8 tracking-tighter leading-tight">
                  Engenharia de som em <span className="text-blue-500 font-bold">Tempo Real</span>.
               </h2>
               <p className="text-xl text-white/40 font-light leading-relaxed mb-12 max-w-xl">
                  Exploramos os limites da Web Audio API para criar experiências sonoras imersivas e processamento de sinal de baixa latência diretamente no navegador.
               </p>
               <Link to="/lab/audio" className="group flex items-center gap-4 text-xl font-display italic hover:text-blue-500 transition-colors">
                  Explorar Laboratório de Áudio <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
            
            <div className="flex-1 w-full bg-white/[0.02] border border-white/10 rounded-[60px] p-12 relative overflow-hidden group">
               <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
                     <span>Spectrum Analysis</span>
                     <span>Module V1.0</span>
                  </div>
                  <div className="h-40 flex items-end gap-1 px-4">
                     {[...Array(20)].map((_, i) => (
                        <motion.div 
                           key={i}
                           animate={{ height: [40, 100, 60, 120, 80][i % 5] }}
                           transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                           className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm"
                        />
                     ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                     <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-blue-500">
                           <Mic2 size={18} />
                        </div>
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-purple-500">
                           <Activity size={18} />
                        </div>
                     </div>
                     <span className="text-[10px] font-mono text-green-500 font-bold animate-pulse">SYSTEM ACTIVE</span>
                  </div>
               </div>
               
               {/* Decorative Circle */}
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-purple-400 font-mono text-xs mb-2 tracking-widest uppercase">Feedback</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight">O que dizem nossos parceiros</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-card p-12 relative group hover:bg-white/10 transition-all">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <p className="text-xl italic text-gray-300 leading-snug mb-8 relative z-10">
                  "{t.content}"
                </p>
                <div className="relative z-10">
                  <p className="font-bold tracking-tight text-white">{t.author}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
