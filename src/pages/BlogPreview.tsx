import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Calendar, User, Tag, Eye } from 'lucide-react';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';
import ReactMarkdown from 'react-markdown';

export default function BlogPreview() {
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
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching post preview:", error);
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
        <h1 className="text-4xl font-display mb-4">Rascunho não encontrado</h1>
        <Link to="/admin/cms" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar ao CMS
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-20 pt-16">
      {/* Draft Bar */}
      <div className="fixed top-0 inset-x-0 h-16 bg-yellow-500 flex items-center justify-between px-8 z-50 shadow-lg">
        <div className="flex items-center gap-3 text-black font-bold uppercase tracking-widest text-[10px]">
          <Eye size={16} />
          <span>Modo de Visualização de Rascunho</span>
        </div>
        <div className="flex gap-4">
            <Link to="/admin/cms" className="px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg text-black font-bold uppercase tracking-widest text-[10px] transition-all">
                Voltar ao CMS
            </Link>
        </div>
      </div>

      <SEO 
        title={`[PREVIEW] ${post.title}`}
        description={post.excerpt}
        image={post.featuredImage}
      />

      {/* Hero Header */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Rascunho
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest font-mono">
                <Calendar size={12} /> {post.date}
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      {post.featuredImage && (
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden border border-white/5">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
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
        </div>
      </section>
    </div>
  );
}
