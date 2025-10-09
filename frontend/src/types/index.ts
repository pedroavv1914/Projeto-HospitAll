export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  endereco: string;
  tipo_usuario: 'paciente' | 'medico' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Medico {
  id: number;
  user_id: number;
  crm: string;
  especialidade: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  id: number;
  user_id: number;
  numero_sus?: string;
  plano_saude?: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Consulta {
  id: number;
  paciente_id: number;
  medico_id: number;
  data_consulta: string;
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida';
  observacoes?: string;
  paciente?: Paciente;
  medico?: Medico;
  created_at: string;
  updated_at: string;
}

export interface Exame {
  id: number;
  paciente_id: number;
  medico_id: number;
  tipo_exame: string;
  data_exame: string;
  resultado?: string;
  observacoes?: string;
  status: 'agendado' | 'realizado' | 'cancelado';
  paciente?: Paciente;
  medico?: Medico;
  created_at: string;
  updated_at: string;
}

export interface Prontuario {
  id: number;
  paciente_id: number;
  medico_id: number;
  data_atendimento: string;
  diagnostico: string;
  prescricao?: string;
  observacoes?: string;
  paciente?: Paciente;
  medico?: Medico;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  endereco: string;
  tipo_usuario: 'paciente' | 'medico';
  crm?: string;
  especialidade?: string;
  numero_sus?: string;
  plano_saude?: string;
}