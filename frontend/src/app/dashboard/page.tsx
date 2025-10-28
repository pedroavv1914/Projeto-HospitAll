'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Bem-vindo, {user.nome || user.email}</h1>
          <p className="text-gray-600 mt-2">Você está autenticado como <span className="font-semibold">{user.tipo_usuario}</span>.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Ações rápidas</h2>
            <ul className="list-disc ml-5 text-gray-700">
              <li>Consultar meu perfil</li>
              <li>Agendar consulta</li>
              <li>Ver minhas consultas</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Status do sistema</h2>
            <p className="text-gray-700">API conectada e sessão ativa.</p>
          </div>
        </div>
      </div>
    </div>
  );
}