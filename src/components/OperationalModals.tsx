import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';

// --- Schemas ---

const clientSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  company: z.string().min(2, 'Empresa obrigatória'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(2, 'Título muito curto'),
  client_id: z.string().min(1, 'Cliente obrigatório'),
  client_name: z.string().min(1, 'Nome do cliente obrigatório'),
  description: z.string().min(10, 'Descrição detalhada necessária'),
  budget: z.coerce.number().min(0, 'Orçamento inválido'),
  status: z.enum(['active', 'completed', 'on-hold', 'discovery']),
  deadline: z.string().optional(),
});

const invoiceSchema = z.object({
  project_id: z.string().min(1, 'Projeto obrigatório'),
  project_title: z.string().min(1, 'Título do projeto obrigatório'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento obrigatória'),
  status: z.enum(['paid', 'unpaid', 'overdue']),
});

// --- Components ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card p-8 w-full max-w-lg border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ClientForm = ({ initialData, onSubmit, loading }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome Completo</label>
        <input {...register('name')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
        {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.name.message as string}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Empresa / Razão Social</label>
        <input {...register('company')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
        {errors.company && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.company.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail</label>
          <input {...register('email')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.email.message as string}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telefone</label>
          <input {...register('phone')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {initialData?.id ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
      </button>
    </form>
  );
};

export const ProjectForm = ({ initialData, clients, onSubmit, loading }: any) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || { status: 'active' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Título do Projeto</label>
        <input {...register('title')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
        {errors.title && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.title.message as string}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cliente Responsável</label>
        <select 
          {...register('client_id')} 
          onChange={(e) => {
            const client = clients.find((c: any) => c.id === e.target.value);
            if (client) setValue('client_name', client.name);
          }}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
        >
          <option value="">Selecione um cliente...</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
          ))}
        </select>
        <input type="hidden" {...register('client_name')} />
        {errors.client_id && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.client_id.message as string}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
        <textarea {...register('description')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
        {errors.description && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.description.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Orçamento (R$)</label>
          <input type="number" step="0.01" {...register('budget')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          {errors.budget && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.budget.message as string}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
          <select {...register('status')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
            <option value="discovery">Discovery</option>
            <option value="active">Em Andamento</option>
            <option value="on-hold">Pausado</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-500 transition-all shadow-lg flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {initialData?.id ? 'Atualizar Projeto' : 'Lançar Projeto'}
      </button>
    </form>
  );
};

export const InvoiceForm = ({ initialData, projects, onSubmit, loading }: any) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || { status: 'unpaid' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Projeto Referente</label>
        <select 
          {...register('project_id')} 
          onChange={(e) => {
            const project = projects.find((p: any) => p.id === e.target.value);
            if (project) setValue('project_title', project.title);
          }}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
        >
          <option value="">Selecione o projeto...</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <input type="hidden" {...register('project_title')} />
        {errors.project_id && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.project_id.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valor da Fatura (R$)</label>
          <input type="number" step="0.01" {...register('amount')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          {errors.amount && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.amount.message as string}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vencimento</label>
          <input type="date" {...register('due_date')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          {errors.due_date && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.due_date.message as string}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status Inicial</label>
        <select {...register('status')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
          <option value="unpaid">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Atrasado</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-lg flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {initialData?.id ? 'Atualizar Fatura' : 'Gerar Fatura'}
      </button>
    </form>
  );
};
