import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Inbox, Loader2, Filter, Star, MessageSquareReply } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Feedback, Product, FeedbackStatus } from '@/types';

const statusFilters: (FeedbackStatus | 'All')[] = [
  'All',
  'Pending',
  'In Review',
  'Resolved',
];

const statusColors: Record<FeedbackStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Review': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

export default function MyFeedbackPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedbackStatus | 'All'>('All');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [fbRes, prodRes] = await Promise.all([
          api
            .from('feedback')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          api.from('products').select('*'),
        ]);

        if (fbRes.error) throw fbRes.error;
        if (prodRes.error) throw prodRes.error;

        setFeedback(fbRes.data as Feedback[]);
        const prodMap: Record<string, Product> = {};
        (prodRes.data as Product[]).forEach((p) => {
          prodMap[p.id] = p;
        });
        setProducts(prodMap);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load feedback';
        toast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, toast]);

  const filtered = filter === 'All' ? feedback : feedback.filter((f) => f.status === filter);

  const stats = {
    total: feedback.length,
    pending: feedback.filter((f) => f.status === 'Pending').length,
    resolved: feedback.filter((f) => f.status === 'Resolved').length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Feedback</h1>
          <p className="text-neutral-500 mt-1">Track and manage all your submitted feedback.</p>
        </div>
        <Link to="/submit" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Feedback
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total Submissions</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Pending Review</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      {feedback.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
            <Inbox className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {feedback.length === 0 ? 'No feedback yet' : 'No results for this filter'}
          </h3>
          <p className="text-sm text-neutral-500 mb-6">
            {feedback.length === 0
              ? 'Share your experience with a product to get started.'
              : 'Try a different filter to see more feedback.'}
          </p>
          {feedback.length === 0 && (
            <Link to="/submit" className="btn-primary inline-flex">
              <Plus className="h-4 w-4" />
              Submit Your First Feedback
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((fb) => {
            const product = products[fb.product_id];
            return (
              <div key={fb.id} className="card p-5 hover:shadow-md transition-shadow">
                {/* Top row: type badge + status badge */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      fb.type === 'Review' ? 'bg-blue-50 text-blue-700' :
                      fb.type === 'Suggestion' ? 'bg-violet-50 text-violet-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {fb.type}
                    </span>
                    {fb.category && (
                      <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                        {fb.category}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${statusColors[fb.status]}`}>
                    {fb.status}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-500">{fb.rating}.0</span>
                </div>

                {/* Product */}
                {product && (
                  <p className="text-xs text-neutral-500 mb-2">
                    Product: <span className="font-medium text-neutral-700">{product.name}</span>
                  </p>
                )}

                {/* Comment */}
                {fb.comment && (
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    {fb.comment}
                  </p>
                )}

                {/* Date */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs text-neutral-400">
                    {new Date(fb.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Admin reply */}
                {fb.admin_reply && (
                  <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquareReply className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Admin Response</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{fb.admin_reply}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
