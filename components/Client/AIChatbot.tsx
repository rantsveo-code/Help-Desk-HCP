
import React, { useState, useEffect, useRef } from 'react';
import { TicketCategory } from '../../types';
import { createTroubleshootingChat } from '../../geminiService';

interface AIChatbotProps {
  category: TicketCategory;
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ category, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inicializa o chat com a primeira mensagem da IA
    chatRef.current = createTroubleshootingChat(category);
    startChat();
  }, [category]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startChat = async () => {
    setIsTyping(true);
    try {
      const response = await chatRef.current.sendMessage({ message: "Olá, pode me dar a primeira dica para resolver um problema desta categoria?" });
      setMessages([{ role: 'model', text: response.text || "Olá! Eu posso ajudar você com esse problema hoje." }]);
    } catch (error) {
      setMessages([{ role: 'model', text: "Desculpe, tive um problema ao iniciar o assistente. Por favor, abra um chamado." }]);
    }
    setIsTyping(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Não entendi, pode repetir?" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Houve um erro na comunicação. Por favor, abra um chamado formal." }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col h-[500px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h4 className="font-bold text-sm">Assistente HCP</h4>
            <p className="text-[10px] opacity-80">Suporte Inteligente</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded transition-colors text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          placeholder="Digite sua dúvida..."
          className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
