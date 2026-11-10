import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { plannerApi } from '../services/api';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Sparkles,
  BookOpen,
  CalendarDays,
  Coffee,
  Check
} from 'lucide-react';

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Task Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Science');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Schedule Suggester state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [schedule, setSchedule] = useState([]);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'General'];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await plannerApi.getTasks();
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await plannerApi.createTask({
        title: title.trim(),
        subject,
        target_date: targetDate,
        duration_minutes: parseInt(duration, 10),
        notes: notes.trim()
      });

      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setNotes('');
        loadTasks();
      }
    } catch (err) {
      alert('Failed to add task: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await plannerApi.toggleTask(id);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
        );
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await plannerApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleGetSchedule = async () => {
    setShowScheduleModal(true);
    setLoadingSchedule(true);
    try {
      const res = await plannerApi.suggestSchedule();
      if (res.success && res.schedule) {
        setSchedule(res.schedule);
      }
    } catch (err) {
      alert('Failed to get schedule suggestion: ' + err.message);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '0.25rem' }}>
            Study Planner & Schedules ({user?.student_class || 'Class 9'})
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
            Track chapter revisions, exam deadlines, and study session intervals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleGetSchedule}
          >
            <Sparkles size={16} color="#6366F1" /> AI Timetable Suggester
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} /> Add Study Task
          </button>
        </div>
      </div>

      {/* Task Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Pending Tasks Column */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>
              Pending Tasks ({pendingTasks.length})
            </h3>
            <span className="badge badge-amber">{pendingTasks.length} To-Do</span>
          </div>

          {loading ? (
            <p style={{ color: '#94A3B8' }}>Loading tasks...</p>
          ) : pendingTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600, color: '#334155' }}>All caught up!</p>
              <p style={{ fontSize: '0.85rem' }}>No pending study tasks. Click "Add Study Task" to plan your week.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      style={{ color: '#CBD5E1', marginTop: '0.15rem' }}
                      title="Mark complete"
                    >
                      <Circle size={20} />
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.2rem' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem' }}>
                          {task.subject}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CalendarDays size={13} /> {task.target_date}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} /> {task.duration_minutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    style={{ color: '#94A3B8', padding: '0.2rem' }}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks Column */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>
              Completed Revisions ({completedTasks.length})
            </h3>
            <span className="badge badge-green">{completedTasks.length} Done</span>
          </div>

          {completedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
              <p>Check off tasks as you finish your study sessions to log your progress!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    opacity: 0.75
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      style={{ color: '#10B981', marginTop: '0.15rem' }}
                      title="Mark pending"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#64748B', textDecoration: 'line-through', marginBottom: '0.2rem' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem' }}>
                          {task.subject}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          Completed • {task.duration_minutes} mins logged
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    style={{ color: '#94A3B8', padding: '0.2rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD TASK MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0F172A', marginBottom: '1.25rem' }}>
              Add Study Task
            </h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label className="field-label" style={{ color: '#334155' }}>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Revise Chemistry Chapter 3, Solve Math Exercise 4.2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
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
                  <label className="field-label" style={{ color: '#334155' }}>Duration (Mins)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="25">25 Mins (Pomodoro)</option>
                    <option value="45">45 Mins (Standard)</option>
                    <option value="60">60 Mins (1 Hour)</option>
                    <option value="90">90 Mins (Deep Study)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="field-label" style={{ color: '#334155' }}>Target Due Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !title.trim()}
                >
                  {submitting ? 'Adding...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SCHEDULE SUGGESTER MODAL */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} color="#6366F1" />
                <h3 style={{ fontSize: '1.2rem', color: '#0F172A' }}>
                  AI Optimized Weekly Study Schedule ({user?.student_class || 'Class 9'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingSchedule ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div className="spinner spinner-dark" style={{ width: '28px', height: '28px', margin: '0 auto 1rem' }}></div>
                  <p style={{ color: '#64748B' }}>Crafting balanced timetable with revision and breaks...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {schedule.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{item.day}:</span>
                          <span className="badge badge-indigo">{item.subject}</span>
                          <span style={{ fontSize: '0.88rem', color: '#334155' }}>{item.focus}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                          💡 <em>{item.revision_tip}</em>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                          {item.recommended_minutes} mins study
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                          <Coffee size={12} /> {item.break_minutes}m break
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
