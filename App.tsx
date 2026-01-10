
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExamManager from './components/ExamManager';
import GradingDashboard from './components/GradingDashboard';
import AgentManagement from './components/AgentManagement';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Dashboard />} />
          <Route path="/agents" element={<AgentManagement />} />
          <Route path="/exams/:id" element={<ExamManager />} />
          <Route path="/exams/:id/grading" element={<GradingDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
