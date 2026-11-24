import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquareText,
  LayoutDashboard,
  Inbox,
  BarChart3,
  FileText,
  Package,
  LogOut,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/feedback', label: 'Feedback', icon: Inbox },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/products', label: 'Products', icon: Package },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    toast('Signed out successfully', 'success');
    navigate('/');
  }

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-neutral-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
          <MessageSquareText className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-neutral-900">
            Feedback<span className="text-primary-600">Hub</span>
          </span>
          <p className="text-[11px] font-medium text-primary-600 uppercase tracking-wider">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(item.to) ? 'text-primary-600' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-4 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Back to site
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-neutral-100 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {profile?.full_name ?? 'Admin'}
            </p>
            <p className="text-xs text-neutral-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-neutral-200 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-white lg:hidden animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4">
          <button
            className="p-2 rounded-lg hover:bg-neutral-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-neutral-900">
            Feedback<span className="text-primary-600">Hub</span> Admin
          </span>
          <div className="w-9" />
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
