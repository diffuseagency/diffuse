import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Portfolio() {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tudo');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio'));
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setProjects(items);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p: any) => p.category))).filter(Boolean) as string[];
    return ['Tudo', ...cats.sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return activeFilter === 'Tudo' 
      ? projects 
      : projects.filter(p => p.category === activeFilter);
  }, [projects, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Carregando Galeria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 max-w-7xl mx-auto px-4">
      <SEO title={`Portfólio | ${settings.agency_name || 'Diffuse'}`} />
      <div className="mb-32 flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Arquivo</span>
          <h1 className="text-7xl md:text-9xl font-display font-light tracking-tighter">Portfólio</h1>
          <p className="text-xl text-white/40 mt-8 font-light leading-relaxed">
            Uma seleção curada de projetos onde o design sophisticação encontra a excelência técnica.
          </p>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap",
                activeFilter === cat ? "text-white underline underline-offset-8" : "text-white/40 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 mb-40">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.4,
                delay: i * 0.05,
                layout: { duration: 0.3 }
              }}
            >
              <Link to={`/portfolio/${p.slug || p.id}`} className="group cursor-pointer block">
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 rounded-[32px] mb-6">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                    <Plus size={24} />
                  </div>
                </div>
                <div className="flex justify-between items-start px-4">
                  <div>
                    <h3 className="text-2xl font-light tracking-tight text-white">{p.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">{p.category}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono italic">{p.year}</span>
                </div>
              </Link>
            </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
