import { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Loader2,
  Search,
  Star,
  X,
  Save,
  MessageSquareReply,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AdminPageHeader from '@/components/AdminPageHeader';
import type {
  Feedback,
  Product,
  Profile,
  FeedbackStatus,
  Sentiment,
  FeedbackCategory,
} from '@/types';

const statuses: FeedbackStatus[] = ['Pending', 'In Review', 'Resolved'];
const sentiments: Sentiment[] = ['Positive', 'Neutral', 'Negative'];
const categories: FeedbackCategory[] = ['Product Quality', 'Service', 'Pricing', 'Delivery', 'Other'];
const ratings: number[] = [5, 4, 3, 2, 1];
const PAGE_SIZE = 8;

const statusColors: Record<FeedbackStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Review': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

interface EnrichedFeedback extends Feedback {
  product?: Product;
  user?: Profile;
}

export default function AdminFeedbackPage() {
  const toast = useToast();
  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'All'>('All');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<EnrichedFeedback | null>(null);
  const [reply, setReply] = useState('');
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('Pending');
  const [newSentiment, setNewSentiment] = useState<Sentiment>('Neutral');
  const [newCategory, setNewCategory] = useState<FeedbackCategory | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadFeedback() {
    setLoading(true);
    const { data, error } = await api
      .from('feedback')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });

    if (error) {
      toast('Failed to load feedback', 'error');
      setLoading(false);
      return;
    }

    const userIds = [...new Set((data as Feedback[]).map((f) => f.user_id))];
    const profileMap: Record<string, Profile> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await api
        .from('profiles')
        .select('*')
        .in('id', userIds);
      (profiles as Profile[] | null)?.forEach((p) => {
        profileMap[p.id] = p;
      });
    }

    const enriched = (data as (Feedback & { product?: Product })[]).map((fb) => ({
      ...fb,
      product: fb.product as Product | undefined,
      user: profileMap[fb.user_id],
    }));

    setFeedback(enriched);
    setLoading(false);
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  function openDetail(fb: EnrichedFeedback) {
    setSelected(fb);
    setReply(fb.admin_reply ?? '');
    setNewStatus(fb.status);
    setNewSentiment(fb.sentiment);
    setNewCategory(fb.category);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await api
        .from('feedback')
        .update({
          status: newStatus,
          sentiment: newSentiment,
          category: newCategory,
          admin_reply: reply.trim() || null,
        })
        .eq('id', selected.id);

      if (error) throw error;

      toast('Feedback updated successfully', 'success');
      setSelected(null);
      loadFeedback();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update feedback';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  // Client-side filtering
  const filtered = useMemo(() => {
    return feedback.filter((fb) => {
      if (statusFilter !== 'All' && fb.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && fb.category !== categoryFilter) return false;
      if (ratingFilter !== 'All' && fb.rating !== ratingFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          fb.comment?.toLowerCase().includes(q) ||
          fb.product?.name?.toLowerCase().includes(q) ||
          fb.user?.full_name?.toLowerCase().includes(q) ||
          fb.user?.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [feedback, statusFilter, categoryFilter, ratingFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, ratingFilter]);

  const hasActiveFilters =
    search !== '' || statusFilter !== 'All' || categoryFilter !== 'All' || ratingFilter !== 'All';

  function clearFilters() {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setRatingFilter('All');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Feedback Management"
        description="Review, respond to, and manage all customer feedback."
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by comment, product, or user..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'All')}
            className="input-field sm:w-40"
          >
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as FeedbackCategory | 'All')}
            className="input-field sm:w-40"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={String(ratingFilter)}
            onChange={(e) => setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="input-field sm:w-36"
          >
            <option value="All">All Ratings</option>
            {ratings.map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Results count + clear filters */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            {filtered.length !== feedback.length && ` of ${feedback.length} total`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
            <Inbox className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">No feedback found</h3>
          <p className="text-sm text-neutral-500">
            {feedback.length === 0
              ? 'No feedback has been submitted yet.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">Customer</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Product</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Rating</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Comment</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Category</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginated.map((fb) => (
                    <tr
                      key={fb.id}
                      onClick={() => openDetail(fb)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white shrink-0">
                            {fb.user?.full_name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate max-w-[120px]">
                              {fb.user?.full_name ?? 'Unknown'}
                            </p>
                            <p className="text-xs text-neutral-400 truncate max-w-[120px]">
                              {fb.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{fb.product?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-neutral-700">{fb.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-neutral-600 truncate">{fb.comment ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{fb.category ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[fb.status]}`}>
                          {fb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-neutral-500">
                Page {clampedPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={clampedPage === 1}
                  className="btn-secondary !px-3 !py-2 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                      clampedPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={clampedPage === totalPages}
                  className="btn-secondary !px-3 !py-2 disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="font-bold text-lg text-neutral-900">Feedback Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                  {selected.user?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{selected.user?.full_name ?? 'Unknown'}</p>
                  <p className="text-sm text-neutral-500">{selected.user?.email}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Product</p>
                  <p className="font-medium text-neutral-900">{selected.product?.name ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Type</p>
                  <p className="font-medium text-neutral-900">{selected.type}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Category</p>
                  <p className="font-medium text-neutral-900">{selected.category ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= selected.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selected.comment && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Comment</p>
                  <p className="text-sm text-neutral-700 leading-relaxed rounded-lg bg-neutral-50 p-4">
                    {selected.comment}
                  </p>
                </div>
              )}

              {/* Admin controls */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label-text">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                      className="input-field"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Category</label>
                    <select
                      value={newCategory ?? ''}
                      onChange={(e) => setNewCategory(e.target.value as FeedbackCategory || null)}
                      className="input-field"
                    >
                      <option value="">Unassigned</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Sentiment</label>
                    <select
                      value={newSentiment}
                      onChange={(e) => setNewSentiment(e.target.value as Sentiment)}
                      className="input-field"
                    >
                      {sentiments.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <MessageSquareReply className="h-3.5 w-3.5" />
                    Admin Reply (visible to customer)
                  </label>
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="input-field resize-none"
                    placeholder="Write a response to this feedback..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50">
              <button onClick={() => setSelected(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
