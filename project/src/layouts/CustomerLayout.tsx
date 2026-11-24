import { Link, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquareText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function CustomerLayout() {
  const { user, profile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    toast('Signed out successfully', 'success');
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <MessageSquareText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              Feedback<span className="text-primary-600">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {user && (
              <>
                <Link to="/submit" className="btn-ghost">
                  Submit Feedback
                </Link>
                <Link to="/my-feedback" className="btn-ghost">
                  My Feedback
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                    {profile?.full_name ?? 'User'}
                  </span>
                </div>
                <button onClick={handleSignOut} className="btn-secondary !px-3 !py-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-2 animate-fade-in">
            {user && (
              <>
                <Link
                  to="/submit"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Submit Feedback
                </Link>
                <Link
                  to="/my-feedback"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileOpen(false)}
                >
                  My Feedback
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
                <Link
                  to="/login"
                  className="btn-secondary w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
