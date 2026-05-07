import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
    ChevronLeft, Calendar, FileText, CheckCircle2, 
    Clock, Download, CreditCard, MessageSquare,
    ExternalLink, Briefcase, Settings, Loader2
} from 'lucide-react';
import ProjectFileVault from '../components/ProjectFileVault';
import { motion } from 'motion/react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProjectData = async () => {
        try {
            const docRef = doc(db, 'projects', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setProject({ id: docSnap.id, ...docSnap.data() });
                
                // Fetch invoices for this project
                const q = query(collection(db, 'billing'), where('project_id', '==', id));
                const invoicesSnap = await getDocs(q);
                setInvoices(invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                navigate('/profile');
            }
        } catch (error) {
            console.error("Error fetching project:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProjectData();
  }, [id, navigate]);

  if (loading) {
    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">
                <Loader2 size={40} />
            </motion.div>
        </div>
    );
  }

  if (!project) return null;

  const currentStep = project.current_step !== undefined ? Number(project.current_step) : 0;

  const timelineSteps = [
    { label: 'Discovery', status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending' },
    { label: 'Planejamento', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending' },
    { label: 'Desenvolvimento', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending' },
    { label: 'QA / Testes', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending' },
    { label: 'Entrega', status: currentStep >= 4 ? 'completed' : 'pending' },
  ];

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-all uppercase text-[10px] font-bold tracking-widest group"
            >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all">
                    <ChevronLeft size={16} />
                </div>
                Voltar ao Perfil
            </button>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                project.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
                Status: {project.status || 'Ativo'}
            </div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-10 border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-[24px] flex items-center justify-center text-blue-500">
                            <Briefcase size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tighter">{project.title}</h1>
                            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-mono mt-1">ID: #{project.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-400 leading-relaxed text-lg">
                            {project.description}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="mt-12 pt-10 border-t border-white/5">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Evolução do Projeto</h3>
                        <div className="relative flex justify-between">
                            <div className="absolute top-4 left-0 w-full h-[1px] bg-white/5 z-0" />
                            {timelineSteps.map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                        step.status === 'completed' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
                                        step.status === 'current' ? 'bg-blue-500/20 border border-blue-500 text-blue-500 animate-pulse' :
                                        'bg-brand-bg border border-white/10 text-gray-700'
                                    }`}>
                                        {step.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                        step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-gray-700'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Assets / Files */}
                <div className="glass-card p-10 border-white/10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Entregáveis & Assets</h3>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{project.assets?.length || 0} Arquivos</span>
                    </div>
                    
                    <ProjectFileVault assets={project.assets || []} />
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
                {/* Financial Summary */}
                <div className="glass-card p-8 border-white/10 bg-gradient-to-br from-blue-600/5 to-transparent">
                    <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="text-blue-500" size={20} />
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Financeiro</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {invoices.length > 0 ? invoices.map((invoice, idx) => (
                             <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                <div>
                                    <p className="text-white font-bold text-sm tracking-tight">R$ {invoice.amount?.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Venc: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                </div>
                             </div>
                        )) : (
                            <p className="text-gray-500 text-xs italic">Nenhuma fatura registrada.</p>
                        )}
                        
                        <button className="w-full py-3 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                            Ver Histórico Completo
                        </button>
                    </div>
                </div>

                {/* Team / Support */}
                <div className="glass-card p-8 border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="text-purple-500" size={20} />
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Atendimento</h3>
                    </div>
                    
                    <p className="text-gray-500 text-xs leading-relaxed mb-6">
                        Sua jornada tecnológica é acompanhada por especialistas. Precise de ajuda imediata?
                    </p>

                    <button 
                        onClick={() => navigate('/contato')}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
                    >
                        Solicitar Suporte
                    </button>
                </div>

                {/* Project Specs */}
                <div className="p-8 border border-white/5 rounded-[32px] space-y-4">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 uppercase font-bold tracking-widest">Início</span>
                        <span className="text-white font-mono">{formatDate(project.createdAt || project.created_at)}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 uppercase font-bold tracking-widest">Previsão</span>
                        <span className="text-white font-mono">{formatDate(project.deadline) || 'A definir'}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 uppercase font-bold tracking-widest">Categoria</span>
                        <span className="text-blue-400">Desenvolvimento Full-Stack</span>
                     </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

const formatDate = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object' && val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString();
    }
    return new Date(val).toLocaleDateString();
};
