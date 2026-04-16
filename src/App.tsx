/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
// ... rest of imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/app/Dashboard';
import AbsensiGuru from './pages/app/AbsensiGuru';
import AbsensiSiswa from './pages/app/AbsensiSiswa';
import RekapAbsensi from './pages/app/RekapAbsensi';
import DataSiswa from './pages/app/DataSiswa';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children, role }: { children: ReactNode; role?: 'admin' | 'guru' }) {
  const { currentUser, isLoading, isConfigured } = useApp();
  
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Konfigurasi Diperlukan</h2>
          <p className="text-slate-500 mb-6">
            Aplikasi ini memerlukan koneksi ke Supabase. Silakan masukkan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> di panel Secrets.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-600 break-all">
            Lihat file .env.example untuk panduan.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="absensi-guru" element={<AbsensiGuru />} />
            <Route path="absensi-siswa" element={<AbsensiSiswa />} />
            <Route path="rekap" element={<RekapAbsensi />} />
            <Route path="data-siswa" element={
              <ProtectedRoute role="admin">
                <DataSiswa />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
