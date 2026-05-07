import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
    User as UserIcon, LogOut, Mail, Hash, Shield, 
    Settings, Briefcase, Calendar, ChevronRight,
    ArrowRight
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchUserProjects = async () => {
        try {
            const q = query(collection(db, 'projects'), where('client_id', '==', user.uid));
            const snap = await getDocs(q);
            setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error('Error fetching projects:', e);
        } finally {
            setLoading(false);
        }
    };

    fetchUserProjects();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-8 border-white/10">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 p-1 shadow-xl shadow-blue-500/20">
                        <div className="w-full h-full bg-brand-bg rounded-full flex items-center justify-center">
                            <UserIcon size={40} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-widest">{user.displayName || 'Cliente Diffuse'}</h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-widest">Portal do Cliente</p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <Mail size={16} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email</p>
                            <p className="text-white text-sm truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                            <Shield size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Acesso</p>
                            <p className="text-white text-sm">Cliente Verificado</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white group">
                        <div className="flex items-center gap-3">
                            <Settings size={18} />
                            <span className="text-sm font-medium">Configurações</span>
                        </div>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/5 transition-all text-gray-400 hover:text-red-500 group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Encerrar Sessão</span>
                        </div>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 border-white/10">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Meus Projetos</span>
                        <h2 className="text-3xl font-bold text-white tracking-tighter mt-2">Acompanhamento</h2>
                    </div>
                    <Link to="/contato" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all underline decoration-blue-500 underline-offset-4">Novo Projeto</Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">
                            <Settings size={32} />
                        </motion.div>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div key={project.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{project.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                                                {project.status || 'Iniciado'}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Calendar size={10} />
                                                <span className="text-[10px] uppercase font-bold tracking-widest">Fev 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-20 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">Nenhum projeto ativo</h3>
                        <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                            Você ainda não possui projetos em andamento conosco. Deseja iniciar uma nova jornada tecnológica?
                        </p>
                        <button onClick={() => navigate('/contato')} className="mt-6 px-8 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                            Iniciar Projeto
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-8 bg-gradient-to-br from-blue-600/20 to-transparent rounded-[32px] border border-white/5 shadow-xl">
                    <h3 className="text-white font-bold text-lg mb-2">Suporte Técnico</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Dúvidas sobre o seu projeto? Nossa equipe está pronta para ajudar.</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all">
                        Abrir chamado <ArrowRight size={14} />
                    </button>
                </div>
                <div className="p-8 bg-gradient-to-br from-purple-600/20 to-transparent rounded-[32px] border border-white/5 shadow-xl">
                    <h3 className="text-white font-bold text-lg mb-2">Financeiro</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Acesse faturas, orçamentos e informações de pagamento.</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-all">
                        Ver faturas <ArrowRight size={14} />
                    </button>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
