import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Star,
  TrendingUp,
  Loader2,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import AdminPageHeader from '@/components/AdminPageHeader';
import type { Feedback, Product, FeedbackCategory } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  'Product Quality': '#6366f1',
  Service: '#0ea5e9',
  Pricing: '#f59e0b',
  Delivery: '#10b981',
  Other: '#a78bfa',
};

const ALL_CATEGORIES: FeedbackCategory[] = ['Product Quality', 'Service', 'Pricing', 'Delivery', 'Other'];

export default function AdminAnalyticsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [fbRes, prodRes] = await Promise.all([
        api.from('feedback').select('*'),
        api.from('products').select('*'),
      ]);

      if (fbRes.data) setFeedback(fbRes.data as Feedback[]);
      if (prodRes.data) {
        const map: Record<string, Product> = {};
        (prodRes.data as Product[]).forEach((p) => { map[p.id] = p; });
        setProducts(map);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const total = feedback.length;
  const avgRating = total > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '0.0';
  const positiveCount = feedback.filter((f) => f.sentiment === 'Positive').length;

  // Rating distribution bar chart data
  const ratingData = useMemo(() =>
    [1, 2, 3, 4, 5].map((r) => ({
      rating: `${r} Star${r > 1 ? 's' : ''}`,
      count: feedback.filter((f) => f.rating === r).length,
    })),
  [feedback]);

  // Rating trend over time (line chart) — group by week
  const trendData = useMemo(() => {
    if (feedback.length === 0) return [];
    const byWeek: Record<string, { sum: number; count: number }> = {};
    feedback.forEach((f) => {
      const d = new Date(f.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byWeek[key]) byWeek[key] = { sum: 0, count: 0 };
      byWeek[key].sum += f.rating;
      byWeek[key].count += 1;
    });
    return Object.entries(byWeek)
      .map(([weekKey, { sum, count }]) => {
        const [month, day] = weekKey.split(' ');
        const year = new Date().getFullYear();
        const date = new Date(`${month} ${day}, ${year}`);
        return {
          week: weekKey,
          avgRating: Math.round((sum / count) * 100) / 100,
          count,
          _sort: date.getTime(),
        };
      })
      .sort((a, b) => a._sort - b._sort);
  }, [feedback]);

  // Feedback by category pie chart data
  const categoryData = useMemo(() =>
    ALL_CATEGORIES.map((cat) => ({
      name: cat,
      value: feedback.filter((f) => f.category === cat).length,
    })).filter((d) => d.value > 0),
  [feedback]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Feedback', value: total, icon: BarChart3, color: 'bg-primary-50 text-primary-600' },
    { label: 'Average Rating', value: avgRating, icon: Star, color: 'bg-blue-50 text-blue-600' },
    { label: 'Positive Sentiment', value: `${total > 0 ? Math.round((positiveCount / total) * 100) : 0}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Categories Tracked', value: categoryData.length, icon: PieChartIcon, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Analytics"
        description="Visual insights into feedback patterns, rating trends, and category distribution."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((stat) => {
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

      {total === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
            <BarChart3 className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">No data to analyze</h3>
          <p className="text-sm text-neutral-500">Analytics will appear once feedback is submitted.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar chart: Rating Distribution */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold text-neutral-900">Rating Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ratingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Line chart: Rating Trend Over Time */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-5 w-5 text-primary-600" />
                <h2 className="font-semibold text-neutral-900">Rating Trend Over Time</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e4e4e7',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                    name="Avg Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart: Feedback by Category */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <PieChartIcon className="h-5 w-5 text-primary-600" />
                <h2 className="font-semibold text-neutral-900">Feedback by Category</h2>
              </div>
              {categoryData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-neutral-500">
                  No categories assigned yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] ?? '#a1a1aa'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Product breakdown table */}
          <div className="card p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Feedback by Product</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left">
                    <th className="pb-2 font-semibold text-neutral-600">Product</th>
                    <th className="pb-2 font-semibold text-neutral-600 text-right">Count</th>
                    <th className="pb-2 font-semibold text-neutral-600 text-right">Avg Rating</th>
                    <th className="pb-2 font-semibold text-neutral-600 text-right">Positive %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {Object.entries(
                    feedback.reduce((acc, f) => {
                      if (!acc[f.product_id]) acc[f.product_id] = { count: 0, sum: 0, positive: 0 };
                      acc[f.product_id].count++;
                      acc[f.product_id].sum += f.rating;
                      if (f.sentiment === 'Positive') acc[f.product_id].positive++;
                      return acc;
                    }, {} as Record<string, { count: number; sum: number; positive: number }>)
                  )
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([pid, stats]) => (
                      <tr key={pid}>
                        <td className="py-2.5 font-medium text-neutral-900">
                          {products[pid]?.name ?? 'Unknown'}
                        </td>
                        <td className="py-2.5 text-neutral-700 text-right">{stats.count}</td>
                        <td className="py-2.5 text-neutral-700 text-right">
                          {(stats.sum / stats.count).toFixed(1)}
                        </td>
                        <td className="py-2.5 text-neutral-700 text-right">
                          {Math.round((stats.positive / stats.count) * 100)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
