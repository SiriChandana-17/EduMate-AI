// Central API Service with credentials support for Flask session cookies

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include' // Crucial for Flask session cookies
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to EduMate backend server. Please make sure the backend is running.');
    }
    throw err;
  }
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me', { method: 'GET' })
};

export const tutorApi = {
  listConversations: () => request('/tutor/conversations', { method: 'GET' }),
  getConversation: (id) => request(`/tutor/conversations/${id}`, { method: 'GET' }),
  createConversation: (payload) => request('/tutor/conversations', { method: 'POST', body: payload }),
  deleteConversation: (id) => request(`/tutor/conversations/${id}`, { method: 'DELETE' }),
  askDoubt: (payload) => request('/tutor/ask', { method: 'POST', body: payload })
};

export const notesApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notes${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  generate: (payload) => request('/notes/generate', { method: 'POST', body: payload }),
  save: (payload) => request('/notes', { method: 'POST', body: payload }),
  get: (id) => request(`/notes/${id}`, { method: 'GET' }),
  update: (id, payload) => request(`/notes/${id}`, { method: 'PUT', body: payload }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' })
};

export const quizApi = {
  generate: (payload) => request('/quiz/generate', { method: 'POST', body: payload }),
  submit: (payload) => request('/quiz/submit', { method: 'POST', body: payload }),
  history: () => request('/quiz/history', { method: 'GET' }),
  get: (id) => request(`/quiz/${id}`, { method: 'GET' })
};

export const plannerApi = {
  getTasks: () => request('/planner/tasks', { method: 'GET' }),
  createTask: (payload) => request('/planner/tasks', { method: 'POST', body: payload }),
  toggleTask: (id) => request(`/planner/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/planner/tasks/${id}`, { method: 'DELETE' }),
  suggestSchedule: () => request('/planner/suggest', { method: 'POST' })
};

export const analyticsApi = {
  getSummary: () => request('/analytics/summary', { method: 'GET' })
};
