import React from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Shield, CreditCard } from 'lucide-react';

interface InvoiceGeneratorProps {
  invoice: {
    project_title: string;
    amount: number;
    due_date: string;
    status: string;
  };
  agencySettings: any;
  onClose: () => void;
}

export default function InvoiceGenerator({ invoice, agencySettings, onClose }: InvoiceGeneratorProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white text-slate-900 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-auto"
      >
        {/* Invoice Body */}
        <div className="flex-1 p-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-16">
            <div>
              <h2 className="text-4xl font-display font-light tracking-tighter mb-2 italic">Invoice</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ref: #INV-{Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
            <div className="text-right">
               <p className="font-bold text-sm">{agencySettings.agency_name || 'Diffuse Web Agency'}</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest">Premium Development</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-16">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-4">Informações do Projeto</p>
              <h3 className="text-xl font-medium">{invoice.project_title}</h3>
              <p className="text-sm text-slate-500 mt-2">Serviços de desenvolvimento e consultoria web de alta performance.</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-4">Prazos</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Vencimento: {new Date(invoice.due_date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">Emissão: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 mt-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 text-sm">Valor Base</span>
              <span className="font-medium text-sm">R$ {invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 text-sm">Impostos & Taxas</span>
              <span className="font-medium text-sm">R$ 0,00</span>
            </div>
            <div className="flex justify-between items-center pt-8 border-t border-slate-100">
              <span className="text-xl font-display italic">Total Devido</span>
              <span className="text-3xl font-bold tracking-tighter">R$ {invoice.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <Shield className="text-blue-600" size={24} />
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Garantia de Qualidade</p>
               <p className="text-xs text-slate-600">Este documento possui validade fiscal e jurídica conforme os termos de serviço.</p>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="w-full md:w-64 bg-slate-900 p-12 flex flex-col justify-between">
           <div className="space-y-4">
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <Download size={14} /> Baixar PDF
              </button>
              <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10">
                <Share2 size={14} /> Compartilhar
              </button>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20">
                <CreditCard size={14} /> Pagar Agora
              </button>
           </div>

           <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest text-center">
             Fechar Visualização
           </button>
        </div>
      </motion.div>
    </div>
  );
}
