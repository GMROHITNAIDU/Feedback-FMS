import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Loader2, Send, Package, CheckCircle2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, FeedbackType } from '@/types';

const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'Review', label: 'Review', description: 'Share your overall experience' },
  { value: 'Suggestion', label: 'Suggestion', description: 'Propose a new feature or improvement' },
  { value: 'Complaint', label: 'Complaint', description: 'Report an issue or problem' },
];

export default function SubmitFeedbackPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<FeedbackType>('Review');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await api.from('products').select('*').order('name');
      if (error) {
        toast('Failed to load products', 'error');
        setLoading(false);
        return;
      }
      setProducts(data as Product[]);
      if (data && data.length > 0) setProductId(data[0].id);
      setLoading(false);
    }
    loadProducts();
  }, [toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) {
      toast('Please select a product', 'error');
      return;
    }
    if (!comment.trim()) {
      toast('Please add a comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await api.from('feedback').insert({
        product_id: productId,
        type,
        rating,
        comment: comment.trim(),
        sentiment: 'Neutral',
        status: 'Pending',
      });

      if (error) throw error;

      setSubmitted(true);
      toast('Feedback submitted successfully!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
          <Package className="h-7 w-7 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">No products available</h3>
        <p className="text-sm text-neutral-500">
          Products will appear here once an admin adds them. Please check back later.
        </p>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-10 text-center animate-slide-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Feedback Submitted!</h2>
          <p className="text-neutral-500 mb-2 max-w-md mx-auto">
            Thank you for your feedback. Our team will review it and get back to you.
            You can track its status on your My Feedback page.
          </p>
          <p className="text-xs text-neutral-400 mb-6">
            Signed in as {user?.email}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setComment('');
                setRating(5);
                setType('Review');
              }}
              className="btn-secondary"
            >
              Submit Another
            </button>
            <button onClick={() => navigate('/my-feedback')} className="btn-primary">
              View My Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Submit Feedback</h1>
        <p className="text-neutral-500 mt-1">
          Share your experience to help products improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        {/* Product dropdown */}
        <div>
          <label className="label-text" htmlFor="product">
            Product
          </label>
          <div className="relative">
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="input-field appearance-none pr-10 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          </div>
          {productId && (() => {
            const selected = products.find((p) => p.id === productId);
            return selected?.description ? (
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{selected.description}</p>
            ) : null;
          })()}
        </div>

        {/* Feedback type */}
        <div>
          <label className="label-text">Feedback Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {feedbackTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`rounded-lg px-3 py-3 text-left transition-all border ${
                  type === t.value
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <p className={`text-sm font-semibold ${type === t.value ? 'text-primary-700' : 'text-neutral-900'}`}>
                  {t.label}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="label-text">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    s <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-neutral-600">
              {rating} / 5
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="label-text" htmlFor="comment">
            Comment
          </label>
          <textarea
            id="comment"
            required
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field resize-none"
            placeholder="Tell us about your experience..."
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            {comment.length} characters
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/my-feedback')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
