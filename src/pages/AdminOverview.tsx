import { motion } from 'motion/react';
import { 
  Users, Briefcase, TrendingUp, Clock, 
  MessageSquare, FileText, Plus, ArrowRight,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';

interface AdminOverviewProps {
  metrics: {
    revenue: number;
    pending: number;
    totalClients: number;
    totalProjects: number;
    totalPosts: number;
    totalMessages: number;
    draftPosts: number;
    chartData: any[];
  };
  recentMessages: any[];
  recentLogs: any[];
  onQuickAction: (type: 'client' | 'project' | 'invoice') => void;
}

export default function AdminOverview({ metrics, recentMessages, recentLogs, onQuickAction }: AdminOverviewProps) {
  const stats = [
    { label: 'Receita Total', value: `R$ ${metrics.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', sub: 'Confirmado' },
    { label: 'Contatos', value: metrics.totalMessages, icon: MessageSquare, color: 'text-blue-400', sub: 'Recebidos' },
    { label: 'Blog Journal', value: metrics.totalPosts, icon: FileText, color: 'text-purple-400', sub: `${metrics.draftPosts} rascunhos` },
    { label: 'Projetos', value: metrics.totalProjects, icon: Briefcase, color: 'text-amber-400', sub: 'Em andamento' },
  ];

  return (
    <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 !rounded-3xl border-white/10 hover:border-white/20 transition-all group overflow-hidden relative"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/5 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="space-y-1">
                <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">{stat.label}</h3>
                <p className="text-2xl font-bold text-white tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-gray-400 lowercase italic">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 !rounded-[40px] border-white/10">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase mb-1">Performance</h2>
                        <p className="text-xl font-semibold text-white">Fluxo de Faturamento</p>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                            />
                            <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Novo Cliente', type: 'client', icon: Plus },
                    { label: 'Novo Projeto', type: 'project', icon: Plus },
                    { label: 'Gerar Fatura', type: 'invoice', icon: Plus },
                ].map((action) => (
                    <button 
                        key={action.label}
                        onClick={() => onQuickAction(action.type as any)}
                        className="p-6 bg-white/[0.03] border border-white/5 rounded-[24px] flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-blue-500/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <action.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Recent Side Column */}
        <div className="space-y-6">
            <div className="glass-card p-8 !rounded-[40px] border-white/10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">Leads</h2>
                        <p className="text-sm font-semibold">Últimos Contatos</p>
                    </div>
                    <Link to="/admin/mensagens" className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="space-y-6 flex-1">
                    {recentMessages.map((msg) => (
                        <div key={msg.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] before:bg-blue-500/20 group hover:before:bg-blue-500 transition-all">
                            <h4 className="text-white font-bold text-xs truncate">{msg.name}</h4>
                            <p className="text-[9px] text-gray-500 uppercase font-mono mb-2">{msg.subject}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                        </div>
                    ))}
                    {recentMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
                            <MessageSquare size={32} className="opacity-20 mb-4" />
                            <p className="text-[10px] uppercase font-bold tracking-widest leading-loose">Silêncio Absoluto</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">Security</h2>
                            <p className="text-sm font-semibold">Atividade Recente</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {recentLogs && recentLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 group">
                                <div className="w-1 h-8 bg-white/5 group-hover:bg-blue-500/50 rounded-full transition-all" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-white/80 font-bold uppercase truncate">{log.details}</p>
                                    <div className="flex justify-between text-[8px] text-gray-500 uppercase font-mono mt-1">
                                        <span>{log.action}</span>
                                        <span>{log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Agora'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!recentLogs || recentLogs.length === 0) && (
                            <p className="text-[10px] text-gray-600 italic">Sem logs recentes.</p>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">System Status</span>
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] uppercase font-bold">Online</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] text-white/40">
                             <span>Firestore Persistence</span>
                             <span className="text-white">Active</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40">
                             <span>API Gateways</span>
                             <span className="text-white">Optimized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
