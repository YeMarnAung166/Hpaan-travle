import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let error;
    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
    }

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="message-error mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-green-600 underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-green-600 underline">
                Login
              </button>
            </>
          )}
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
    </div>
  );
}