import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { tutorApi } from '../services/api';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Plus,
  Trash2,
  MessageSquare,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Globe,
  AlertCircle
} from 'lucide-react';

export default function AiTutorPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [subject, setSubject] = useState('Science');
  const [language, setLanguage] = useState(user?.preferred_language || 'English');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await tutorApi.listConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !currentConvId) {
          selectConversation(res.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const selectConversation = async (id) => {
    try {
      setCurrentConvId(id);
      const res = await tutorApi.getConversation(id);
      if (res.success && res.conversation) {
        setMessages(res.conversation.messages || []);
        setSubject(res.conversation.subject || 'Science');
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const startNewConversation = () => {
    setCurrentConvId(null);
    setMessages([]);
    setInputText('');
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await tutorApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConvId === id) {
        startNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = inputText.trim();
    if (!query || loading) return;

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: query,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await tutorApi.askDoubt({
        question: query,
        subject,
        language,
        conversation_id: currentConvId
      });

      if (res.success && res.assistant_message) {
        setMessages((prev) => [...prev, res.assistant_message]);
        if (!currentConvId && res.conversation_id) {
          setCurrentConvId(res.conversation_id);
          loadConversations();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            isError: true,
            content: res.error || 'The AI service returned an unexpected response. Please try again.'
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          isError: true,
          content: err.message || '⚠️ Unable to reach the AI service. Please verify your connection or settings.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Input (Speech-to-Text via Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please use Google Chrome, Edge, or text input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Telugu' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Audio Output)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown hashes/asterisks for natural speech
    const cleanSpeech = text.replace(/[*#_`>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = language === 'Telugu' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 130px)',
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #E2E8F0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <style>{`
        .chat-sidebar {
          width: 280px;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          background-color: #F8FAFC;
        }
        .conv-item {
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 10px;
          margin-bottom: 0.35rem;
          cursor: pointer;
          font-size: 0.88rem;
          color: #334155;
          transition: all 0.15s ease;
        }
        .conv-item:hover {
          background-color: #EEF2FF;
          color: #4F46E5;
        }
        .conv-item.active {
          background-color: #EEF2FF;
          color: #4F46E5;
          font-weight: 600;
        }
        .message-bubble-user {
          align-self: flex-end;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #FFFFFF;
          border-radius: 16px 16px 4px 16px;
          padding: 1rem 1.25rem;
          max-width: 75%;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .message-bubble-assistant {
          align-self: flex-start;
          background-color: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          border-radius: 16px 16px 16px 4px;
          padding: 1.25rem 1.5rem;
          max-width: 80%;
          line-height: 1.6;
        }
        @media (max-width: 850px) {
          .chat-sidebar {
            display: none;
          }
        }
      `}</style>

      {/* CHAT CONVERSATIONS SIDEBAR */}
      <div className="chat-sidebar">
        <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={startNewConversation}
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem' }}
          >
            <Plus size={16} /> New Doubt Discussion
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            Previous Discussions
          </div>
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
              No discussions yet. Ask a question to begin!
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={`conv-item ${currentConvId === c.id ? 'active' : ''}`}
                onClick={() => selectConversation(c.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <MessageSquare size={16} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(e, c.id)}
                  style={{ color: '#94A3B8', padding: '0.2rem' }}
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT MAIN INTERFACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Controls Toolbar */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: '#FAFAFA'
        }}>
          {/* Subject Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Subject:</span>
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubject(sub)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: subject === sub ? '#6366F1' : '#FFFFFF',
                  color: subject === sub ? '#FFFFFF' : '#475569',
                  border: subject === sub ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                  transition: 'all 0.15s ease'
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={16} color="#6366F1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: 'auto',
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                borderRadius: '8px',
                borderColor: '#CBD5E1'
              }}
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              maxWidth: '520px',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#EEF2FF',
                color: '#6366F1',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                EduMate AI Doubt Solver ({user?.student_class || 'Class 9'})
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Ask any question from your school textbook. I will break it down into simple, step-by-step points with examples.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInputText('How do plants prepare food using photosynthesis?')}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.65rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    color: '#334155'
                  }}
                >
                  🌱 "How do plants prepare food using photosynthesis?"
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Can you explain Pythagoras theorem with a step-by-step example?')}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.65rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    color: '#334155'
                  }}
                >
                  📐 "Can you explain Pythagoras theorem with a step-by-step example?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              if (m.sender === 'user') {
                return (
                  <div key={m.id} className="message-bubble-user">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                );
              }

              const isError = m.isError || (typeof m.content === 'string' && m.content.startsWith('⚠️'));

              if (isError) {
                return (
                  <div key={m.id} className="message-bubble-error">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <AlertCircle size={20} color="#E11D48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.3rem', color: '#9F1239' }}>
                          AI Service Status
                        </div>
                        <div className="markdown-body" style={{ color: '#BE123C' }}>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="message-bubble-assistant">
                  <div className="markdown-body">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => speakText(m.content)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: isSpeaking ? '#EF4444' : '#6366F1',
                        fontWeight: 600
                      }}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {isSpeaking ? 'Stop Audio' : 'Listen Explanation'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="message-bubble-assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="spinner spinner-dark" style={{ width: '18px', height: '18px' }}></div>
              <span style={{ fontSize: '0.9rem', color: '#6366F1', fontWeight: 500 }}>
                EduMate AI is analyzing your doubt step-by-step...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Question Input Box */}
        <form onSubmit={handleSend} style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              backgroundColor: isListening ? '#EF4444' : '#F1F5F9',
              color: isListening ? '#FFFFFF' : '#475569',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isListening ? 'Listening... click to stop' : 'Speak your question (Speech to Text)'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              language === 'Telugu'
                ? 'మీ ప్రశ్న లేదా సందేహాన్ని ఇక్కడ టైప్ చేయండి...'
                : `Type your ${subject} doubt here (Classes 6–10)...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />

          {/* Send Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={!inputText.trim() || loading}
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
