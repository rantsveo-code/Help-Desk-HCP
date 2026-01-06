
import React from 'react';
import { User, UserRole } from '../../types';

interface SidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onViewChange, onLogout }) => {
  const isAdmin = user.role === 'admin';

  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'all-tickets', label: 'Gerenciar Chamados', icon: '🎫' },
    { id: 'reports', label: 'Relatórios Mensais', icon: '📈' },
  ] : [
    { id: 'dashboard', label: 'Meus Chamados', icon: '📋' },
    { id: 'new-ticket', label: 'Abrir Chamado', icon: '➕' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-blue-600 p-1 rounded">HCP</span> Help Desk
        </h1>
        <p className="text-xs text-slate-400 mt-1">Bem-vindo, {user.name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
