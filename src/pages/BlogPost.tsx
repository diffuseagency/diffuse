import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Calendar, User, Tag, Share2, Clock, Linkedin } from 'lucide-react';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams();
  const { settings } = useSiteSettings();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `posts/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4">
        <h1 className="text-4xl font-display mb-4">Artigo não encontrado</h1>
        <Link to="/blog" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar ao Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-20">
      <SEO 
        title={post.title}
        description={post.og_description || post.excerpt}
        image={post.og_image || post.featuredImage}
        article={true}
        authorName={post.author}
        publishedTime={post.date}
      />

      {/* Hero Header */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Breadcrumbs 
              items={[
                { label: 'Journal', path: '/blog' },
                { label: post.title }
              ]} 
            />

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest font-mono">
                <Calendar size={12} /> {post.date}
              </div>
              <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest font-mono">
                <Clock size={12} /> 6 min de leitura
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-light tracking-tighter mb-12 text-white leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex items-center justify-between py-8 border-y border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-blue-500">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1">Autor</p>
                  <p className="text-white font-medium">{post.author}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiado!');
                  }}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Copiar Link"
                >
                  <Share2 size={18} />
                </button>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Compartilhar no LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      {post.featuredImage && (
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="aspect-[21/9] rounded-[40px] overflow-hidden border border-white/5"
          >
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </motion.div>
        </section>
      )}

      {/* Content */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto">
          <div className="markdown-body prose prose-invert prose-blue max-w-none">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-20 pt-12 border-t border-white/5 flex flex-wrap gap-3">
             {post.tags && post.tags.map((tag: string) => (
               <span key={tag} className="px-4 py-2 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                 <Tag size={10} /> {tag}
               </span>
             ))}
          </div>

          {/* Navigation */}
          <div className="mt-32 grid md:grid-cols-2 gap-8">
            <Link to="/blog" className="p-12 bg-white/[0.02] border border-white/5 rounded-[40px] group hover:bg-white/5 transition-all">
              <span className="text-[10px] uppercase tracking-widest text-white/40 mb-4 block">Próximo Insight</span>
              <h4 className="text-2xl font-light text-white group-hover:text-blue-400 transition-colors">Como a IA está redefinindo o design de interfaces</h4>
            </Link>
            <div className="p-12 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[40px]">
              <h4 className="text-xl font-bold text-white mb-4">Inscreva-se na nossa Newsletter</h4>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">Receba insights exclusivos sobre tecnologia e design premium diretamente no seu e-mail.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="seu@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium text-xs" />
                <button className="px-6 bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">OK</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
