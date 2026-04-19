import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Security from './pages/Security';
import ActivityLog from './pages/ActivityLog';
import AdminPanel from './pages/AdminPanel';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode((d) => {
      localStorage.setItem('darkMode', String(!d));
      return !d;
    });
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: darkMode ? '#111827' : '#f9fafb' }}>
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<Login darkMode={darkMode} />} />
            <Route path="/signup"          element={<Signup darkMode={darkMode} />} />
            <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} />} />
            <Route path="/reset-password"  element={<ResetPassword darkMode={darkMode} />} />
            <Route path="/verify-email"    element={<VerifyEmail darkMode={darkMode} />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard darkMode={darkMode} /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Profile darkMode={darkMode} /></ProtectedRoute>} />
            <Route path="/profile/security" element={<ProtectedRoute><Security darkMode={darkMode} /></ProtectedRoute>} />
            <Route path="/profile/activity" element={<ProtectedRoute><ActivityLog darkMode={darkMode} /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel darkMode={darkMode} /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
