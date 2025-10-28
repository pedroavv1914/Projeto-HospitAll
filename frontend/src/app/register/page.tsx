'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { RegisterRequest } from '@/types';
import styles from './register.module.css';
import { formatCpf, formatPhone, formatSus } from '@/lib/masks';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    nome: '',
    email: '',
    password: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    tipo_usuario: 'paciente',
    crm: '',
    especialidade: '',
    numero_sus: '',
    plano_saude: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === 'cpf') newValue = formatCpf(value);
    if (name === 'telefone') newValue = formatPhone(value);
    if (name === 'numero_sus') newValue = formatSus(value);

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,100}$/.test(formData.password)) {
      newErrors.password = 'Senha deve conter 1 minúscula, 1 maiúscula e 1 número';
    }
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF deve estar no formato XXX.XXX.XXX-XX';
    }
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (XX) XXXXX-XXXX';
    }
    if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    if (!formData.endereco) newErrors.endereco = 'Endereço é obrigatório';

    // Validações específicas por tipo de usuário
    if (formData.tipo_usuario === 'medico') {
      if (!formData.crm) newErrors.crm = 'CRM é obrigatório para médicos';
      if (!formData.especialidade) newErrors.especialidade = 'Especialidade é obrigatória para médicos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mapear campos do formulário (pt-BR) para o payload esperado pelo backend (en-US)
      const payload = {
        name: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.password,
        cpf: formData.cpf.trim(),
        phone: formData.telefone.trim(),
        role: formData.tipo_usuario === 'medico' ? 'doctor' : 'patient',
      };

      await api.post('/auth/register', payload);
      router.push('/login?message=Cadastro realizado com sucesso! Faça login para continuar.');
    } catch (error: any) {
      // Tentar exibir mensagens de validação de campo vindas do backend
      const details = error?.response?.data?.details;
      const backendErrorMsg = error?.response?.data?.message || error?.response?.data?.error;
      const fieldErrors: Record<string, string> = {};

      if (Array.isArray(details)) {
        const fieldMap: Record<string, string> = {
          name: 'nome',
          email: 'email',
          password: 'password',
          cpf: 'cpf',
          phone: 'telefone',
          role: 'tipo_usuario',
        };

        details.forEach((d: any) => {
          const field = d.path || d.param || d.field;
          const msg = d.msg || d.message || 'Valor inválido';
          const mapped = fieldMap[field] || field;
          fieldErrors[mapped] = msg;
        });
      }

      setErrors({
        ...fieldErrors,
        general: backendErrorMsg || 'Erro ao criar conta. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>Cadastre-se no HospitAll</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}

          <div className={styles.row}>
            <Input
              label="Nome Completo"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              error={errors.nome}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className={styles.row}>
            <Input
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              error={errors.cpf}
              placeholder="000.000.000-00"
              helperText="Formato: XXX.XXX.XXX-XX"
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              error={errors.telefone}
              placeholder="(11) 99999-9999"
              helperText="Formato: (XX) XXXXX-XXXX"
              required
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Data de Nascimento"
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              error={errors.data_nascimento}
              required
            />
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Tipo de Usuário</label>
              <select
                name="tipo_usuario"
                value={formData.tipo_usuario}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="paciente">Paciente</option>
                <option value="medico">Médico</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <Input
              label="Endereço"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              error={errors.endereco}
              placeholder="Rua, número, bairro, cidade"
              required
            />
          </div>

          {formData.tipo_usuario === 'medico' && (
            <div className={styles.medicoFields}>
              <div className={styles.row}>
                <Input
                  label="CRM"
                  name="crm"
                  value={formData.crm}
                  onChange={handleChange}
                  error={errors.crm}
                  placeholder="CRM/UF 123456"
                  required
                />
                <Input
                  label="Especialidade"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleChange}
                  error={errors.especialidade}
                  placeholder="Ex: Cardiologia"
                  required
                />
              </div>
            </div>
          )}

          {formData.tipo_usuario === 'paciente' && (
            <div className={styles.pacienteFields}>
              <div className={styles.row}>
                <Input
                  label="Número SUS (opcional)"
                  name="numero_sus"
                  value={formData.numero_sus}
                  onChange={handleChange}
                  placeholder="000 0000 0000 0000"
                />
                <Input
                  label="Plano de Saúde (opcional)"
                  name="plano_saude"
                  value={formData.plano_saude}
                  onChange={handleChange}
                  placeholder="Nome do plano"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className={styles.submitButton}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Já tem uma conta?{' '}
            <a href="/login" className={styles.link}>
              Faça login aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}