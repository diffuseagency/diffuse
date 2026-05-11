import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import { Calendar, User, ArrowRight, Loader2, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Blog() {
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tudo');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map(p => p.category))).filter(Boolean) as string[];
    return ['Tudo', ...cats.sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesCategory = activeCategory === 'Tudo' || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const pagedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-20 px-4 max-w-7xl mx-auto">
      <SEO title={`Blog | Insights Digital | ${settings.agency_name || 'Diffuse'}`} />
      
      <div className="mb-20 flex flex-col lg:flex-row justify-between items-end gap-12">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-4 block font-bold">Pensamentos</span>
          <h1 className="text-7xl md:text-9xl font-display font-light tracking-tighter italic">Journal</h1>
          <p className="text-xl text-white/40 mt-8 max-w-2xl font-light">
            Explorando a intersecção de tecnologia, design sênior e o futuro da web de alta performance.
          </p>
        </div>
        <div className="w-full lg:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
                type="text" 
                placeholder="Buscar no arquivo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:border-blue-500 transition-all font-light"
            />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide border-b border-white/5 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border",
              activeCategory === cat 
                ? "bg-white text-black border-white" 
                : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-20">
        {pagedPosts.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[40px]">
             <Search size={40} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-500 uppercase tracking-widest text-[10px]">Nenhuma correspondência encontrada.</p>
          </div>
        ) : (
          pagedPosts.map((post, idx) => {
            // Bento logic: first post is large, some are wide, some are tall
            const isFirst = idx === 0;
            const isWide = idx % 5 === 2;
            const isTall = idx % 5 === 4;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "group relative overflow-hidden rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500",
                  isFirst ? "md:col-span-6 lg:col-span-8 lg:row-span-2" : 
                  isWide ? "md:col-span-6 lg:col-span-6" :
                  isTall ? "md:col-span-3 lg:col-span-4 lg:row-span-2" :
                  "md:col-span-3 lg:col-span-4"
                )}
              >
                <Link to={`/blog/${post.slug}`} className="absolute inset-0 z-20" />
                
                <div className="absolute inset-0 z-0">
                  <img 
                    src={post.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80'} 
                    alt={post.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-20 group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
                </div>

                <div className="relative z-10 p-10 h-full flex flex-col justify-end">
                  <div className="flex gap-4 mb-4">
                    <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                      {post.category}
                    </span>
                    <span className="text-[8px] text-white/40 uppercase tracking-widest flex items-center gap-1 font-mono">
                      <Calendar size={10} /> {post.date}
                    </span>
                  </div>
                  
                  <h3 className={cn(
                    "font-display tracking-tighter text-white mb-4 transition-all group-hover:text-blue-400",
                    isFirst ? "text-4xl md:text-6xl" : "text-2xl"
                  )}>
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 font-light leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <User size={12} className="text-blue-500" />
                       <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">{post.author}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {visibleCount < filteredPosts.length && (
        <div className="flex justify-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5"
          >
            Carregar Mais Insights
          </button>
        </div>
      )}
    </div>
  );
}
