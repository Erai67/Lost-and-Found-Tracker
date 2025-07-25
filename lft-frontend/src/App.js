import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/lost" element={<PrivateRoute><LostItems /></PrivateRoute>} />
          <Route path="/found" element={<PrivateRoute><FoundItems /></PrivateRoute>} />
          <Route path="/report-lost" element={<PrivateRoute><ReportLost /></PrivateRoute>} />
          <Route path="/report-found" element={<PrivateRoute><ReportFound /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}
