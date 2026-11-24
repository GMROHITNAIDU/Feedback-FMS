import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareText, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types';

const demoAccounts = [
  {
    label: 'Admin Demo',
    email: 'admin@demo.com',
    password: 'Admin@123',
    icon: Sparkles,
    accent: 'border-neutral-300 hover:border-neutral-400 bg-neutral-50',
  },
  {
    label: 'Customer Demo',
    email: 'customer@demo.com',
    password: 'Customer@123',
    icon: MessageSquareText,
    accent: 'border-primary-200 hover:border-primary-400 bg-primary-50',
  },
];

export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) fieldErrors.email = 'Email is required';
    if (!password) fieldErrors.password = 'Password is required';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    setLoading(true);

    try {
      const { error } = await api.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Fetch profile to determine redirect
      const { data: session } = await api.auth.getSession();
      const userId = session.session?.user.id;
      let role: string = 'customer';

      if (userId) {
        const { data: profile } = await api
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        role = (profile as Pick<Profile, 'role'> | null)?.role ?? 'customer';
      }

      await refreshProfile();
      toast('Welcome back!', 'success');

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/my-feedback', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setErrors({ form: msg });
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  function autofill(accountEmail: string, accountPassword: string) {
    setEmail(accountEmail);
    setPassword(accountPassword);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl translate-x-32 -translate-y-20" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl -translate-x-20 translate-y-20" />

        <div className="relative flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <MessageSquareText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">FeedbackHub</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Welcome back to your feedback hub.
            </h1>
            <p className="text-lg text-primary-100 leading-relaxed max-w-md">
              Sign in to manage your feedback, track responses, and keep the conversation
              going with your customers.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-primary-200">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <MessageSquareText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-neutral-900">
                Feedback<span className="text-primary-600">Hub</span>
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to your account</h2>
          <p className="text-neutral-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </div>
            )}
            <div>
              <label className="label-text" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined, form: undefined }));
                  }}
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined, form: undefined }));
                  }}
                  className={`input-field pl-10 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Try Demo Accounts
            </p>
            <div className="space-y-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    onClick={() => autofill(account.email, account.password)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${account.accent}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-neutral-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{account.label}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {account.email} / {account.password}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-neutral-500 shrink-0">
                      Autofill
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-500">
              Are you an admin?{' '}
              <Link
                to="/admin-register"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Register as admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
