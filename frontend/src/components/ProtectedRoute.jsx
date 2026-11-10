import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        gap: '1.25rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={28} color="#FFFFFF" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>EduMate AI</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Verifying secure student session...</p>
        </div>
        <div className="spinner spinner-dark" style={{ width: '28px', height: '28px' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
