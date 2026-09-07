import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ProfileDetailPage } from './pages/ProfileDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { SavedProfilesPage } from './pages/SavedProfilesPage';
import { SafetyPage } from './pages/SafetyPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProfilesPage } from './pages/admin/AdminProfilesPage';
import { AdminCreateProfilePage } from './pages/admin/AdminCreateProfilePage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Route Guards
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Show Public Navbar & Footer only on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public & Guest Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile/:id" element={<ProfileDetailPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedUserRoute>
                <DashboardPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/create-profile"
            element={
              <ProtectedUserRoute>
                <CreateProfilePage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedUserRoute>
                <EditProfilePage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedUserRoute>
                <SavedProfilesPage />
              </ProtectedUserRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="analytics" element={<AdminDashboardPage />} />
            <Route path="profiles" element={<AdminProfilesPage />} />
            <Route path="profiles/create" element={<AdminCreateProfilePage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto py-24 text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-white">404</h1>
                <p className="text-sm text-slate-400">The page you were looking for doesn't exist.</p>
                <a
                  href="/discover"
                  className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                >
                  Explore Discovery
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
