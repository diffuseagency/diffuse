import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, Calendar, Tag, User, Quote, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import TechStackPills from '../components/TechStackPills';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProjectDetailPublic() {
  const { slug } = useParams();
  const { settings } = useSiteSettings();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const q = query(
          collection(db, 'portfolio'),
          where('slug', '==', slug),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setProject({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setError(true);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `portfolio/${slug}`);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4">
        <h1 className="text-4xl font-display mb-4">Projeto não encontrado</h1>
        <Link to="/portfolio" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar ao Portfólio
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <SEO 
        title={project.title}
        description={project.og_description || project.full_description || project.title}
        image={project.og_image || project.image}
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Breadcrumbs 
              items={[
                { label: 'Portfólio', path: '/portfolio' },
                { label: project.title }
              ]} 
            />
            <h1 className="text-6xl md:text-8xl font-display font-light tracking-tighter mb-8 max-w-4xl italic">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap gap-12 border-t border-white/10 pt-8 mt-12">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Categoria</span>
                <span className="text-sm font-medium">{project.category}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Ano</span>
                <span className="text-sm font-medium">{project.year}</span>
              </div>
              {project.client_name && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Cliente</span>
                  <span className="text-sm font-medium">{project.client_name}</span>
                </div>
              )}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Tech Stack</span>
                  <TechStackPills stack={project.tech_stack} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-32">
          <div className="lg:col-span-12">
             <div className="max-w-4xl mx-auto">
                <p className="text-2xl md:text-3xl text-white/80 font-light leading-relaxed mb-24 italic border-l-4 border-blue-500 pl-8">
                    {project.full_description}
                </p>
             </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-blue-500 mb-4 block font-bold">O Desafio</span>
              <h3 className="text-4xl font-display font-light mb-6 tracking-tight text-white leading-tight">
                Identificando as barreiras e objetivos.
              </h3>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xl text-white/40 font-light leading-relaxed">
              {project.challenge_text}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8 pt-12">
            <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-purple-500 mb-4 block font-bold">A Solução</span>
                <h3 className="text-4xl font-display font-light mb-6 tracking-tight text-white leading-tight">
                    Inovação técnica para resultados exponenciais.
                </h3>
            </div>
          </div>
          <div className="lg:col-span-7 pt-12">
            <p className="text-xl text-white/40 font-light leading-relaxed">
              {project.solution_text}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="py-20 bg-black/50">
          <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.gallery.map((img: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedImage(img)}
                className="overflow-hidden rounded-[40px] aspect-video relative group cursor-pointer"
              >
                <img src={img} alt={`${project.title} - ${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl">Visualizar</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex items-center justify-center"
            >
              <img 
                src={selectedImage} 
                alt="Zoomed" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" 
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-0 right-0 p-4 text-white hover:text-blue-500 transition-colors"
              >
                <ArrowLeft size={32} className="rotate-90" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonial Section */}
      {project.client_testimonial && (
        <section className="py-40 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-16 h-16 text-blue-500 mx-auto mb-12 opacity-50" />
            <h4 className="text-3xl md:text-5xl font-display font-light text-white italic leading-tight mb-12 tracking-tight">
              "{project.client_testimonial}"
            </h4>
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium text-white">{project.client_name}</span>
              <span className="text-xs uppercase tracking-widest text-white/40 mt-1">Satisfeito</span>
            </div>
          </div>
        </section>
      )}

      {/* Footer Call to Action */}
      <section className="py-40 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div>
                <h2 className="text-5xl md:text-7xl font-display font-light italic mb-4">Próximo Nível?</h2>
                <p className="text-xl text-white/40 font-light">Seja o próximo Case Study de sucesso da Diffuse.</p>
            </div>
            <Link to="/contato" className="group flex items-center gap-4 text-2xl font-display italic hover:text-blue-500 transition-colors">
                Iniciar Conversa <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
      </section>
    </div>
  );
}
