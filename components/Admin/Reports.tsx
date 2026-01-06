
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generateMonthlyReportSummary } from '../../geminiService';

interface ReportsProps {
  tickets: Ticket[];
}

const Reports: React.FC<ReportsProps> = ({ tickets }) => {
  const [aiSummary, setAiSummary] = useState<string>('Gerando análise de IA...');
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to start of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Filter tickets based on period or day
  const filteredTickets = useMemo(() => {
    if (selectedDay) {
      return tickets.filter(t => t.createdAt.startsWith(selectedDay));
    }
    return tickets.filter(t => {
      const ticketDate = t.createdAt.split('T')[0];
      return ticketDate >= startDate && ticketDate <= endDate;
    });
  }, [tickets, startDate, endDate, selectedDay]);

  // Group by category
  const categoryData: { name: string; value: number }[] = useMemo(() => {
    return Object.entries(
      filteredTickets.reduce((acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]): { name: string; value: number } => ({ name, value: value as number }));
  }, [filteredTickets]);

  // Group by status
  const statusData: { name: string; value: number }[] = useMemo(() => {
    return Object.entries(
      filteredTickets.reduce((acc: Record<string, number>, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]): { name: string; value: number } => ({ name, value: value as number }));
  }, [filteredTickets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchAiSummary = async () => {
      if (filteredTickets.length > 0) {
        setIsGenerating(true);
        const summary = await generateMonthlyReportSummary(filteredTickets);
        setAiSummary(summary);
        setIsGenerating(false);
      } else {
        setAiSummary("Selecione um período com chamados para gerar análise.");
        setIsGenerating(false);
      }
    };
    fetchAiSummary();
  }, [filteredTickets]);

  const handleExportExcel = () => {
    const headers = ['ID', 'Data', 'Solicitante', 'Setor', 'Categoria', 'Prioridade', 'Status', 'Titulo'];
    const rows = filteredTickets.map(t => [
      t.id,
      new Date(t.createdAt).toLocaleString(),
      t.clientName,
      t.sector,
      t.category,
      t.priority,
      t.status,
      t.title.replace(/,/g, ';')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_helpdesk_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Relatórios de Atendimento</h2>
          <p className="text-slate-500">Métricas, exportação e análise por período</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <span>📊</span> Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <span>📄</span> PDF
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Período de Tempo</label>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedDay('');
                }}
              />
              <span className="text-slate-400">até</span>
              <input 
                type="date" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedDay('');
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Relatório do Dia Específico</label>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setSelectedDay('');
              }}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              Ver Hoje
            </button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Block */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <span className="text-9xl">🤖</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Análise de IA</span>
            <div className="h-1 w-12 bg-indigo-500/30 rounded"></div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Relatório Executivo {selectedDay ? `de ${new Date(selectedDay).toLocaleDateString()}` : `do Período`}</h3>
          {isGenerating ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
            </div>
          ) : (
            <p className="text-indigo-100 leading-relaxed text-lg whitespace-pre-line">
              {aiSummary}
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Total de Chamados</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{filteredTickets.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 text-center">
          <p className="text-xs font-bold text-green-600 uppercase">Resolvidos</p>
          <p className="text-3xl font-black text-green-800 mt-1">{statusData.find(s => s.name === 'Concluído')?.value || 0}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100 text-center">
          <p className="text-xs font-bold text-yellow-600 uppercase">Aguardando</p>
          <p className="text-3xl font-black text-yellow-800 mt-1">{statusData.find(s => s.name === 'Pendente')?.value || 0}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 text-center">
          <p className="text-xs font-bold text-blue-600 uppercase">Maior Problema</p>
          <p className="text-lg font-black text-blue-800 mt-1 truncate">
            {[...categoryData].sort((a, b) => b.value - a.value)[0]?.name || '---'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
        {/* Category Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Demanda por Categoria</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Eficiência de Atendimento</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table view for the selected day or period */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Listagem de Chamados no Período</h4>
          <span className="text-xs font-medium text-slate-500">{filteredTickets.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Assunto</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{t.clientName}</td>
                  <td className="px-4 py-3 font-medium">{t.sector}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{t.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400 italic">
                    Nenhum chamado encontrado para este intervalo.
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

export default Reports;
