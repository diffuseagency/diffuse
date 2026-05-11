import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
    User as UserIcon, LogOut, Mail, Hash, Shield, 
    Settings, Briefcase, Calendar, ChevronRight,
    ArrowRight, X, Check, Loader2, CreditCard,
    TrendingUp, Layout, FileText, History, Bell,
    ThumbsUp, ThumbsDown
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import ProjectFileExplorer from '../components/ProjectFileExplorer';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import Skeleton from '../components/ui/Skeleton';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user: currentUser, isUserAdmin: isAdmin, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [recentBilling, setRecentBilling] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'timeline' | 'files' | 'notifications'>('projects');
  
  const [showAllBilling, setShowAllBilling] = useState(false);
  const [allBilling, setAllBilling] = useState<any[]>([]);
  const [loadingAllBilling, setLoadingAllBilling] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
        navigate('/login');
        return;
    }

    if (!currentUser) return;

    const fetchData = async () => {
        try {
            // Fetch Projects
            const qProjects = query(
                collection(db, 'projects'), 
                where('client_email', '==', currentUser.email),
                orderBy('createdAt', 'desc')
            );
            const projectsSnap = await getDocs(qProjects);
            const projectsList = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsList);

            // Fetch Recent Billing
            const qBilling = query(
                collection(db, 'billing'),
                where('client_email', '==', currentUser.email),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const billingSnap = await getDocs(qBilling);
            setRecentBilling(billingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Activity Logs
            const qLogs = query(
                collection(db, 'activity_logs'),
                where('userEmail', '==', currentUser.email),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            const logsSnap = await getDocs(qLogs);
            setActivityLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (e) {
            console.error("Error fetching data:", e);
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    fetchData();

    // Set up real-time notifications
    const qNotif = query(
      collection(db, 'notifications'),
      where('clientEmail', '==', currentUser.email),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeNotif = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
        unsubscribeNotif();
    };
  }, [currentUser, navigate, authLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const activeProjects = projects.filter(p => p.status !== 'completed');
  const unpaidInvoices = recentBilling.filter(b => b.status === 'unpaid' || b.status === 'overdue');
  const pendingNotifications = notifications.filter(n => n.status === 'pending');

  const handleApprove = async (notification: any, approved: boolean) => {
    try {
        setLoading(true);
        // 1. Update notification
        const notifRef = doc(db, 'notifications', notification.id);
        await updateDoc(notifRef, {
            status: approved ? 'approved' : 'rejected',
            respondedAt: new Date()
        });

        // 2. Update asset in project
        const projectRef = doc(db, 'projects', notification.projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            const updatedAssets = projectData.assets.map((asset: any) => 
                asset.id === notification.assetId ? { ...asset, status: approved ? 'approved' : 'rejected' } : asset
            );
            await updateDoc(projectRef, { assets: updatedAssets });
        }

        // 3. Optional: Add activity log
        await addDoc(collection(db, 'activity_logs'), {
            userEmail: currentUser.email,
            action: approved ? 'APROVAÇÃO' : 'REJEIÇÃO',
            details: `${approved ? 'Aprovou' : 'Rejeitou'} o arquivo: ${notification.assetName}`,
            targetId: notification.projectId,
            targetCollection: 'projects',
            timestamp: new Date()
        });

    } catch (e) {
        console.error("Error responding to approval:", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchFullBilling = async () => {
    if (allBilling.length > 0) {
        setShowAllBilling(true);
        return;
    }
    setLoadingAllBilling(true);
    try {
        const q = query(
            collection(db, 'billing'),
            where('client_email', '==', currentUser.email),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setAllBilling(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setShowAllBilling(true);
    } catch (e) {
        console.error("Error fetching all billing:", e);
    } finally {
        setLoadingAllBilling(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <SEO title="Dashboard do Cliente | Diffuse Agency" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-2">
               <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest leading-none">Portal Client</span>
               <span className="text-[10px] text-gray-600 font-mono">v.2.4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
              Bem-vindo, <span className="text-blue-500">{currentUser?.displayName?.split(' ')[0] || 'Cliente'}</span>.
            </h1>
            <p className="text-gray-500 text-sm mt-3 max-w-md font-light leading-relaxed">
              Gerencie seus projetos, visualize entregáveis e acompanhe o fluxo financeiro em tempo real.
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
             >
                <UserIcon size={14} /> Perfil
             </button>
             {isAdmin && (
               <Link 
                  to="/admin" 
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-blue-500 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
               >
                  <Shield size={14} /> Admin
               </Link>
             )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {loading ? (
             [1, 2, 3].map(i => <div key={i} className="glass-card p-8 border-white/10"><Skeleton className="w-24 h-4 mb-2" /><Skeleton className="w-full h-10" /></div>)
           ) : (
             <>
               <div className="glass-card p-8 border-white/10 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Projetos Ativos</p>
                     <h3 className="text-3xl font-bold text-white">{activeProjects.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                     <Layout size={24} />
                  </div>
               </div>
               <div className="glass-card p-8 border-white/10 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">A pagar (Total)</p>
                     <h3 className="text-3xl font-bold text-white">R$ {unpaidInvoices.reduce((acc, b) => acc + (Number(b.amount) || 0), 0).toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                     <CreditCard size={24} />
                  </div>
               </div>
               <div className="glass-card p-8 border-white/10 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status Global</p>
                     <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{activeProjects.length > 0 ? 'Em Evolução' : 'Finalizado'}</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                     <TrendingUp size={24} />
                  </div>
               </div>
             </>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Content Area with Tabs */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-6 border-b border-white/5 pb-2">
                 {[
                   { id: 'projects', label: 'Projetos', icon: Briefcase },
                   { id: 'timeline', label: 'Histórico', icon: History },
                   { id: 'files', label: 'Entregáveis', icon: FileText },
                   { id: 'notifications', label: 'Notificações', icon: Bell },
                 ].map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                       activeTab === tab.id ? "text-blue-500" : "text-gray-500 hover:text-white"
                     )}
                   >
                     <tab.icon size={14} />
                     {tab.label}
                     {tab.id === 'notifications' && pendingNotifications.length > 0 && (
                        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none min-w-[14px]">
                            {pendingNotifications.length}
                        </span>
                     )}
                     {activeTab === tab.id && (
                       <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                     )}
                   </button>
                 ))}
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                   <div className="space-y-4">
                      {[1, 2].map(i => <Skeleton key={i} className="w-full h-32 rounded-[32px]" />)}
                   </div>
                ) : (
                  <>
                    {activeTab === 'projects' && (
                      <motion.div 
                        key="projects"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         {/* ... existing projects loop */}
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <motion.div 
                          key={project.id}
                          whileHover={{ x: 4 }}
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                project.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                              )}>
                                 <Layout size={28} />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{project.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{project.id.slice(0, 8)}</span>
                                   <span className="w-1 h-1 bg-white/10 rounded-full" />
                                   <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{project.status || 'Ativo'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8">
                               <div className="text-right hidden md:block">
                                  <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Progressão</p>
                                  <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                     <div 
                                       className="h-full bg-blue-500" 
                                       style={{ width: `${((Number(project.current_step) + 1) / (project.steps?.length || 5)) * 100}%` }}
                                     />
                                  </div>
                               </div>
                               <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-500 group-hover:text-white group-hover:border-white/30 transition-all">
                                  <ChevronRight size={18} />
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-20 text-center glass-card border-dashed border-white/10 rounded-[40px]">
                         <Briefcase size={40} className="mx-auto text-gray-600 mb-4" />
                         <h3 className="text-white font-bold uppercase tracking-widest text-sm">Pronto para começar?</h3>
                         <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">Você ainda não possui projetos ativos com a Diffuse. Vamos tirar sua ideia do papel?</p>
                         <button onClick={() => navigate('/contato')} className="mt-8 px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">Start Project</button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'timeline' && (
                  <motion.div 
                    key="timeline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {activityLogs.length > 0 ? (
                      <div className="relative pl-8 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                        {activityLogs.map((log, idx) => (
                          <div key={log.id} className="relative group">
                            <div className="absolute -left-8 top-1.5 w-4 h-4 bg-brand-bg border-4 border-blue-500 rounded-full z-10" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{log.action}</span>
                                     <span className="text-[10px] text-gray-600">•</span>
                                     <span className="text-[10px] text-gray-600 uppercase font-mono">{log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : ''}</span>
                                  </div>
                                  <p className="text-white text-sm font-medium tracking-tight">{log.details}</p>
                                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-mono">ID: {log.targetId.slice(0, 8)}</p>
                               </div>
                               <span className="text-[10px] text-gray-600 font-mono">
                                 {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleDateString() : ''}
                               </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-20 text-center glass-card border-dashed border-white/10 rounded-[40px]">
                         <History size={40} className="mx-auto text-gray-600 mb-4" />
                         <p className="text-gray-500 text-[10px] items-center uppercase font-bold tracking-widest">Nenhuma atividade registrada recentemente.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div 
                    key="files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ProjectFileExplorer files={projects.flatMap(p => p.assets || [])} />
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div 
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                    notif.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : 
                                    notif.status === 'approved' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {notif.type === 'approval_request' ? <FileText size={20} /> : <Bell size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold tracking-tight uppercase text-sm">{notif.projectTitle}</h4>
                                    <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-widest">
                                        {notif.timestamp?.seconds ? new Date(notif.timestamp.seconds * 1000).toLocaleString() : ''}
                                    </p>
                                </div>
                            </div>

                            {notif.status === 'pending' ? (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleApprove(notif, true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <ThumbsUp size={12} /> Aprovar
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(notif, false)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <ThumbsDown size={12} /> Recusar
                                    </button>
                                </div>
                            ) : (
                                <div className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                    notif.status === 'approved' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {notif.status === 'approved' ? 'Aprovado' : 'Recusado'}
                                </div>
                            )}
                        </div>
                      ))
                    ) : (
                        <div className="p-20 text-center glass-card border-dashed border-white/10 rounded-[40px]">
                            <Bell size={40} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Nenhuma notificação por enquanto.</p>
                        </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
           </div>

           {/* Financial Context */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 <CreditCard size={20} className="text-purple-500" /> Financeiro Recente
              </h2>

              <div className="glass-card p-8 border-white/10 space-y-6">
                 {recentBilling.length > 0 ? (
                   <div className="space-y-4">
                     {recentBilling.map((bill) => (
                       <div key={bill.id} className="group pb-4 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">#{bill.id.slice(0, 6)}</span>
                             <span className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                               bill.status === 'paid' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"
                             )}>
                               {bill.status === 'paid' ? 'Pago' : 'Pendente'}
                             </span>
                          </div>
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-sm font-bold text-white tracking-tight">R$ {Number(bill.amount).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-600 mt-1">Vencimento: {new Date(bill.dueDate).toLocaleDateString()}</p>
                             </div>
                             {bill.status !== 'paid' && (
                               <button className="text-[10px] font-bold text-blue-500 hover:text-white transition-colors uppercase tracking-widest">Pagar <ArrowRight size={10} className="inline ml-1" /></button>
                             )}
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="py-10 text-center italic text-gray-600 text-xs">Sem registros financeiros recentes.</div>
                 )}
                 
                 <div className="pt-4 mt-2 border-t border-white/5">
                    <button 
                       onClick={fetchFullBilling}
                       disabled={loadingAllBilling}
                       className="w-full py-4 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4"
                    >
                       {loadingAllBilling ? <Loader2 size={14} className="animate-spin" /> : 'Ver Histórico Completo'}
                    </button>
                    <p className="text-[10px] text-blue-500/60 uppercase font-bold tracking-widest mb-4">Suporte Administrativo</p>
                    <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-[24px]">
                       <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                          <FileText size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Solicitar Nota Fiscal</p>
                          <button className="text-[10px] text-gray-600 hover:text-white transition-colors">financeiro@diffuse.agency</button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Security / Activity */}
              <div className="p-8 border border-white/5 rounded-[32px] bg-gradient-to-tr from-white/[0.01] to-transparent">
                 <div className="flex items-center gap-3 mb-4">
                    <Shield size={16} className="text-green-500" />
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Conectividade Segura</p>
                 </div>
                 <p className="text-[10px] text-gray-600 leading-relaxed font-mono">
                    Sua conexão está protegida por encriptação AES-256 de ponta a ponta. Último acesso: {new Date().toLocaleString()}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Full Billing Modal */}
      <AnimatePresence>
        {showAllBilling && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAllBilling(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-brand-bg border border-white/10 rounded-[40px] p-10 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tighter">Histórico Financeiro</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Todos os registros vinculados a {currentUser?.email}</p>
                        </div>
                        <button onClick={() => setShowAllBilling(false)} className="text-gray-500 hover:text-white p-2">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {allBilling.map((bill) => (
                            <div key={bill.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold tracking-tight">Fatura #{bill.id.slice(0, 8)}</h4>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">ID: {bill.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-white">R$ {Number(bill.amount).toLocaleString()}</p>
                                    <div className="flex items-center gap-2 justify-end mt-1">
                                        <span className="text-[10px] text-gray-500">{new Date(bill.dueDate).toLocaleDateString()}</span>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                            bill.status === 'paid' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {bill.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Background Decorative */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
