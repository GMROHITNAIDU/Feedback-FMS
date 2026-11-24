import { Star, MessageSquareReply, Clock, CheckCircle2, Eye } from 'lucide-react';
import type { Feedback, FeedbackStatus, FeedbackType } from '@/types';
import type { Product } from '@/types';

interface FeedbackCardProps {
  feedback: Feedback;
  product?: Product;
}

const statusConfig: Record<FeedbackStatus, { label: string; color: string; icon: typeof Clock }> = {
  Pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'In Review': { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: Eye },
  Resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

const typeConfig: Record<FeedbackType, string> = {
  Review: 'bg-blue-50 text-blue-700',
  Suggestion: 'bg-violet-50 text-violet-700',
  Complaint: 'bg-red-50 text-red-700',
};

export default function FeedbackCard({ feedback, product }: FeedbackCardProps) {
  const status = statusConfig[feedback.status];
  const StatusIcon = status.icon;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${typeConfig[feedback.type]}`}>
            {feedback.type}
          </span>
          {feedback.category && (
            <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
              {feedback.category}
            </span>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                s <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-neutral-500">{feedback.rating}.0</span>
      </div>

      {product && (
        <p className="text-xs text-neutral-500 mb-2">
          Product: <span className="font-medium text-neutral-700">{product.name}</span>
        </p>
      )}

      {feedback.comment && (
        <p className="text-sm text-neutral-700 leading-relaxed mb-3 line-clamp-3">
          {feedback.comment}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="text-xs text-neutral-400">
          {new Date(feedback.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {feedback.admin_reply && (
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
          <div className="flex items-start gap-2">
            <MessageSquareReply className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Admin Response</p>
              <p className="text-sm text-blue-800 leading-relaxed">{feedback.admin_reply}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
