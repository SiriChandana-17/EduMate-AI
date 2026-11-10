import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {};
  const subjectPerformance = data?.subject_performance || [];
  const weakTopics = data?.weak_topics || [];
  const scoreTrends = data?.score_trends || [];

  const hasActivity = summary.total_quizzes > 0 || summary.total_tasks > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '0.25rem' }}>
          Learning Analytics & Weak-Topic Detection
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
          Real curriculum performance metrics calculated directly from your quiz attempts and study sessions.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="spinner spinner-dark" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748B' }}>Analyzing study records...</p>
        </div>
      ) : !hasActivity ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px dashed #CBD5E1',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '650px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#EEF2FF',
            color: '#6366F1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <BarChart3 size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', color: '#0F172A', marginBottom: '0.5rem' }}>
            No Learning Records Logged Yet
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            EduMate AI reports genuine metrics based on your actual performance rather than fabricated data. Take a quiz or complete study planner tasks to generate analytics!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/quizzes" className="btn-primary">
              <HelpCircle size={18} /> Take a Quiz
            </Link>
            <Link to="/study-planner" className="btn-secondary">
              <Clock size={18} /> Plan Study Tasks
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Stat Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Average Quiz Score</span>
                <Award size={20} color="#6366F1" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>
                {summary.average_score}%
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                Across {summary.total_quizzes} quiz attempts
              </p>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Weak Topics Found</span>
                <AlertTriangle size={20} color={weakTopics.length > 0 ? '#EF4444' : '#10B981'} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: weakTopics.length > 0 ? '#DC2626' : '#059669' }}>
                {summary.weak_topics_count}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                Topics scoring &lt; 70% accuracy
              </p>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Task Completion</span>
                <CheckCircle2 size={20} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>
                {summary.task_completion_rate}%
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                {summary.completed_tasks} of {summary.total_tasks} study tasks done
              </p>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Study Time Logged</span>
                <Clock size={20} color="#0EA5E9" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>
                {summary.total_minutes_studied} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748B' }}>mins</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                {Math.round((summary.total_minutes_studied / 60) * 10) / 10} hours of focused revision
              </p>
            </div>
          </div>

          {/* WEAK TOPIC DETECTION MODULE */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <AlertTriangle size={22} color="#F59E0B" />
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A' }}>Weak-Topic Detection & Next Steps</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Targeted recommendations based on chapters where your quiz score is below 70%.
                </p>
              </div>
            </div>

            {weakTopics.length === 0 ? (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <div style={{ fontWeight: 600, color: '#065F46' }}>No Weak Topics Detected! 🎉</div>
                  <div style={{ fontSize: '0.85rem', color: '#047857' }}>
                    You have maintained 70%+ accuracy across all your attempted quiz topics. Keep up the great work!
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {weakTopics.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1.5px solid #FDE68A',
                      backgroundColor: '#FFFBEB',
                      borderRadius: '14px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#92400E' }}>
                          {item.topic}
                        </span>
                        <span className="badge badge-amber">{item.subject}</span>
                        <span className="badge badge-red">{item.accuracy}% Accuracy</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#B45309', margin: 0 }}>
                        {item.recommendation}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <Link to="/notes" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}>
                        <BookOpen size={14} /> Open Notes
                      </Link>
                      <Link to="/quizzes" className="btn-accent" style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}>
                        <HelpCircle size={14} /> Practice Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS GRID (RECHARTS) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            {/* Subject-Wise Performance Bar Chart */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1.5rem' }}>
                Subject-Wise Average Quiz Score (%)
              </h3>
              {subjectPerformance.length === 0 ? (
                <p style={{ color: '#94A3B8' }}>Take quizzes across subjects to generate comparison chart.</p>
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Average Accuracy']} />
                      <Bar dataKey="average_percentage" fill="#6366F1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Score Trends Line Chart */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1.5rem' }}>
                Quiz Score Trend Progression
              </h3>
              {scoreTrends.length === 0 ? (
                <p style={{ color: '#94A3B8' }}>Take multiple quizzes to see your score improvement curve.</p>
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={scoreTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="topic" tick={{ fill: '#64748B', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                      <Line type="monotone" dataKey="percentage" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 5, fill: '#6366F1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
