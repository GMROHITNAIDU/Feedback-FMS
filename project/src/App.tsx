import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MyFeedbackPage from '@/pages/MyFeedbackPage';
import SubmitFeedbackPage from '@/pages/SubmitFeedbackPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';

function LoginRedirect() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }
  if (!user) return <LoginPage />;
  return <Navigate to={isAdmin ? '/admin' : '/my-feedback'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/register" element={<RegisterPage role="customer" />} />
            <Route path="/admin-register" element={<RegisterPage role="admin" />} />

            {/* Customer routes (protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/my-feedback" element={<MyFeedbackPage />} />
              <Route path="/submit" element={<SubmitFeedbackPage />} />
            </Route>

            {/* Admin routes (protected + admin) */}
            <Route
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
