import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AppLayout from './layouts/AppLayout';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AiTutorPage from './pages/AiTutorPage';
import NotesPage from './pages/NotesPage';
import QuizzesPage from './pages/QuizzesPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth-First Routes */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <AuthPage initialTab="login" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AuthPage initialTab="login" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <AuthPage initialTab="register" />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes (Authenticated Students Only) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tutor"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AiTutorPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <QuizzesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StudyPlannerPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AnalyticsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
