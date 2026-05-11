import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Download, Calendar, 
  ArrowLeft, PieChart as PieIcon, 
  FileText, ArrowDownToLine, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, 
  Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Link } from 'react-router-dom';
import { useBusinessMetrics } from '../lib/useBusinessMetrics';
import { jsPDF } from 'jspdf';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function DetailedFinance() {
  const { metrics, loading } = useBusinessMetrics();

  const detailedMetrics = useMemo(() => {
    if (loading || !metrics) return null;

    const { rawBilling: billing, rawProjects: projects } = metrics;

    const paid = billing.filter((b: any) => b.status === 'paid');
    const pending = billing.filter((b: any) => b.status === 'unpaid');

    // Revenue by category (cross-reference with projects)
    const categoryMap: Record<string, number> = {};
    billing.forEach((bill: any) => {
      const project = projects.find((p: any) => p.title === bill.project_title || p.id === bill.projectId);
      const category = project?.category || 'Outros';
      categoryMap[category] = (categoryMap[category] || 0) + Number(bill.amount);
    });

    const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Annual comparison (Current Year vs Last Year)
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const yearlyData = [
      { year: lastYear, revenue: 0 },
      { year: currentYear, revenue: 0 },
    ];

    billing.forEach((bill: any) => {
      const date = new Date(bill.due_date);
      const year = date.getFullYear();
      if (year === currentYear) yearlyData[1].revenue += Number(bill.amount);
      if (year === lastYear) yearlyData[0].revenue += Number(bill.amount);
    });

    return {
      ...metrics,
      pieData,
      yearlyData
    };
  }, [metrics, loading]);

  const exportCSV = () => {
    if (!metrics) return;
    const headers = ['Projeto', 'Valor', 'Vencimento', 'Status'];
    const rows = metrics.rawBilling.map((b: any) => [
      b.project_title,
      b.amount,
      b.due_date,
      b.status === 'paid' ? 'Pago' : 'Pendente'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportPDF = () => {
    if (!detailedMetrics) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório Financeiro Administrativo - Diffuse Agency', 20, 20);
    doc.setFontSize(12);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text('Resumo de Métricas:', 20, 50);
    doc.text(`Receita Total Liquidada: R$ ${detailedMetrics.totalRevenue.toLocaleString()}`, 25, 60);
    doc.text(`Ticket Médio: R$ ${detailedMetrics.averageTicket.toLocaleString()}`, 25, 70);
    doc.text(`Taxa de Conversão: ${detailedMetrics.closingRate.toFixed(1)}%`, 25, 80);

    doc.text('Distribuição por Categoria:', 20, 100);
    detailedMetrics.pieData.forEach((item, idx) => {
      doc.text(`${item.name}: R$ ${item.value.toLocaleString()}`, 25, 110 + (idx * 10));
    });

    doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading || !detailedMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10">
        <div className="flex items-center gap-6">
          <Link to="/admin/financeiro" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Análise Financeira Avançada</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Business Intelligence Dashboard</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowDownToLine size={14} /> Relatório PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Pillar */}
        <div className="space-y-6">
          <div className="glass-card p-8 !rounded-[40px] border-white/10 bg-gradient-to-br from-green-500/10 to-transparent">
            <div className="flex justify-between items-center mb-6">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded font-bold uppercase">+12% vs mês anterior</span>
            </div>
            <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Liquidado</h3>
            <p className="text-4xl font-bold text-white tracking-tighter">R$ {detailedMetrics.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="glass-card p-8 !rounded-[40px] border-white/10">
            <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-6">Faturamento por Categoria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detailedMetrics.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {detailedMetrics.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
               {detailedMetrics.pieData.map((item, idx) => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                   <span className="text-[10px] uppercase font-bold text-gray-500 truncate">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 !rounded-[40px] border-white/10">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-xl font-bold text-white">Crescimento Anual</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Comparativo direto consolidado</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Ano Anterior</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Ano Atual</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detailedMetrics.yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 !rounded-[40px] border-white/10 flex flex-col justify-center items-center text-center">
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-3xl mb-6">
                <PieIcon size={32} />
              </div>
              <h4 className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">Tickets Médios</h4>
              <p className="text-2xl font-bold">R$ {detailedMetrics.averageTicket.toLocaleString()}</p>
            </div>
            <div className="glass-card p-8 !rounded-[40px] border-white/10 flex flex-col justify-center items-center text-center">
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-3xl mb-6">
                <FileText size={32} />
              </div>
              <h4 className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">Taxa de Conversão</h4>
              <p className="text-2xl font-bold">{detailedMetrics.closingRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
