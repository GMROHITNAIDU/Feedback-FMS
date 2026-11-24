import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Star, CheckCircle2, TrendingUp, ArrowRight, Clock, Package, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AdminPageHeader from '@/components/AdminPageHeader';
import type { Feedback, Product } from '@/types';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    avgRating: 0,
  });
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allFbRes, recentFbRes, prodRes] = await Promise.all([
        api.from('feedback').select('*'),
        api.from('feedback').select('*').order('created_at', { ascending: false }).limit(5),
        api.from('products').select('*'),
      ]);

      if (allFbRes.error || recentFbRes.error || prodRes.error) {
        toast('Failed to load dashboard data', 'error');
        setLoading(false);
        return;
      }

      if (allFbRes.data) {
        const all = allFbRes.data as Feedback[];
        setStats({
          total: all.length,
          pending: all.filter((f) => f.status === 'Pending').length,
          resolved: all.filter((f) => f.status === 'Resolved').length,
          avgRating: all.length > 0
            ? Math.round((all.reduce((sum, f) => sum + f.rating, 0) / all.length) * 10) / 10
            : 0,
        });
      }

      if (recentFbRes.data) {
        setRecentFeedback(recentFbRes.data as Feedback[]);
      }

      if (prodRes.data) {
        const map: Record<string, Product> = {};
        (prodRes.data as Product[]).forEach((p) => { map[p.id] = p; });
        setProducts(map);
      }

      setLoading(false);
    }
    loadData();
  }, [toast]);

  const statCards = [
    {
      label: 'Total Feedback',
      value: stats.total,
      icon: Inbox,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Avg Rating',
      value: stats.avgRating,
      icon: Star,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of feedback activity and key metrics."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              {loading ? (
                <div className="h-9 w-16 rounded-md bg-neutral-100 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              )}
              <p className="text-sm text-neutral-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent feedback */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Recent Feedback</h2>
            <Link
              to="/admin/feedback"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
            </div>
          ) : recentFeedback.length === 0 ? (
            <div className="py-10 text-center">
              <Inbox className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No feedback submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold rounded px-2 py-0.5 ${
                        fb.type === 'Review' ? 'bg-blue-50 text-blue-700' :
                        fb.type === 'Suggestion' ? 'bg-violet-50 text-violet-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {fb.type}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {products[fb.product_id]?.name ?? 'Unknown product'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 truncate">
                      {fb.comment ?? 'No comment'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/feedback"
                className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" /> Review Feedback
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/analytics"
                className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> View Analytics
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" /> Manage Products
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
