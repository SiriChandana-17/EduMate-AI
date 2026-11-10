import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesApi } from '../services/api';
import {
  BookOpen,
  Plus,
  Sparkles,
  Download,
  Trash2,
  Edit3,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Copy
} from 'lucide-react';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Generator modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubject, setGenSubject] = useState('Science');
  const [genTopic, setGenTopic] = useState('');
  const [genNoteType, setGenNoteType] = useState('detailed');
  const [genLanguage, setGenLanguage] = useState(user?.preferred_language || 'English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);

  // Active view/edit note modal
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const subjects = ['All', 'Mathematics', 'Science', 'English', 'Social Studies'];
  const noteTypes = [
    { value: 'short', label: 'Short Notes' },
    { value: 'detailed', label: 'Detailed Chapter Notes' },
    { value: 'definitions', label: 'Key Definitions' },
    { value: 'formulas', label: 'Formulas & Equations' },
    { value: 'revision', label: 'Quick Revision Summary' }
  ];

  useEffect(() => {
    loadNotes();
  }, [selectedSubject, searchQuery]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await notesApi.list(params);
      if (res.success && res.notes) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGenerating(true);
    setGeneratedPreview(null);
    try {
      const res = await notesApi.generate({
        subject: genSubject,
        topic: genTopic.trim(),
        note_type: genNoteType,
        language: genLanguage,
        class_level: user?.student_class || 'Class 9'
      });

      if (res.success && res.note) {
        setGeneratedPreview(res.note);
      }
    } catch (err) {
      alert('Failed to generate notes: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePreview = async () => {
    if (!generatedPreview) return;
    try {
      const res = await notesApi.save(generatedPreview);
      if (res.success) {
        setShowGenModal(false);
        setGeneratedPreview(null);
        setGenTopic('');
        loadNotes();
      }
    } catch (err) {
      alert('Failed to save note: ' + err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!activeNote) return;
    try {
      const res = await notesApi.update(activeNote.id, {
        title: editTitle,
        content: editContent
      });
      if (res.success) {
        setActiveNote(res.note);
        setIsEditing(false);
        loadNotes();
      }
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleDownload = (note) => {
    const element = document.createElement('a');
    const file = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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
            AI Study Notes ({user?.student_class || 'Class 9'})
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
            Generate, save, and download structured revision summaries & formulas.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setGeneratedPreview(null);
            setShowGenModal(true);
          }}
        >
          <Sparkles size={18} /> Generate New Notes
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Subject Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSubject(s)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: selectedSubject === s ? '#6366F1' : '#F8FAFC',
                color: selectedSubject === s ? '#FFFFFF' : '#475569',
                border: selectedSubject === s ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                transition: 'all 0.15s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search notes by topic or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-dark" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748B' }}>Loading study notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px dashed #CBD5E1',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: '#EEF2FF',
            color: '#6366F1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <FileText size={26} />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '0.35rem' }}>No Notes Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {searchQuery || selectedSubject !== 'All'
              ? 'No notes match your filters. Try clearing the search or pick another subject.'
              : 'Create your first AI revision note by clicking Generate New Notes above.'}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowGenModal(true)}
          >
            <Sparkles size={16} /> Generate Now
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setActiveNote(note);
                setEditTitle(note.title);
                setEditContent(note.content);
                setIsEditing(false);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-indigo">{note.subject}</span>
                  <span className="badge badge-blue">{note.note_type}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '0.45rem' }}>
                  {note.title}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#64748B',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {note.content.replace(/[#*`_]/g, '')}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1.25rem',
                borderTop: '1px solid #F1F5F9',
                paddingTop: '0.85rem'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {note.language} • {note.class_level}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(note);
                    }}
                    style={{ color: '#0EA5E9', padding: '0.3rem' }}
                    title="Download Note"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, note.id)}
                    style={{ color: '#EF4444', padding: '0.3rem' }}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GENERATE NOTES MODAL */}
      {showGenModal && (
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
            maxWidth: '650px',
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
                <h3 style={{ fontSize: '1.2rem', color: '#0F172A' }}>Generate AI Study Notes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                style={{ color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {!generatedPreview ? (
                <form onSubmit={handleGenerate}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="field-label" style={{ color: '#334155' }}>Subject</label>
                    <select
                      value={genSubject}
                      onChange={(e) => setGenSubject(e.target.value)}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="field-label" style={{ color: '#334155' }}>Topic or Chapter Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Photosynthesis, Linear Equations, French Revolution..."
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="field-label" style={{ color: '#334155' }}>Note Format</label>
                      <select
                        value={genNoteType}
                        onChange={(e) => setGenNoteType(e.target.value)}
                      >
                        {noteTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" style={{ color: '#334155' }}>Language</label>
                      <select
                        value={genLanguage}
                        onChange={(e) => setGenLanguage(e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isGenerating || !genTopic.trim()}
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                        Generating structured notes...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Generate Notes
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="badge badge-green">Generated Successfully</span>
                    <button
                      type="button"
                      onClick={() => setGeneratedPreview(null)}
                      style={{ fontSize: '0.82rem', color: '#6366F1' }}
                    >
                      ← Back to Form
                    </button>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.75rem' }}>
                    {generatedPreview.title}
                  </h4>
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1rem',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                  }}>
                    {generatedPreview.content}
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSavePreview}
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    <Check size={18} /> Save Note to My Notebook
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW / EDIT SINGLE NOTE MODAL */}
      {activeNote && (
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
            maxWidth: '750px',
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
              <div>
                <span className="badge badge-indigo" style={{ marginRight: '0.5rem' }}>{activeNote.subject}</span>
                <span className="badge badge-blue">{activeNote.class_level}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(activeNote.content)}
                  style={{ color: copySuccess ? '#10B981' : '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                >
                  <Copy size={16} /> {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(activeNote)}
                  style={{ color: '#0EA5E9', padding: '0.2rem' }}
                  title="Download Note"
                >
                  <Download size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNote(null)}
                  style={{ color: '#94A3B8', padding: '0.2rem' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {isEditing ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="field-label" style={{ color: '#334155' }}>Note Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="field-label" style={{ color: '#334155' }}>Content (Markdown Supported)</label>
                    <textarea
                      rows={14}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>{activeNote.title}</h2>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditing(true)}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  </div>
                  <div style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: '#334155',
                    backgroundColor: '#F8FAFC',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}>
                    {activeNote.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
