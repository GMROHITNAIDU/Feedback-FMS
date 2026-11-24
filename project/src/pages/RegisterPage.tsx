import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquareText,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterPageProps {
  role?: 'customer' | 'admin';
}

export default function RegisterPage({ role = 'customer' }: RegisterPageProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const { fetchProfileWithRetry } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; adminCode?: string; form?: string }>({});

  const isAdmin = role === 'admin';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: typeof errors = {};
    if (!fullName.trim()) fieldErrors.fullName = 'Full name is required';
    if (!email.trim()) fieldErrors.email = 'Email is required';
    if (!password) fieldErrors.password = 'Password is required';
    if (password && password !== confirmPassword) fieldErrors.confirmPassword = 'Passwords do not match';
    if (password && password.length < 6) fieldErrors.password = 'Password must be at least 6 characters';
    if (isAdmin && !adminCode.trim()) fieldErrors.adminCode = 'Admin secret code is required';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);

    try {
      // The role is determined ENTIRELY server-side by the handle_new_user trigger.
      // We pass admin_code in user metadata — the trigger checks it against the secret.
      // The client never sends a role value; it cannot influence the outcome.
      const { data, error } = await api.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            ...(isAdmin ? { admin_code: adminCode.trim() } : {}),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // The trigger fires AFTER INSERT on auth.users and creates the profile row.
        // Poll for the profile to appear, then redirect based on the server-assigned role.
        const createdProfile = await fetchProfileWithRetry(data.user.id, 5);

        if (createdProfile?.role === 'admin') {
          toast('Admin account created successfully!', 'success');
          navigate('/admin', { replace: true });
        } else if (isAdmin) {
          toast(
            'Account created, but the admin code was incorrect. You have a customer account.',
            'info'
          );
          navigate('/my-feedback', { replace: true });
        } else {
          toast('Account created successfully!', 'success');
          navigate('/my-feedback', { replace: true });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setErrors({ form: msg });
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
          isAdmin
            ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950'
            : 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800'
        }`}
      >
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
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-5">
              <span className="text-xs font-semibold uppercase tracking-wide">
                {isAdmin ? 'Admin Access' : 'Customer Account'}
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              {isAdmin
                ? 'Manage feedback at scale.'
                : 'Your voice shapes better products.'}
            </h1>
            <p className="text-lg leading-relaxed max-w-md opacity-90">
              {isAdmin
                ? 'Gain full visibility into customer sentiment, manage products, and respond to feedback — all from one powerful dashboard.'
                : 'Share your experience, track your feedback, and help the products you use get better every day.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm opacity-75">
            <span className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Admin role verified server-side
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Secure & encrypted
                </>
              )}
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

          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {isAdmin ? 'Create admin account' : 'Create your account'}
          </h2>
          <p className="text-neutral-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </div>
            )}
            <div>
              <label className="label-text" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((p) => ({ ...p, fullName: undefined, form: undefined }));
                  }}
                  className={`input-field pl-10 ${errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

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
                    setErrors((p) => ({ ...p, password: undefined, confirmPassword: undefined, form: undefined }));
                  }}
                  className={`input-field pl-10 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="At least 6 characters"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((p) => ({ ...p, confirmPassword: undefined, form: undefined }));
                  }}
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Admin secret code field */}
            {isAdmin && (
              <div>
                <label className="label-text" htmlFor="adminCode">
                  Admin Secret Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="adminCode"
                    type="password"
                    required
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      setErrors((p) => ({ ...p, adminCode: undefined, form: undefined }));
                    }}
                    className={`input-field pl-10 ${errors.adminCode ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter the admin secret code"
                  />
                </div>
                {errors.adminCode && <p className="mt-1 text-xs text-red-600">{errors.adminCode}</p>}
                <p className="mt-1.5 text-xs text-neutral-400">
                  Verified securely on the server. Incorrect code creates a customer account.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isAdmin ? 'Create Admin Account' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-500">
              {isAdmin ? 'Not an admin? ' : 'Want admin access? '}
              <Link
                to={isAdmin ? '/register' : '/admin-register'}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                {isAdmin ? 'Register as customer' : 'Register as admin'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
