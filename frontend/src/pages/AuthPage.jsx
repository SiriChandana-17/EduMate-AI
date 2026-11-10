import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Globe2
} from 'lucide-react';

export default function AuthPage({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize tab if navigated to /register or /login
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [studentClass, setStudentClass] = useState('Class 9');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regFieldErrors, setRegFieldErrors] = useState({});

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Email format validation
  const isValidEmail = (email) => {
    return /^[\w\.-]+@[\w\.-]+\.\w+$/.test(email.trim());
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both your email and password.');
      return;
    }

    if (!isValidEmail(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword, rememberMe);
    setLoginLoading(false);

    if (result.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegFieldErrors({});

    const errors = {};
    if (!regName.trim() || regName.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 letters).';
    }
    if (!regEmail.trim() || !isValidEmail(regEmail)) {
      errors.email = 'Please provide a valid school/personal email.';
    }
    if (!regPassword || regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      errors.terms = 'Please accept the Terms & Privacy terms to register.';
    }

    if (Object.keys(errors).length > 0) {
      setRegFieldErrors(errors);
      setRegError(errors[Object.keys(errors)[0]]);
      return;
    }

    setRegLoading(true);
    const result = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      confirm_password: regConfirmPassword,
      student_class: studentClass,
      preferred_language: preferredLanguage,
      terms_accepted: termsAccepted
    });
    setRegLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setRegError(result.error || 'Registration failed. Please check the form.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0A0F1D',
      color: '#FFFFFF',
      fontFamily: 'var(--font-family)'
    }}>
      <style>{`
        .auth-container {
          display: flex;
          width: 100vw;
          min-height: 100vh;
        }
        .auth-left {
          flex: 1.1;
          background: radial-gradient(circle at 10% 20%, #162454 0%, #0A0F1D 90%);
          padding: 4rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .auth-left::before {
          content: '';
          position: absolute;
          top: -150px;
          right: -150px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
        }
        .auth-right {
          flex: 0.9;
          background-color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          overflow-y: auto;
        }
        .auth-card {
          width: 100%;
          max-width: 480px;
          background-color: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.25rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .tab-btn {
          flex: 1;
          padding: 0.85rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.2s ease;
          color: #94A3B8;
          text-align: center;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }
        .tab-btn:hover:not(.active) {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.05);
        }
        .auth-input-dark {
          background-color: #0F172A !important;
          border: 1.5px solid #334155 !important;
          color: #FFFFFF !important;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          width: 100%;
        }
        .auth-input-dark:focus {
          border-color: #818CF8 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
        }
        .field-group {
          margin-bottom: 1.15rem;
        }
        .field-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #CBD5E1;
          margin-bottom: 0.45rem;
        }
        @media (max-width: 900px) {
          .auth-container {
            flex-direction: column;
          }
          .auth-left {
            padding: 2.5rem 1.75rem;
            min-height: auto;
          }
          .auth-right {
            padding: 2rem 1.25rem;
          }
          .auth-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="auth-container">
        {/* LEFT SECTION — BRANDING & VALUE PROPOSITION */}
        <div className="auth-left">
          {/* Top Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', zIndex: 1 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
            }}>
              <Sparkles size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                EduMate <span style={{ color: '#38BDF8' }}>AI</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Classes 6 – 10 Academic Assistant
              </p>
            </div>
          </div>

          {/* Central Hero Headline & Illustration */}
          <div style={{ margin: '3rem 0', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              padding: '0.35rem 0.9rem',
              fontSize: '0.82rem',
              color: '#A5B4FC',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}>
              <GraduationCap size={16} /> Empowering Indian School Students
            </div>

            <h2 style={{
              fontSize: '2.6rem',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#FFFFFF',
              marginBottom: '1rem',
              letterSpacing: '-0.5px'
            }}>
              Your Personal <span style={{
                background: 'linear-gradient(135deg, #A5B4FC 0%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>AI Learning</span> Companion
            </h2>

            <p style={{
              fontSize: '1.1rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '2.5rem'
            }}>
              Learn smarter, understand better, and achieve your academic goals with personalized curriculum guidance in English and Telugu.
            </p>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.15rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}>
                <div style={{
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#A5B4FC'
                }}>
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.2rem' }}>AI Doubt Solver</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Step-by-step explanations in Maths, Science & English.</p>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.15rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}>
                <div style={{
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(14, 165, 233, 0.2)',
                  color: '#38BDF8'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Smart Quizzes</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>AI-crafted MCQs with weak-topic analytics.</p>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.15rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}>
                <div style={{
                  padding: '0.55rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399'
                }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Study Planner</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Smart daily schedules with breaks and revisions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            color: '#64748B',
            fontSize: '0.82rem',
            zIndex: 1
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="#34D399" /> Safe & Curated for Classes 6–10
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe2 size={16} color="#38BDF8" /> English & Telugu Supported
            </span>
          </div>
        </div>

        {/* RIGHT SECTION — AUTHENTICATION CARD */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Top Navigation Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#0F172A',
              padding: '0.35rem',
              borderRadius: '14px',
              marginBottom: '1.75rem',
              border: '1px solid #334155'
            }}>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
              >
                Register
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                    Welcome back!
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                    Sign in to continue your personalized study sessions.
                  </p>
                </div>

                {loginError && (
                  <div className="alert-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }}>
                    <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#FCA5A5' }}>{loginError}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="field-group">
                  <label className="field-label">Student Email Address</label>
                  <input
                    type="email"
                    className="auth-input-dark"
                    placeholder="student@school.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div className="field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      style={{ fontSize: '0.8rem', color: '#818CF8' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="auth-input-dark"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8'
                      }}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#6366F1' }}
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                    Remember me on this browser
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loginLoading}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  {loginLoading ? (
                    <>
                      <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to EduMate <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#94A3B8' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Register now
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} noValidate>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                    Create Student Account
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                    Join EduMate AI to unlock step-by-step doubt solving & smart quizzes.
                  </p>
                </div>

                {regError && (
                  <div className="alert-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }}>
                    <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#FCA5A5' }}>{regError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="field-group">
                  <label className="field-label">Student Full Name *</label>
                  <input
                    type="text"
                    className="auth-input-dark"
                    placeholder="e.g. Rahul Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                  {regFieldErrors.name && (
                    <span style={{ color: '#F87171', fontSize: '0.78rem' }}>{regFieldErrors.name}</span>
                  )}
                </div>

                {/* Email */}
                <div className="field-group">
                  <label className="field-label">Email Address *</label>
                  <input
                    type="email"
                    className="auth-input-dark"
                    placeholder="student@school.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  {regFieldErrors.email && (
                    <span style={{ color: '#F87171', fontSize: '0.78rem' }}>{regFieldErrors.email}</span>
                  )}
                </div>

                {/* Class & Language Selection Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.15rem' }}>
                  <div>
                    <label className="field-label">Grade / Class *</label>
                    <select
                      className="auth-input-dark"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                    >
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Learning Language *</label>
                    <select
                      className="auth-input-dark"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="field-group">
                  <label className="field-label">Create Password (min. 6 characters) *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className="auth-input-dark"
                      placeholder="Enter a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8'
                      }}
                    >
                      {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      className="auth-input-dark"
                      placeholder="Re-enter your password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8'
                      }}
                    >
                      {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {regFieldErrors.confirm_password && (
                    <span style={{ color: '#F87171', fontSize: '0.78rem' }}>{regFieldErrors.confirm_password}</span>
                  )}
                </div>

                {/* Terms and Privacy */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: '#6366F1' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4, cursor: 'pointer' }}>
                    I agree to the <span style={{ color: '#CBD5E1' }}>Academic Code of Conduct</span> and privacy policy for students.
                  </label>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={regLoading}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  {regLoading ? (
                    <>
                      <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Register & Start Learning <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: '#94A3B8' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Password Recovery
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              For student safety and privacy under school guidelines, please contact your school administrator or create a new student profile with your verified school email.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowForgotModal(false)}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
