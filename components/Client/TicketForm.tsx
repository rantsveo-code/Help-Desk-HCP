
import React, { useState } from 'react';
import { User, Ticket, TicketCategory, TicketPriority } from '../../types';
import { analyzeTicket } from '../../geminiService';
import AIChatbot from './AIChatbot';

interface TicketFormProps {
  user: User;
  onSuccess: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ user, onSuccess }) => {
  const isGuest = user.id === 'guest';
  const [name, setName] = useState(isGuest ? '' : user.name);
  const [sector, setSector] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Acesso/Conta');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const categories: {id: TicketCategory, label: string, sub: string, icon: string}[] = [
    { id: 'Problema na Rede', label: 'Rede/Internet', sub: 'Sem conexão, Wi-Fi', icon: '🌐' },
    { id: 'Impressora', label: 'Impressora', sub: 'Atolamento, não imprime', icon: '🖨️' },
    { id: 'Telefonia', label: 'Telefonia', sub: 'Ramal mudo, chiado', icon: '📞' },
    { id: 'Acesso/Conta', label: 'Acesso/Conta', sub: 'Senha, bloqueio', icon: '🔑' },
    { id: 'Periféricos', label: 'Hardware/PC', sub: 'Mouse, teclado, computador', icon: '💻' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const analysis = await analyzeTicket(title, description, category);

      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: isGuest ? `guest-${Date.now()}` : user.id,
        clientName: name,
        sector: sector,
        phone: phone,
        title,
        description,
        category,
        status: 'Pendente',
        priority: analysis.suggestedPriority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiInsights: `Análise IA: ${analysis.summary}\nSugestão: ${analysis.suggestedAction}`
      };

      const existing = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
      localStorage.setItem('helpdesk_tickets', JSON.stringify([...existing, newTicket]));

      alert("Chamado enviado com sucesso! Nossa equipe técnica analisará sua solicitação.");
      onSuccess();
    } catch (error) {
      alert("Erro ao criar chamado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAIChat) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="text-blue-800 text-sm font-medium">
            Tente resolver o problema de <strong>{category}</strong> com a IA agora.
          </div>
          <button 
            onClick={() => setShowAIChat(false)}
            className="text-xs font-bold text-blue-600 underline"
          >
            Pular e abrir chamado
          </button>
        </div>
        <AIChatbot category={category} onClose={() => setShowAIChat(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-slate-200">
      <div className="mb-8 border-b pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Abertura de Chamado Técnico</h2>
        <p className="text-slate-500">Relate seu problema para que nossa equipe possa ajudar.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Seu Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Nome e Sobrenome"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Setor / Departamento</label>
            <input
              type="text"
              required
              placeholder="Ex: Financeiro, RH, Vendas"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone / Ramal</label>
            <input
              type="text"
              required
              placeholder="Ex: Ramal 102 ou (11) 9..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Categorias */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Qual o tipo de problema?</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all min-h-[100px] ${
                  category === cat.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-bold text-center leading-tight">{cat.label}</span>
                <span className="text-[9px] text-center opacity-70 leading-tight hidden md:block">{cat.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Opção IA */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-lg">
              Eu posso ajudar você agora mesmo!
            </h4>
            <p className="text-sm text-indigo-700 mt-1">
              Dicas passo a passo para resolver problemas de <strong>{category}</strong> sem espera.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAIChat(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all whitespace-nowrap"
          >
            Falar com Assistente IA
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Assunto Curto</label>
          <input
            type="text"
            required
            placeholder="Ex: Não consigo imprimir relatórios"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição do Problema</label>
          <textarea
            required
            rows={4}
            placeholder="Detalhe o que está acontecendo. Se houver mensagens de erro, descreva-as aqui."
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Abrir Chamado'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
