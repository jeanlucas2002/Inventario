import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-slate-900 p-3 rounded-xl">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        <p className="text-center text-slate-600 mb-8">
          Sistema de Gestión de Inventario
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            {isSignUp
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
