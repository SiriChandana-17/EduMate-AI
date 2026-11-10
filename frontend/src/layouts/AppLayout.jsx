import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  BookOpen,
  HelpCircle,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Globe,
  GraduationCap
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ai-tutor', label: 'AI Doubt Solver', icon: BrainCircuit },
    { path: '/notes', label: 'AI Notes', icon: BookOpen },
    { path: '/quizzes', label: 'Smart Quizzes', icon: HelpCircle },
    { path: '/study-planner', label: 'Study Planner', icon: Calendar },
    { path: '/analytics', label: 'Learning Analytics', icon: BarChart3 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <style>{`
        .sidebar {
          width: 260px;
          background-color: #0F172A;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid #1E293B;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 100;
          transition: transform 0.3s ease;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          color: #94A3B8;
          font-weight: 500;
          font-size: 0.92rem;
          transition: all 0.2s ease;
          margin-bottom: 0.35rem;
          text-decoration: none;
        }
        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
          text-decoration: none;
        }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(14, 165, 233, 0.2) 100%);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #FFFFFF;
          font-weight: 600;
        }
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .topbar {
          height: 70px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .topbar {
            padding: 0 1rem;
          }
        }
      `}</style>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                EduMate <span style={{ color: '#38BDF8' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                School Assistant
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Bottom */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid #1E293B',
          backgroundColor: '#0A0F1D'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {user?.student_class || 'Class 9'}
                </span>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {user?.preferred_language || 'English'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              color: '#F87171',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                '@media (max-width: 900px)': { display: 'block' },
                color: '#0F172A'
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="#6366F1" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                Academic Dashboard • Classes 6–10
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#F1F5F9',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              color: '#475569'
            }}>
              <Globe size={15} color="#0EA5E9" />
              <span>Language: <strong>{user?.preferred_language || 'English'}</strong></span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#EEF2FF',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              color: '#4338CA',
              fontWeight: 600
            }}>
              <span>{user?.student_class || 'Class 9'}</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
