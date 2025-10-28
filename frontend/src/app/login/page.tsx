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
      <div className={styles.leftPanel}>
        <div className={styles.heroLogo}>
          <span className={styles.heroLogoDot}></span>
          YOUR LOGO
        </div>
        <h2 className={styles.heroTitle}>Hello,
          <br />welcome!
        </h2>
        <p className={styles.heroSubtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nisi risus.
        </p>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
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
                className={`${styles.inputLight} bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus-visible:ring-blue-600`}
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
                className={`${styles.inputLight} bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus-visible:ring-blue-600`}
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
                className={`${styles.submitButton} bg-blue-600 hover:bg-blue-700 text-white`}
              >
                {loading ? 'Entrando...' : 'Login'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={styles.buttonOutline}
                onClick={() => router.push('/register')}
              >
                Sign up
              </Button>
            </div>
          </form>

          <div className={styles.socialRow}>
            <span className="label">FOLLOW</span>
            <a className={styles.socialLink} href="#" aria-label="Facebook">f</a>
            <a className={styles.socialLink} href="#" aria-label="Twitter">t</a>
            <a className={styles.socialLink} href="#" aria-label="Instagram">ig</a>
          </div>
        </div>
      </div>
    </div>
  );
}