
export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type TicketCategory = 
  | 'Problema na Rede' 
  | 'Impressora' 
  | 'Telefonia' 
  | 'Acesso/Conta' 
  | 'Periféricos';

export type TicketStatus = 'Pendente' | 'Em Andamento' | 'Concluído';
export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  sector: string;      // Novo campo
  phone: string;       // Novo campo
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  aiInsights?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
