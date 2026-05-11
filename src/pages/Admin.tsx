import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, Briefcase, 
  CreditCard, Search, User,
  Plus, Bell, LogOut, TrendingUp,
  Clock, Edit, MessageSquare, Trash2, Mail,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import CMSManager from './CMSManager';
import DetailedFinance from './DetailedFinance';
import AdminOverview from './AdminOverview';
import InvoiceGenerator from '../components/InvoiceGenerator';
import ProjectAssetManager from '../components/ProjectAssetManager';
import LeadNotifier from '../components/LeadNotifier';
import ConfirmationModal from '../components/ConfirmationModal';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { 
  collection, 
  getDocs, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/useSiteSettings';
import { useFirestoreCollection, deleteFirestoreDoc, updateFirestoreDoc, addFirestoreDoc } from '../lib/cmsHooks';
import { Modal, ClientForm, ProjectForm, InvoiceForm } from '../components/OperationalModals';

// --- Components ---

const AdminSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Conteúdo Site', path: '/admin/cms', icon: Edit },
    { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
    { name: 'Mensagens', path: '/admin/mensagens', icon: MessageSquare },
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Projetos', path: '/admin/projetos', icon: Briefcase },
    { name: 'Faturamento', path: '/admin/financeiro', icon: CreditCard },
    { name: 'Perfil', path: '/profile', icon: User },
  ];

  return (
    <div className="w-64 bg-brand-bg/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 flex flex-col pt-8">
      <div className="px-6 mb-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold tracking-widest uppercase text-white text-xs">Diffuse Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/'; }} className="flex items-center space-x-3 px-4 py-3 text-white/40 hover:text-white transition-all text-sm w-full">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ metrics }: { metrics: any }) => {
  if (!metrics) return <div className="p-8">Carregando métricas...</div>;

  const stats = [
    { label: 'Total Recebido', value: `R$ ${metrics.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Pendente', value: `R$ ${metrics.pending.toLocaleString()}`, icon: Clock, color: 'text-amber-400' },
    { label: 'Clientes Ativos', value: metrics.totalClients, icon: Users, color: 'text-blue-400' },
    { label: 'Projetos', value: metrics.totalProjects, icon: Briefcase, color: 'text-purple-400' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 !rounded-3xl border-white/10 hover:border-white/20 transition-all group overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 !rounded-[40px] border-white/10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Performance Mensal</h2>
              <p className="text-xl font-semibold">Receita por Mês</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
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

        <div className="bg-zinc-900 border border-white/5 p-8 rounded-2xl">
          <h3 className="text-lg font-medium mb-8">Fluxo de Caixa</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4, fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableHeader = ({ title, results, onAdd }: { title: string, results: number, onAdd?: () => void }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="text-white/40 text-sm mt-1">{results} registros encontrados</p>
    </div>
    <div className="flex gap-4 w-full md:w-auto">
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          className="w-full bg-zinc-900 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
        />
      </div>
      {onAdd && (
        <button onClick={onAdd} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/90">
          <Plus size={18} /> Novo
        </button>
      )}
    </div>
  </div>
);

const formatDate = (val: any) => {
  if (!val) return 'Data desconhecida';
  if (typeof val === 'object' && val.seconds) {
    return new Date(val.seconds * 1000).toLocaleDateString();
  }
  return new Date(val).toLocaleDateString();
};

const ClientList = ({ clients, onEdit, onAdd, onDelete }: { clients: any[], onEdit: (c: any) => void, onAdd: () => void, onDelete: (id: string) => void }) => (
  <div className="p-8 animate-in fade-in duration-500">
    <TableHeader title="Gerenciamento de Clientes" results={clients.length} onAdd={onAdd} />
    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
            <tr>
              <th className="px-6 py-4 font-normal">Nome / Empresa</th>
              <th className="px-6 py-4 font-normal">E-mail</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal">Data</th>
              <th className="px-6 py-4 font-normal text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{client.name}</span>
                    <span className="text-xs text-white/40">{client.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/60 whitespace-nowrap">{client.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[10px] uppercase font-bold">Ativo</span>
                </td>
                <td className="px-6 py-4 text-sm text-white/40 whitespace-nowrap">{formatDate(client.createdAt || client.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(client)}
                      className="text-white/20 hover:text-white transition-all text-xs border border-white/10 px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(client.id)}
                      className="p-1.5 text-red-500/40 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ProjectList = ({ projects, onEdit, onAdd, onDelete, onManageAssets }: { projects: any[], onEdit: (p: any) => void, onAdd: () => void, onDelete: (id: string) => void, onManageAssets: (p: any) => void }) => (
  <div className="p-8 animate-in fade-in duration-500">
    <TableHeader title="Projetos" results={projects.length} onAdd={onAdd} />
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all flex flex-col group relative">
          <button 
            onClick={() => onDelete(project.id)}
            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={14} />
          </button>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
              project.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              project.status === 'active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
              'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {project.status === 'completed' ? 'Concluído' : project.status === 'active' ? 'Em Andamento' : 'Discovery'}
            </span>
            <span className="text-xl font-bold tracking-tighter text-white">R$ {project.budget?.toLocaleString() || 0}</span>
          </div>
          <h3 className="text-lg font-medium mb-1 text-white">{project.title}</h3>
          <p className="text-white/40 text-[10px] mb-4 uppercase font-bold tracking-widest">{project.client_name}</p>
          <p className="text-white/60 text-sm mb-6 line-clamp-2 h-10">{project.description}</p>
          <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/40">
            <span>Criado em {formatDate(project.createdAt || project.created_at)}</span>
            <div className="flex gap-4">
              <button 
                onClick={() => onEdit(project)} 
                className="text-blue-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
              >
                Editar
              </button>
              <button 
                onClick={() => onManageAssets?.(project)} 
                className="text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-blue-400 transition-all"
              >
                Arquivos
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BillingList = ({ billing, onEdit, onAdd, onDelete, onPreview }: { billing: any[], onEdit: (b: any) => void, onAdd: () => void, onDelete: (id: string) => void, onPreview: (b: any) => void }) => (
  <div className="p-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-8">
      <TableHeader title="Faturamento & Cobrança" results={billing.length} onAdd={onAdd} />
      <Link to="/admin/financeiro-detalhado" className="px-6 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2">
        <TrendingUp size={14} /> Análise Detalhada
      </Link>
    </div>
    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
            <tr>
              <th className="px-6 py-4 font-normal">Projeto</th>
              <th className="px-6 py-4 font-normal">Valor</th>
              <th className="px-6 py-4 font-normal">Vencimento</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {billing.map((bill) => (
              <tr key={bill.id} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">{bill.project_title}</td>
                <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">R$ {bill.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-white/40 whitespace-nowrap">{new Date(bill.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                    bill.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {bill.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onPreview(bill)}
                      className="text-blue-500 hover:text-white transition-all text-[10px] uppercase font-bold border border-blue-500/20 px-3 py-1 rounded"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => onEdit(bill)}
                      className="text-white/60 hover:text-white transition-all rounded p-2 text-xs uppercase font-bold tracking-widest"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(bill.id)}
                      className="p-2 text-red-500/40 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const NewsletterLeadList = () => {
    const { data: leads, loading } = useFirestoreCollection<any>('newsletter_leads', [orderBy('createdAt', 'desc')]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

    const exportToCSV = () => {
        if (!leads || leads.length === 0) return;
        
        // Headers
        const headers = ['Email', 'Status', 'Data Inscrição'];
        
        // Format rows
        const rows = leads.map(lead => [
            lead.email,
            lead.status || 'active',
            lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleString() : ''
        ]);

        // Build CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_newsletter_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8">Carregando leads...</div>;

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <ConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={async () => {
                    if (deleteConfirm) {
                        await deleteFirestoreDoc('newsletter_leads', deleteConfirm.id);
                        setDeleteConfirm(null);
                    }
                }}
                title="Excluir Lead"
                message="Deseja realmente remover este e-mail da lista? O usuário deixará de receber comunicações."
                confirmText="Excluir"
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-medium">Newsletter Leads</h2>
                    <p className="text-white/40 text-sm mt-1">{leads.length} inscritos confirmados</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    disabled={leads.length === 0}
                    className="bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                    <Mail size={16} /> Exportar CSV
                </button>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                            <tr>
                                <th className="px-6 py-4 font-bold">E-mail</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Data</th>
                                <th className="px-6 py-4 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm text-white">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[8px] uppercase font-bold tracking-widest">
                                            {lead.status || 'Ativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-white/40 font-mono whitespace-nowrap">
                                        {formatDate(lead.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setDeleteConfirm({ id: lead.id })}
                                            className="p-2 text-red-500/40 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic text-[10px] uppercase tracking-widest">
                                        Nenhum lead inscrito até o momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MessageList = () => {
    const { data: messages, loading } = useFirestoreCollection<any>('messages', [orderBy('createdAt', 'desc')]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

    if (loading) return <div className="p-8">Carregando mensagens...</div>;

    return (
        <div className="p-8 animate-in fade-in duration-500">
            <ConfirmationModal 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={async () => {
                    if (deleteConfirm) {
                        await deleteFirestoreDoc('messages', deleteConfirm.id);
                        setDeleteConfirm(null);
                    }
                }}
                title="Excluir Mensagem"
                message="Deseja realmente remover esta mensagem de contato? Esta ação não pode ser revertida."
                confirmText="Excluir"
            />
            <TableHeader title="Mensagens de Contato" results={messages.length} />
            <div className="grid gap-6">
                {messages.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-500 uppercase tracking-widest text-xs">
                        Nenhuma mensagem encontrada.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`glass-card p-8 border-white/5 group hover:border-white/20 transition-all flex justify-between items-start relative ${!msg.read ? 'bg-white/[0.02] border-blue-500/30' : ''}`}>
                            {!msg.read && (
                                <div className="absolute top-8 right-16 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Nova</span>
                                </div>
                            )}
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!msg.read ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <Mail size={14} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold tracking-tight">{msg.name}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase font-mono">{msg.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-200 uppercase tracking-[0.2em] mb-1">{msg.subject}</p>
                                    <p className="text-gray-400 text-sm leading-relaxed">{msg.message}</p>
                                </div>
                                {msg.source_url && (
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Origem do Lead</span>
                                            <a href={msg.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-white transition-colors truncate max-w-xs">{msg.source_url}</a>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Referrer</span>
                                            <span className="text-[10px] text-gray-400 italic">{msg.referrer || 'direto'}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 pt-4">
                                    <p className="text-[10px] text-white/20 uppercase font-mono">
                                        {formatDate(msg.createdAt)}
                                    </p>
                                    {!msg.read && (
                                        <button 
                                            onClick={() => updateFirestoreDoc('messages', msg.id, { read: true })}
                                            className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
                                        >
                                            Marcar como lida
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setDeleteConfirm({ id: msg.id })}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Main Admin Wrapper ---

export default function Admin() {
  const { data: clients } = useFirestoreCollection<any>('clients');
  const { data: projects } = useFirestoreCollection<any>('projects');
  const { data: billing } = useFirestoreCollection<any>('billing');
  const { data: posts } = useFirestoreCollection<any>('posts');
  const { data: messages } = useFirestoreCollection<any>('messages', [orderBy('createdAt', 'desc')]);
  const { data: activityLogs } = useFirestoreCollection<any>('activity_logs', [orderBy('timestamp', 'desc')]);
  const { settings } = useSiteSettings();

  const [modalType, setModalType] = useState<'client' | 'project' | 'invoice' | null>(null);
  const [assetProject, setAssetProject] = useState<any>(null);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, collection: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => {
    const paid = billing.filter(b => b.status === 'paid').reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    const pending = billing.filter(b => b.status === 'unpaid').reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    
    // Group real billing by month
    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Initialize current year months up to now
    const currentMonth = new Date().getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      monthlyData[months[i]] = 0;
    }

    billing.filter(b => b.status === 'paid').forEach(bill => {
      const date = bill.createdAt?.seconds ? new Date(bill.createdAt.seconds * 1000) : new Date();
      const monthName = months[date.getMonth()];
      monthlyData[monthName] = (monthlyData[monthName] || 0) + (Number(bill.amount) || 0);
    });

    const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
    
    return {
      revenue: paid,
      pending,
      totalClients: clients.length,
      totalProjects: projects.length,
      totalPosts: posts.length,
      totalMessages: messages.length,
      draftPosts: posts.filter(p => p.status !== 'published').length,
      chartData: chartData.length > 0 ? chartData : [{ month: 'Jan', revenue: 0 }]
    };
  }, [clients, projects, billing, posts, messages]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
        const collectionName = modalType === 'client' ? 'clients' : modalType === 'project' ? 'projects' : 'billing';
        if (editingData?.id) {
            await updateFirestoreDoc(collectionName, editingData.id, { ...data, updatedAt: serverTimestamp() });
        } else {
            await addFirestoreDoc(collectionName, { ...data, createdAt: serverTimestamp() });
        }
        setModalType(null);
        setEditingData(null);
    } catch (error) {
        handleFirestoreError(error, editingData?.id ? OperationType.UPDATE : OperationType.CREATE, modalType === 'client' ? 'clients' : modalType === 'project' ? 'projects' : 'billing');
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
        if (deleteConfirm.collection === 'clients') {
            // Cascading delete: projects and invoices
            const clientProjects = projects.filter(p => p.client_id === deleteConfirm.id);
            const projectIds = clientProjects.map(p => p.id);
            const clientBilling = billing.filter(b => projectIds.includes(b.project_id));

            await Promise.all([
                ...clientBilling.map(b => deleteFirestoreDoc('billing', b.id)),
                ...clientProjects.map(p => deleteFirestoreDoc('projects', p.id)),
                deleteFirestoreDoc('clients', deleteConfirm.id)
            ]);
        } else {
            await deleteFirestoreDoc(deleteConfirm.collection, deleteConfirm.id);
        }
        setDeleteConfirm(null);
    } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, deleteConfirm?.collection || 'unknown');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg text-gray-300 relative overflow-hidden">
       {/* Admin Background Blobs */}
       <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[0] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      <AdminSidebar />
      <div className="flex-1 min-w-0 bg-transparent relative z-10">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-brand-bg/50 backdrop-blur-xl z-40">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Gestão Administrativa</div>
          <div className="flex items-center space-x-6">
            <button className="text-white/40 hover:text-white transition-all relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
              <div className="text-right">
                <div className="text-sm font-medium italic">Diffuse Admin</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Super User</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/5">
                IN
              </div>
            </div>
          </div>
        </header>

        {/* Modals */}
        <Modal 
            isOpen={!!modalType} 
            onClose={() => { setModalType(null); setEditingData(null); }} 
            title={editingData ? `Editar ${modalType}` : `Novo ${modalType}`}
        >
            {modalType === 'client' && <ClientForm initialData={editingData} onSubmit={handleSubmit} loading={loading} />}
            {modalType === 'project' && <ProjectForm initialData={editingData} clients={clients} onSubmit={handleSubmit} loading={loading} />}
            {modalType === 'invoice' && <InvoiceForm initialData={editingData} projects={projects} onSubmit={handleSubmit} loading={loading} />}
        </Modal>

        <ConfirmationModal 
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={handleConfirmDelete}
            title={`Excluir ${deleteConfirm?.collection === 'clients' ? 'Cliente' : 'Item'}`}
            message={deleteConfirm?.collection === 'clients' 
                ? "Deseja realmente excluir este cliente? Isso removerá permanentemente todos os projetos e faturas vinculados a ele."
                : "Deseja realmente remover este item? Esta ação não pode ser revertida."
            }
            confirmText="Excluir"
        />

        <Routes>
          <Route index element={
            <AdminOverview 
                metrics={metrics} 
                recentMessages={messages.slice(0, 3)} 
                recentLogs={activityLogs.slice(0, 5)}
                onQuickAction={(type) => setModalType(type)} 
            />
          } />
          <Route path="cms" element={<CMSManager />} />
          <Route path="newsletter" element={<NewsletterLeadList />} />
          <Route path="mensagens" element={<MessageList />} />
          <Route path="clientes" element={<ClientList clients={clients} onAdd={() => setModalType('client')} onEdit={(c) => { setEditingData(c); setModalType('client'); }} onDelete={(id) => setDeleteConfirm({ id, collection: 'clients' })} />} />
          <Route path="projetos" element={<ProjectList projects={projects} onAdd={() => setModalType('project')} onEdit={(p) => { setEditingData(p); setModalType('project'); }} onDelete={(id) => setDeleteConfirm({ id, collection: 'projects' })} onManageAssets={(p) => setAssetProject(p)} />} />
          <Route path="financeiro" element={<BillingList billing={billing} onAdd={() => setModalType('invoice')} onEdit={(b) => { setEditingData(b); setModalType('invoice'); }} onDelete={(id) => setDeleteConfirm({ id, collection: 'billing' })} onPreview={(b) => setPreviewInvoice(b)} />} />
          <Route path="financeiro-detalhado" element={<DetailedFinance />} />
        </Routes>

        <LeadNotifier />

        {previewInvoice && (
          <InvoiceGenerator 
            invoice={previewInvoice} 
            agencySettings={settings} 
            onClose={() => setPreviewInvoice(null)} 
          />
        )}

        {assetProject && (
          <ProjectAssetManager 
            project={assetProject} 
            onClose={() => setAssetProject(null)} 
            onUpdate={async () => {
              // The useFirestoreCollection hook will auto-update or we can force it if needed
              // But for now, we just close and set null to refresh data if we fetch properly
              setAssetProject({ ...assetProject }); // Simple trick to force re-render if needed
            }} 
          />
        )}
      </div>
    </div>
  );
}
