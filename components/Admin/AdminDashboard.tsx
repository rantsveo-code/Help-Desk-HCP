
import React, { useState, useEffect } from 'react';
import { User, Ticket, TicketStatus } from '../../types';
import Reports from './Reports';

interface AdminDashboardProps {
  user: User;
  view: 'dashboard' | 'all-tickets' | 'reports';
  setView: (view: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, view, setView }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'Todos'>('Todos');

  useEffect(() => {
    refreshTickets();
  }, []);

  const refreshTickets = () => {
    const saved = localStorage.getItem('helpdesk_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    }
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, notes?: string) => {
    const updated = tickets.map(t => 
      t.id === ticketId ? { ...t, status, resolutionNotes: notes || t.resolutionNotes, updatedAt: new Date().toISOString() } : t
    );
    setTickets(updated);
    localStorage.setItem('helpdesk_tickets', JSON.stringify(updated));
  };

  const filteredTickets = statusFilter === 'Todos' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pendente').length,
    inProgress: tickets.filter(t => t.status === 'Em Andamento').length,
    resolved: tickets.filter(t => t.status === 'Concluído').length,
  };

  if (view === 'reports') {
    return <Reports tickets={tickets} />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900">Painel de Controle TI</h2>
        <p className="text-slate-500">Gestão centralizada de solicitações</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100">
          <p className="text-sm font-semibold text-yellow-700 mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
          <p className="text-sm font-semibold text-blue-700 mb-1">Em Atendimento</p>
          <p className="text-3xl font-bold text-blue-800">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <p className="text-sm font-semibold text-green-700 mb-1">Concluídos</p>
          <p className="text-3xl font-bold text-green-800">{stats.resolved}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-xl w-fit">
        {(['Todos', 'Pendente', 'Em Andamento', 'Concluído'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              statusFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Solicitante</th>
                <th className="px-6 py-4">Setor/Contato</th>
                <th className="px-6 py-4">Assunto</th>
                <th className="px-6 py-4">Prioridade</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ticket => (
                <TicketRow 
                  key={ticket.id} 
                  ticket={ticket} 
                  onUpdateStatus={updateTicketStatus}
                />
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum chamado encontrado.
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

const TicketRow: React.FC<{ ticket: Ticket, onUpdateStatus: any }> = ({ ticket, onUpdateStatus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [resNotes, setResNotes] = useState(ticket.resolutionNotes || '');

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Crítica': return 'bg-red-100 text-red-700';
      case 'Alta': return 'bg-orange-100 text-orange-700';
      case 'Média': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <p className="font-semibold text-slate-900 text-sm">{ticket.clientName}</p>
        </td>
        <td className="px-6 py-4">
          <p className="text-xs text-slate-700 font-medium">{ticket.sector}</p>
          <p className="text-[10px] text-slate-500">{ticket.phone}</p>
        </td>
        <td className="px-6 py-4">
          <p className="font-bold text-slate-800 text-sm">{ticket.title}</p>
          <p className="text-[10px] text-slate-500">{ticket.category}</p>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
          >
            {isEditing ? 'Fechar' : 'Gerenciar'}
          </button>
        </td>
      </tr>
      {isEditing && (
        <tr className="bg-slate-50 border-l-4 border-blue-500">
          <td colSpan={6} className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Relato do Usuário</h4>
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 shadow-sm">
                  {ticket.description}
                </div>
                {ticket.aiInsights && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs shadow-sm">
                    <p className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                      ✨ Insight da Gemini
                    </p>
                    <p className="text-indigo-800 whitespace-pre-line leading-relaxed">{ticket.aiInsights}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Resolução Técnica</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Mudar Status</label>
                  <div className="flex gap-2">
                    {(['Pendente', 'Em Andamento', 'Concluído'] as TicketStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus(ticket.id, s, resNotes)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          ticket.status === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Notas de Resolução</label>
                  <textarea
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="O que foi resolvido?"
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, ticket.status, resNotes);
                    setIsEditing(false);
                  }}
                  className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-black transition-all"
                >
                  Atualizar Chamado
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default AdminDashboard;
