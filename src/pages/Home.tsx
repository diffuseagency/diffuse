import { motion } from 'motion/react';
import { ArrowRight, Cpu, Shield, Globe, Terminal, Zap, Layers, Smartphone, 
  Search, Database, Code2, Rocket, Layout 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

const iconMap: any = { Globe, Smartphone, Search, Database, Code2, Rocket, Layout, Cpu, Layers };

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

      {/* Testimonials - Layout 3: Tech/Futuristic */}
      <section className="py-32 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em]">Live_Systems_Feedback</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-none">
                Confiança <span className="text-blue-500 italic">Codificada.</span>
              </h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">[TOTAL_REVIEWS: {testimonials.length}]</p>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">[UPTIME: 99.9%]</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative group hover:border-blue-500/30 transition-all duration-500",
                  idx === 0 && "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-500/5 to-transparent"
                )}
              >
                {/* Tech Accents */}
                <div className="absolute top-8 right-8 text-[10px] font-mono text-gray-700 select-none">
                  0{idx + 1} // FEEDBACK_{idx}
                </div>
                
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <span className="text-[10px] font-mono text-blue-500/80 bg-blue-500/10 px-2 py-1 rounded-md mb-4 inline-block tracking-tighter uppercase">
                      [User_Verified_Success]
                    </span>
                    <p className={cn(
                      "text-gray-300 leading-relaxed",
                      idx === 0 ? "text-2xl font-light" : "text-lg"
                    )}>
                      "{t.content}"
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {t.avatar ? (
                        <div className="relative">
                          <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-brand-bg rounded-full" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-white/5">
                          <Shield size={20} className="text-blue-500/40" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-bold tracking-tight text-sm">{t.author}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{t.role}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-blue-500/50">
                        <Terminal size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decoration Lines */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500/50 group-hover:w-1/2 transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
