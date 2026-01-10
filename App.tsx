
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExamManager from './components/ExamManager';
import GradingDashboard from './components/GradingDashboard';
import AgentManagement from './components/AgentManagement';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  // Simple authentication state persisted for session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tai_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('tai_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tai_auth');
  };

  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses" element={<Dashboard />} />
                  <Route path="/agents" element={<AgentManagement />} />
                  <Route path="/exams/:id" element={<ExamManager />} />
                  <Route path="/exams/:id/grading" element={<GradingDashboard />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
