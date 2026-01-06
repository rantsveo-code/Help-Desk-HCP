
import React, { useState } from 'react';
import { User, UserRole } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onGuestAccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGuestAccess }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Senha administrativa fixa: SuporteHCP
    if (email === 'admin@helpdesk.com' && password === 'SuporteHCP') {
      onLogin({ 
        id: 'admin-1', 
        name: 'Equipe de Suporte', 
        email: 'admin@helpdesk.com', 
        role: 'admin' 
      });
    } else {
      setError('Credenciais inválidas. Verifique o email e a senha.');
    }
  };

  if (!isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Client Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center bg-white">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl font-black">HCP</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Help Desk HCP</h1>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Precisa de Suporte?</h2>
            
            <p className="text-slate-600 mb-10 max-w-xs">
              Abra um chamado de suporte técnico agora mesmo para que nossa equipe possa atendê-lo.
            </p>

            <button
              onClick={onGuestAccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Abrir Novo Chamado
            </button>
          </div>

          {/* Admin Access Promo */}
          <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Acesso Técnico</h3>
            <p className="text-slate-400 mb-8">
              Painel de gestão exclusivo para a equipe de infraestrutura e suporte.
            </p>
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-8 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors font-medium"
            >
              Entrar como Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <button 
          onClick={() => setIsAdminMode(false)}
          className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2 text-sm font-medium"
        >
          ← Voltar ao início
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold">HCP</div>
          <h2 className="text-2xl font-bold text-slate-900">Login Administrativo</h2>
          <p className="text-slate-600 mt-1">Acesso restrito à equipe de TI</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="admin@helpdesk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-lg shadow-lg transition-all"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
