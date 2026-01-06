
import React, { useState, useEffect } from 'react';
import { AuthState, User, UserRole } from './types';
import Login from './components/Auth/Login';
import ClientDashboard from './components/Client/ClientDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import Sidebar from './components/Layout/Sidebar';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-ticket' | 'reports' | 'all-tickets'>('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('helpdesk_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuth({ user, isAuthenticated: true });
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    localStorage.setItem('helpdesk_user', JSON.stringify(user));
    setIsGuestMode(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('helpdesk_user');
    setIsGuestMode(false);
    setCurrentView('dashboard');
  };

  const handleGuestAccess = () => {
    setIsGuestMode(true);
    setCurrentView('new-ticket');
  };

  const handleGuestExit = () => {
    setIsGuestMode(false);
    setCurrentView('dashboard');
  };

  // If not logged in and not in guest mode, show the landing/login page
  if (!auth.isAuthenticated && !isGuestMode) {
    return <Login onLogin={handleLogin} onGuestAccess={handleGuestAccess} />;
  }

  // Define a pseudo-user for guest mode to keep logic consistent
  const currentUser = auth.user || { id: 'guest', name: 'Visitante', email: 'visitante@email.com', role: 'client' as UserRole };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Hide sidebar for guests unless you want them to navigate back */}
      {!isGuestMode && (
        <Sidebar 
          user={currentUser} 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLogout={handleLogout} 
        />
      )}
      
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 ${isGuestMode ? 'max-w-4xl mx-auto' : ''}`}>
        {isGuestMode ? (
          <div className="space-y-6">
            <button 
              onClick={handleGuestExit}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-4"
            >
              ← Cancelar e Voltar ao Início
            </button>
            <ClientDashboard 
              user={currentUser} 
              view="new-ticket" 
              setView={() => handleGuestExit()} 
            />
          </div>
        ) : (
          currentUser.role === 'client' ? (
            <ClientDashboard 
              user={currentUser} 
              view={currentView as any} 
              setView={setCurrentView as any} 
            />
          ) : (
            <AdminDashboard 
              user={currentUser} 
              view={currentView as any} 
              setView={setCurrentView as any} 
            />
          )
        )}
      </main>
    </div>
  );
};

export default App;
