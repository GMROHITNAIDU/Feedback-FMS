import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  ClipboardList,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  const primaryLink = user ? (isAdmin ? '/admin' : '/my-feedback') : '/register';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl translate-y-20 -translate-x-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-semibold text-primary-700 tracking-wide uppercase">
                  Feedback Management Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                Collect, analyze, and{' '}
                <span className="text-primary-600">act on feedback</span> that matters.
              </h1>

              <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-xl">
                FeedbackHub gives your team a single place to gather customer insights,
                understand sentiment trends, and close the loop faster than ever.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to={primaryLink} className="btn-primary text-base !px-6 !py-3">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base !px-6 !py-3">
                  Sign In
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Set up in minutes
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-primary-100/50">
                {/* Mock dashboard card */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                      <MessageSquareText className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-neutral-900">Feedback Dashboard</span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                    <p className="text-2xl font-bold text-neutral-900">847</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Total Feedback</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                    <p className="text-2xl font-bold text-primary-600">4.6</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Avg Rating</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                    <p className="text-2xl font-bold text-emerald-600">92%</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Resolved</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { type: 'Review', sentiment: 'Positive', color: 'bg-emerald-100 text-emerald-700' },
                    { type: 'Suggestion', sentiment: 'Positive', color: 'bg-blue-100 text-blue-700' },
                    { type: 'Complaint', sentiment: 'Negative', color: 'bg-red-100 text-red-700' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-neutral-700">{item.type}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.color}`}>
                        {item.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-5 -left-5 rounded-xl bg-white border border-neutral-200 shadow-lg p-4 w-48 animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary-600" />
                  <span className="text-xs font-semibold text-neutral-900">Sentiment Trend</span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 45, 65, 70, 60, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary-200 to-primary-500"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Everything you need to{' '}
              <span className="text-primary-600">close the feedback loop</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Three powerful capabilities working together to transform how your team handles feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Collect */}
            <div className="card p-8 group hover:shadow-lg hover:border-primary-200 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors mb-6">
                <ClipboardList className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Collect</h3>
              <p className="text-neutral-600 leading-relaxed">
                Gather structured feedback across all your products. Customers can rate,
                categorize, and describe their experience in seconds — no friction, no hassle.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Multi-product feedback collection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Star ratings & categories
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Bug reports, features, compliments
                </li>
              </ul>
            </div>

            {/* Analyze */}
            <div className="card p-8 group hover:shadow-lg hover:border-primary-200 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors mb-6">
                <BarChart3 className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Analyze</h3>
              <p className="text-neutral-600 leading-relaxed">
                Turn raw feedback into actionable insights. Track sentiment trends, spot
                recurring issues, and identify what your customers love most.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Sentiment analysis dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Category & rating breakdowns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Trend tracking over time
                </li>
              </ul>
            </div>

            {/* Act */}
            <div className="card p-8 group hover:shadow-lg hover:border-primary-200 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors mb-6">
                <Zap className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Act</h3>
              <p className="text-neutral-600 leading-relaxed">
                Close the loop with built-in response workflows. Update statuses, reply
                directly to customers, and track resolution across your team.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Status tracking & admin replies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Product management tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" />
                  Real-time feedback pipeline
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 mb-6">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            Ready to transform your feedback process?
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Join teams using FeedbackHub to build better products through customer insights.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to={primaryLink} className="btn-primary text-base !px-6 !py-3">
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/admin-register" className="btn-secondary text-base !px-6 !py-3">
              Register as Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <MessageSquareText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-neutral-900">
              Feedback<span className="text-primary-600">Hub</span>
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            &copy; 2026 FeedbackHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
