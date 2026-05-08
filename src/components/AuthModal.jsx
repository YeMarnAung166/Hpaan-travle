import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import Input from './ui/Input';
import Button from './ui/Button';

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting', mode, 'with email:', email);

    if (mode === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login response:', { data, error: signInError });
      if (signInError) {
        setError(signInError.message);
      } else {
        onClose();
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      console.log('Signup response:', { data, error: signUpError });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 className="text-2xl font-serif font-bold text-text mb-4">
          {mode === 'login' ? t('auth.login') : t('auth.signup')}
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error text-error rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? t('auth.processing') : (mode === 'login' ? t('auth.login') : t('auth.signup'))}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-text-soft">
          {mode === 'login' ? (
            <>
              {t('auth.no_account')}{' '}
              <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                {t('auth.sign_up')}
              </button>
            </>
          ) : (
            <>
              {t('auth.have_account')}{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline">
                {t('auth.login_here')}
              </button>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-soft hover:text-text transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}