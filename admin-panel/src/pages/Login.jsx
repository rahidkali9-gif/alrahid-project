import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader as Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';

export default function Login() {
  const { login, isAuthenticated, initialized, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (initialized && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter email and password');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user?.name || 'Admin'}`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-3 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-100">Al Rahid Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="admin@alrahid.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9 pr-16"
                placeholder="••••••••"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-1.5 py-1"
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign in
              </>
            )}
          </button>

          {loading && (
            <p className="text-center text-xs text-slate-500">Restoring session…</p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected area · Admin &amp; Super Admin access only
        </p>
      </div>
    </div>
  );
}
