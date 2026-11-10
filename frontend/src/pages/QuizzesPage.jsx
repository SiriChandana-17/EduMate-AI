import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  History,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function QuizzesPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Generator form
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [generating, setGenerating] = useState(false);

  // Active quiz session
  const [activeQuiz, setActiveQuiz] = useState(null); // { quiz_id, questions, ... }
  const [answers, setAnswers] = useState({}); // { [question_id]: 'A' }
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await quizApi.history();
      if (res.success && res.quizzes) {
        setHistory(res.quizzes);
      }
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setResults(null);
    setAnswers({});
    try {
      const res = await quizApi.generate({
        subject,
        topic: topic.trim(),
        difficulty,
        class_level: user?.student_class || 'Class 9'
      });

      if (res.success) {
        setActiveQuiz(res);
      }
    } catch (err) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Check if unanswered questions remain
    const unansweredCount = activeQuiz.questions.filter((q) => !answers[q.id]).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await quizApi.submit({
        quiz_id: activeQuiz.quiz_id,
        answers
      });

      if (res.success) {
        setResults(res);
        if (res.passed) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        loadHistory();
      }
    } catch (err) {
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveQuiz(null);
    setResults(null);
    setAnswers({});
    setTopic('');
  };

  return (
    <div>
      {/* 1. QUIZ RUNNER SCREEN */}
      {activeQuiz && !results && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '850px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-indigo">{activeQuiz.subject}</span>
                <span className="badge badge-blue">{activeQuiz.difficulty}</span>
                <span className="badge badge-amber">{activeQuiz.class_level}</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', color: '#0F172A' }}>{activeQuiz.topic}</h2>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              style={{ fontSize: '0.85rem' }}
            >
              Exit Quiz
            </button>
          </div>

          {/* Question List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#6366F1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.5 }}>
                    {q.question_text}
                  </p>
                </div>

                {/* 4 MCQ Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const isSelected = answers[q.id] === letter;
                    const optText = q.options[letter];
                    return (
                      <div
                        key={letter}
                        onClick={() => handleSelectOption(q.id, letter)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.85rem 1.15rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #6366F1' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#6366F1' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {letter}
                        </span>
                        <span style={{
                          fontSize: '0.92rem',
                          color: isSelected ? '#312E81' : '#334155',
                          fontWeight: isSelected ? 600 : 400
                        }}>
                          {optText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#64748B' }}>
              Answered: <strong>{Object.keys(answers).length}</strong> of {activeQuiz.total_questions} questions
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              style={{ padding: '0.85rem 2rem' }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  Evaluating Answers...
                </>
              ) : (
                <>
                  Submit Quiz for Scoring <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. RESULTS BREAKDOWN SCREEN */}
      {results && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '850px',
          margin: '0 auto'
        }}>
          {/* Score Summary Banner */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: results.passed ? '#ECFDF5' : '#FFFBEB',
            border: `1.5px solid ${results.passed ? '#A7F3D0' : '#FDE68A'}`,
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: results.passed ? '#D1FAE5' : '#FEF3C7',
              color: results.passed ? '#059669' : '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Trophy size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#0F172A', marginBottom: '0.35rem' }}>
              {results.passed ? 'Excellent Work! 🎉' : 'Keep Practicing! 💪'}
            </h2>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: results.passed ? '#059669' : '#D97706', margin: '0.5rem 0' }}>
              {results.score} / {results.total_questions}
            </div>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Accuracy: <strong>{results.percentage}%</strong> • {results.subject} ({results.topic})
            </p>
          </div>

          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '1.25rem' }}>
            Detailed Answers & Explanations:
          </h3>

          {/* Question Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {results.results.map((res, i) => (
              <div
                key={res.id}
                style={{
                  border: `1.5px solid ${res.is_correct ? '#A7F3D0' : '#FCA5A5'}`,
                  backgroundColor: res.is_correct ? '#F0FDF4' : '#FEF2F2',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {res.is_correct ? (
                    <CheckCircle2 size={20} color="#10B981" />
                  ) : (
                    <XCircle size={20} color="#EF4444" />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                    Question {i + 1}: {res.question_text}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '0.75rem' }}>
                  <div>Your Answer: <strong>Option {res.student_answer || 'Skipped'}</strong></div>
                  <div>Correct Answer: <strong style={{ color: '#059669' }}>Option {res.correct_option}</strong> ({res.options[res.correct_option]})</div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  color: '#475569',
                  lineHeight: 1.5
                }}>
                  💡 <strong>Explanation:</strong> {res.explanation}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleReset}
            >
              <RotateCcw size={16} /> Take Another Quiz
            </button>
          </div>
        </div>
      )}

      {/* 3. DEFAULT QUIZ CREATOR & HISTORY VIEW */}
      {!activeQuiz && !results && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '0.25rem' }}>
              Smart AI Quizzes ({user?.student_class || 'Class 9'})
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
              Generate curriculum-aligned MCQs. Evaluated securely with instant detailed explanations.
            </p>
          </div>

          {/* Generator Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <Sparkles size={22} color="#6366F1" />
              <h2 style={{ fontSize: '1.25rem', color: '#0F172A' }}>Generate New Quiz</h2>
            </div>

            <form onSubmit={handleStartQuiz}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="field-label" style={{ color: '#334155' }}>Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" style={{ color: '#334155' }}>Topic or Chapter Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Gravity, Polynomials, Indian Constitution..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="field-label" style={{ color: '#334155' }}>Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={generating || !topic.trim()}
                style={{ padding: '0.85rem 1.75rem' }}
              >
                {generating ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                    Crafting 5 Curriculum MCQs...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Generate & Start Quiz
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Quiz History */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <History size={20} color="#6366F1" />
              <h3 style={{ fontSize: '1.2rem', color: '#0F172A' }}>Past Quiz Attempts</h3>
            </div>

            {loadingHistory ? (
              <p style={{ color: '#94A3B8' }}>Loading quiz history...</p>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                <p>No quizzes taken yet. Generate your first quiz above to start tracking your knowledge!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Topic</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Subject</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Difficulty</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Score</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#0F172A' }}>{h.topic}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#64748B' }}>{h.subject}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span className="badge badge-indigo">{h.difficulty}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{h.score} / {h.total_questions}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span className={`badge ${h.percentage >= 60 ? 'badge-green' : 'badge-amber'}`}>
                            {h.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
