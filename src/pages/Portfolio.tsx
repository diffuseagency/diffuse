import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const snap = await getDocs(collection(db, 'portfolio'));
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setProjects(items);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'portfolio');
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
    return projects.filter(p => {
      const matchesCategory = activeFilter === 'Tudo' || p.category === activeFilter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeFilter, searchQuery]);

  const pagedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

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
      <div className="mb-32 flex flex-col lg:flex-row justify-between items-end gap-12">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Arquivo</span>
          <h1 className="text-7xl md:text-9xl font-display font-light tracking-tighter">Portfólio</h1>
          <p className="text-xl text-white/40 mt-8 font-light leading-relaxed">
            Uma seleção curada de projetos onde o design sophisticação encontra a excelência técnica.
          </p>
        </div>
        <div className="w-full lg:w-96 space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => { setActiveFilter(cat); setVisibleCount(6); }}
                        className={cn(
                            "font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap",
                            activeFilter === cat ? "text-white underline underline-offset-8" : "text-white/40 hover:text-white"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Filtrar projetos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-full py-4 px-6 text-white text-[10px] uppercase tracking-widest focus:outline-none focus:border-white/20 transition-all font-bold"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 mb-40">
        <AnimatePresence mode="popLayout">
          {pagedProjects.map((p, i) => (
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
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 rounded-[32px] mb-6 shadow-2xl shadow-black/50">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl shadow-blue-500/20">
                    <Plus size={24} />
                  </div>
                </div>
                <div className="flex justify-between items-start px-4 text-left">
                  <div>
                    <h3 className="text-2xl font-light tracking-tight text-white group-hover:text-blue-400 transition-colors uppercase">{p.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">{p.category}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono italic">{p.year}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleCount < filteredProjects.length && (
          <div className="flex justify-center mb-40">
              <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-12 py-6 bg-white/[0.02] border border-white/10 text-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all"
              >
                  Descobrir Mais Projetos
              </button>
          </div>
      )}
    </div>
  );
}
