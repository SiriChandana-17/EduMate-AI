import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tutorApi, quizApi, plannerApi, analyticsApi } from '../services/api';
import {
  BrainCircuit,
  BookOpen,
  HelpCircle,
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [convRes, quizRes, taskRes, analyticsRes] = await Promise.allSettled([
        tutorApi.listConversations(),
        quizApi.history(),
        plannerApi.getTasks(),
        analyticsApi.getSummary()
      ]);

      if (convRes.status === 'fulfilled' && convRes.value.success) {
        setConversations(convRes.value.conversations.slice(0, 4));
      }
      if (quizRes.status === 'fulfilled' && quizRes.value.success) {
        setQuizzes(quizRes.value.quizzes.slice(0, 4));
      }
      if (taskRes.status === 'fulfilled' && taskRes.value.success) {
        setTasks(taskRes.value.tasks.slice(0, 4));
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyActivity =
    (conversations && conversations.length > 0) ||
    (quizzes && quizzes.length > 0) ||
    (tasks && tasks.length > 0);

  return (
    <div>
      {/* 1. WELCOME BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
        borderRadius: '20px',
        padding: '2.25rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-indigo">
              <Sparkles size={14} /> AI Academic Assistant
            </span>
            <span className="badge badge-blue">
              {user?.student_class || 'Class 9'}
            </span>
            <span className="badge badge-green">
              {user?.preferred_language || 'English'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.1rem', color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: 800 }}>
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.5 }}>
            Ready to master today's curriculum? Ask questions in Mathematics, Science, English, or Social Studies, generate study notes, and take smart quizzes.
          </p>
        </div>

        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />
      </div>

      {/* 2. WEAK TOPICS ALERT BANNER (If any identified) */}
      {analytics?.weak_topics && analytics.weak_topics.length > 0 && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              padding: '0.75rem',
              borderRadius: '12px'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#92400E', marginBottom: '0.2rem' }}>
                Weak Topic Identified: {analytics.weak_topics[0].topic} ({analytics.weak_topics[0].subject})
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#B45309' }}>
                Your average accuracy on this topic is {analytics.weak_topics[0].accuracy}%. Review notes or take a targeted practice quiz!
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/quizzes" className="btn-accent" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
              Practice Quiz
            </Link>
            <Link to="/notes" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
              Read Notes
            </Link>
          </div>
        </div>
      )}

      {/* 3. QUICK-ACCESS TOOLS CARDS */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.15rem', color: '#0F172A' }}>
        Academic AI Tools
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Card 1: AI Doubt Solver */}
        <Link to="/ai-tutor" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#EEF2FF',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.35rem' }}>AI Doubt Solver</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                Ask complex questions in Maths & Science. Get step-by-step guidance in English or Telugu.
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginTop: '1.25rem'
            }}>
              Ask a Doubt <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 2: AI Notes Generator */}
        <Link to="/notes" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#E0F2FE',
                color: '#0EA5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.35rem' }}>AI Notes Generator</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                Generate revision summaries, key definitions, and formula cheat-sheets on any topic.
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#0EA5E9',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginTop: '1.25rem'
            }}>
              Create Notes <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 3: Smart Quiz Generator */}
        <Link to="/quizzes" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <HelpCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.35rem' }}>Smart Quizzes</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                Test your conceptual grasp with 5 targeted MCQs, instant evaluation, and answer breakdowns.
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#10B981',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginTop: '1.25rem'
            }}>
              Start Quiz <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 4: Study Planner */}
        <Link to="/study-planner" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FFFBEB',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Calendar size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.35rem' }}>Study Planner</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                Organize tasks, track upcoming school tests, and get AI suggested revision intervals.
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#F59E0B',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginTop: '1.25rem'
            }}>
              Plan Studies <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>

      {/* 4. RECENT ACTIVITY OR ONBOARDING EMPTY STATE */}
      {!hasAnyActivity && !loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px dashed #CBD5E1',
          borderRadius: '20px',
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#EEF2FF',
            color: '#6366F1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Lightbulb size={30} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#0F172A' }}>
            Welcome to EduMate AI, {user?.name}!
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            You haven't performed any activities yet. Start by asking a doubt, generating revision notes, or taking a quick 5-question quiz to see your progress charts come to life!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/ai-tutor" className="btn-primary">
              <BrainCircuit size={18} /> Ask Your First Doubt
            </Link>
            <Link to="/quizzes" className="btn-secondary">
              <HelpCircle size={18} /> Take a Quick Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Quizzes */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A' }}>Recent Quiz Attempts</h3>
              <Link to="/quizzes" style={{ fontSize: '0.85rem' }}>View All</Link>
            </div>
            {quizzes.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>No quizzes attempted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quizzes.map((q) => (
                  <div key={q.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{q.topic}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{q.subject} • {q.difficulty}</div>
                    </div>
                    <span className={`badge ${q.percentage >= 60 ? 'badge-green' : 'badge-amber'}`}>
                      {q.score}/{q.total_questions} ({q.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Tasks */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A' }}>Upcoming Study Tasks</h3>
              <Link to="/study-planner" style={{ fontSize: '0.85rem' }}>Add Task</Link>
            </div>
            {tasks.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>No pending study tasks.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map((t) => (
                  <div key={t.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CheckCircle2 size={18} color={t.is_completed ? '#10B981' : '#CBD5E1'} />
                      <div>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: t.is_completed ? '#94A3B8' : '#0F172A',
                          textDecoration: t.is_completed ? 'line-through' : 'none'
                        }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{t.subject}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} /> {t.duration_minutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
