import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { ThemeProvider } from './context/themeContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>FINDIT+</h2>
          <p>Connecting to campus database...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <div className="bg-moving-layer" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;
