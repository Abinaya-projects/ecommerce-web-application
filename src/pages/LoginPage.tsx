import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success', 'Logged in successfully.');
      navigate(user.role === 'ADMIN' && redirectUrl === '/' ? '/admin' : redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@ecommerce.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  const fillDemoUser = () => {
    setEmail('user@ecommerce.com');
    setPassword('user123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            Aura Commerce
          </Link>
          <h1 className="mt-2 text-xl sm:text-2xl font-serif font-semibold text-stone-950">
            Sign In to Your Account
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Access your orders, cart, and account settings.
          </p>
        </div>

        {/* Demo Credentials Helper Pill Box */}
        <div className="bg-stone-100/90 border border-stone-200/80 rounded-xl p-3.5 space-y-2 text-xs">
          <p className="font-semibold text-stone-700 text-[11px] uppercase tracking-wider">
            Quick Demo Auto-Fill:
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Fill Admin (Eleanor)</span>
            </button>
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fill Customer (Julian)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecommerce.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-stone-900 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
