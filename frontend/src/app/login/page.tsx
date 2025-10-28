'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './login.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('message');

  useEffect(() => {
    // Limpa a mensagem da URL após exibir
    if (successMessage) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [successMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
          <div className={styles.cardAccent}></div>
          <div className={styles.header}>
            <h1 className={styles.title}>Entrar</h1>
            <p className={styles.subtitle}>Preencha seus dados para acessar</p>
            <div className={styles.headerDivider}></div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className={styles.errorMessage}>
                {errors.general}
              </div>
            )}

            <div className={styles.formRow}>
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                helperText={!errors.email ? 'Use o e-mail cadastrado.' : undefined}
                placeholder="name@mail.com"
                className={`${styles.inputLight} ${styles.iconEmail} bg-white text-gray-900 placeholder:text-gray-500 border-gray-300`}
                required
              />
            </div>

            <div className={styles.formRow}>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                helperText={!errors.password ? 'Mínimo de 6 caracteres.' : undefined}
                placeholder="••••••••"
                className={`${styles.inputLight} ${styles.iconPassword} bg-white text-gray-900 placeholder:text-gray-500 border-gray-300`}
                required
              />
            </div>

            <div className={styles.actionsRow}>
              <label className={styles.rememberLabel}>
                <input type="checkbox" className="h-4 w-4 rounded border-white/40 bg-transparent" />
                Lembrar de mim
              </label>
              <a href="#" className={styles.forgotLink}>Esqueci minha senha</a>
            </div>

            <div className={styles.divider}></div>
            <div className={styles.buttonRow}>
              <Button
                type="submit"
                loading={loading}
                size="lg"
                className={`${styles.submitButton} ${styles.submitButtonGradient}`}
              >
                {loading ? 'Entrando...' : 'Login'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={styles.buttonOutline}
                onClick={() => router.push('/register')}
              >
                Criar conta
              </Button>
            </div>
          </form>

          <div className={styles.socialRow}>
            <span className="label">FOLLOW</span>
            <a className={styles.socialLink} href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a className={styles.socialLink} href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83" />
              </svg>
            </a>
            <a className={styles.socialLink} href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}