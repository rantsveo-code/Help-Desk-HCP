
import React, { useState, useEffect } from 'react';
import { User, Ticket } from '../../types';
import TicketForm from './TicketForm';

interface ClientDashboardProps {
  user: User;
  view: 'dashboard' | 'new-ticket';
  setView: (view: 'dashboard' | 'new-ticket') => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, view, setView }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const savedTickets = localStorage.getItem('helpdesk_tickets');
    if (savedTickets) {
      const allTickets: Ticket[] = JSON.parse(savedTickets);
      setTickets(allTickets.filter(t => t.clientId === user.id));
    }
  }, [user.id]);

  const refreshTickets = () => {
    const savedTickets = localStorage.getItem('helpdesk_tickets');
    if (savedTickets) {
      const allTickets: Ticket[] = JSON.parse(savedTickets);
      setTickets(allTickets.filter(t => t.clientId === user.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (view === 'new-ticket') {
    return (
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => setView('dashboard')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
        >
          ← Voltar para Meus Chamados
        </button>
        <TicketForm user={user} onSuccess={() => {
          setView('dashboard');
          refreshTickets();
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Chamados</h2>
          <p className="text-slate-500">Acompanhe o status das suas solicitações</p>
        </div>
        <button
          onClick={() => setView('new-ticket')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all"
        >
          <span>➕</span> Abrir Novo Chamado
        </button>
      </header>

      {tickets.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-slate-900">Nenhum chamado aberto</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Você ainda não criou nenhum ticket de suporte. Se estiver com problemas técnicos, clique no botão acima para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-slate-400">#{ticket.id.substr(0, 8)}</span>
                    <span className="text-xs text-slate-400">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{ticket.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="opacity-70">📁</span> {ticket.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="opacity-70">🚩</span> Prioridade: {ticket.priority}
                    </span>
                  </div>
                  <p className="mt-3 text-slate-700 line-clamp-2">{ticket.description}</p>
                  
                  {ticket.resolutionNotes && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="text-sm font-bold text-green-800 flex items-center gap-2">
                        ✅ Nota de Resolução
                      </h4>
                      <p className="mt-1 text-sm text-green-700">{ticket.resolutionNotes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex md:flex-col justify-end md:justify-center items-center md:items-end min-w-[120px]">
                   {ticket.status === 'Pendente' && (
                     <div className="animate-pulse flex items-center gap-2 text-yellow-600 text-sm font-medium">
                       <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                       Aguardando triagem
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
