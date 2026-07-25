import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
