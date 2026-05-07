import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const snap = await getDocs(collection(db, 'portfolio'));
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPortfolio();
  }, []);

  return (
    <div className="pt-40 max-w-7xl mx-auto px-4">
      <div className="mb-32 flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Arquivo</span>
          <h1 className="text-7xl md:text-9xl font-display font-light tracking-tighter">Portfólio</h1>
          <p className="text-xl text-white/40 mt-8 font-light leading-relaxed">
            Uma seleção curada de projetos onde o design sophisticação encontra a excelência técnica.
          </p>
        </div>
        <div className="flex gap-4">
          <span className="text-white font-mono text-sm underline underline-offset-8 transition-all cursor-pointer">Tudo</span>
          <span className="text-white/40 font-mono text-sm hover:text-white transition-all cursor-pointer">Web</span>
          <span className="text-white/40 font-mono text-sm hover:text-white transition-all cursor-pointer">Mobile</span>
          <span className="text-white/40 font-mono text-sm hover:text-white transition-all cursor-pointer">Design</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 mb-40">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
