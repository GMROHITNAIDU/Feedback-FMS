import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Loader2,
  Download,
  Star,
  Calendar,
  TrendingUp,
  Lightbulb,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import AdminPageHeader from '@/components/AdminPageHeader';
import type { Feedback, Product, Profile, FeedbackStatus, FeedbackCategory } from '@/types';

const statusColors: Record<FeedbackStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Review': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

const dateRangeOptions = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 60 days', value: '60' },
  { label: 'Last 90 days', value: '90' },
  { label: 'All time', value: 'all' },
];

interface EnrichedFeedback extends Feedback {
  product?: Product;
  user?: Profile;
}

export default function AdminReportsPage() {
  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('60');

  useEffect(() => {
    async function loadData() {
      const { data, error } = await api
        .from('feedback')
        .select('*, product:products(*)')
        .order('created_at', { ascending: false });

      if (error) {
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
        (profiles as Profile[] | null)?.forEach((p) => { profileMap[p.id] = p; });
      }

      setFeedback(
        (data as (Feedback & { product?: Product })[]).map((fb) => ({
          ...fb,
          product: fb.product as Product | undefined,
          user: profileMap[fb.user_id],
        }))
      );
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter by date range
  const filteredFeedback = useMemo(() => {
    if (dateRange === 'all') return feedback;
    const days = parseInt(dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return feedback.filter((f) => new Date(f.created_at) >= cutoff);
  }, [feedback, dateRange]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredFeedback.length;
    const avgRating = total > 0
      ? (filteredFeedback.reduce((s, f) => s + f.rating, 0) / total).toFixed(1)
      : '0.0';
    const pending = filteredFeedback.filter((f) => f.status === 'Pending').length;
    const inReview = filteredFeedback.filter((f) => f.status === 'In Review').length;
    const resolved = filteredFeedback.filter((f) => f.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, avgRating, pending, inReview, resolved, resolutionRate };
  }, [filteredFeedback]);

  // Auto-generated insights
  const insights = useMemo(() => {
    if (filteredFeedback.length === 0) return [];

    const result: { icon: typeof Lightbulb; title: string; text: string; color: string }[] = [];

    // Top category
    const catCounts: Record<string, number> = {};
    filteredFeedback.forEach((f) => {
      if (f.category) catCounts[f.category] = (catCounts[f.category] ?? 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      result.push({
        icon: Lightbulb,
        title: 'Top Category',
        text: `"${topCat[0]}" is the most common feedback category with ${topCat[1]} entries (${Math.round((topCat[1] / filteredFeedback.length) * 100)}% of total).`,
        color: 'border-l-primary-500',
      });
    }

    // Average rating insight
    const avg = parseFloat(stats.avgRating);
    if (avg >= 4) {
      result.push({
        icon: TrendingUp,
        title: 'Rating Health',
        text: `Average rating of ${avg} out of 5 indicates strong customer satisfaction. Keep up the good work!`,
        color: 'border-l-emerald-500',
      });
    } else if (avg >= 3) {
      result.push({
        icon: TrendingUp,
        title: 'Rating Health',
        text: `Average rating of ${avg} out of 5 is moderate. Focus on addressing complaints to improve satisfaction.`,
        color: 'border-l-amber-500',
      });
    } else {
      result.push({
        icon: AlertTriangle,
        title: 'Rating Health',
        text: `Average rating of ${avg} out of 5 is below average. Urgent attention needed to address customer concerns.`,
        color: 'border-l-red-500',
      });
    }

    // Best-rated product
    const prodRatings: Record<string, { sum: number; count: number }> = {};
    filteredFeedback.forEach((f) => {
      if (!prodRatings[f.product_id]) prodRatings[f.product_id] = { sum: 0, count: 0 };
      prodRatings[f.product_id].sum += f.rating;
      prodRatings[f.product_id].count += 1;
    });
    const bestProduct = Object.entries(prodRatings)
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))[0];
    if (bestProduct) {
      const productName = filteredFeedback.find((f) => f.product_id === bestProduct[0])?.product?.name ?? 'Unknown';
      const prodAvg = (bestProduct[1].sum / bestProduct[1].count).toFixed(1);
      result.push({
        icon: Award,
        title: 'Best-Rated Product',
        text: `"${productName}" has the highest average rating of ${prodAvg} out of 5 (based on ${bestProduct[1].count} reviews).`,
        color: 'border-l-blue-500',
      });
    }

    // Resolution rate
    if (stats.resolutionRate >= 75) {
      result.push({
        icon: TrendingUp,
        title: 'Resolution Rate',
        text: `${stats.resolutionRate}% of feedback has been resolved. Excellent response rate!`,
        color: 'border-l-emerald-500',
      });
    } else if (stats.resolutionRate >= 50) {
      result.push({
        icon: TrendingUp,
        title: 'Resolution Rate',
        text: `${stats.resolutionRate}% of feedback has been resolved. There's room to improve response times.`,
        color: 'border-l-amber-500',
      });
    } else {
      result.push({
        icon: AlertTriangle,
        title: 'Resolution Rate',
        text: `Only ${stats.resolutionRate}% of feedback has been resolved. Consider prioritizing pending items.`,
        color: 'border-l-red-500',
      });
    }

    return result;
  }, [filteredFeedback, stats]);

  function exportCSV() {
    const escapeCSV = (val: string): string => {
      const sanitized = val.replace(/"/g, '""');
      if (/^[=+\-@]/.test(sanitized)) {
        return `"'${sanitized}"`;
      }
      return `"${sanitized}"`;
    };

    const headers = ['Date', 'User', 'Email', 'Product', 'Type', 'Category', 'Rating', 'Sentiment', 'Status', 'Comment', 'Admin Reply'];
    const rows = filteredFeedback.map((fb) => [
      escapeCSV(new Date(fb.created_at).toLocaleDateString()),
      escapeCSV(fb.user?.full_name ?? 'Unknown'),
      escapeCSV(fb.user?.email ?? ''),
      escapeCSV(fb.product?.name ?? ''),
      escapeCSV(fb.type),
      escapeCSV(fb.category ?? ''),
      escapeCSV(String(fb.rating)),
      escapeCSV(fb.sentiment),
      escapeCSV(fb.status),
      escapeCSV(fb.comment ?? ''),
      escapeCSV(fb.admin_reply ?? ''),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const rangeLabel = dateRange === 'all' ? 'all-time' : `${dateRange}d`;
    a.download = `feedback-report-${rangeLabel}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Feedback', value: stats.total, icon: FileText, color: 'bg-primary-50 text-primary-600' },
    { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'bg-blue-50 text-blue-600' },
    { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending + In Review', value: stats.pending + stats.inReview, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Reports"
        description="Filter by date range, review summary stats, and export feedback data."
        action={
          <button
            onClick={exportCSV}
            className="btn-primary"
            disabled={filteredFeedback.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Date range selector */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
        {dateRangeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
              dateRange === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
            <FileText className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">No data for this range</h3>
          <p className="text-sm text-neutral-500">Try selecting a wider date range.</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Pending</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inReview}</p>
              <p className="text-xs text-neutral-500 mt-0.5">In Review</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Resolved</p>
            </div>
          </div>

          {/* Auto-generated insights */}
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary-600" />
              Auto-Generated Insights
            </h2>
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-lg bg-neutral-50 border-l-4 p-4 ${insight.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 mb-0.5">{insight.title}</p>
                        <p className="text-sm text-neutral-600 leading-relaxed">{insight.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">
                Feedback Data ({filteredFeedback.length} {filteredFeedback.length === 1 ? 'entry' : 'entries'})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">Date</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">User</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Product</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Type</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Category</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Rating</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Sentiment</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredFeedback.map((fb) => (
                    <tr key={fb.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                        {new Date(fb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{fb.user?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-neutral-400">{fb.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{fb.product?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-700">{fb.type}</td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{fb.category ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-neutral-700">{fb.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{fb.sentiment}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[fb.status]}`}>
                          {fb.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs">
                        <p className="truncate">{fb.comment ?? '—'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
