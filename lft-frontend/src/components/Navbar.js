import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    marginRight: '10px',
    color: isActive ? 'green' : 'black',
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  return (
    <nav style={{
      padding: '10px 20px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {token ? (
          <>
            <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
            <NavLink to="/lost" style={linkStyle}>Lost Items</NavLink>
            <NavLink to="/found" style={linkStyle}>Found Items</NavLink>
            <NavLink to="/report-lost" style={linkStyle}>Report Lost</NavLink>
            <NavLink to="/report-found" style={linkStyle}>Report Found</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>Login</NavLink>
            <NavLink to="/register" style={linkStyle}>Register</NavLink>
          </>
        )}
      </div>
      {token && (
        <span
          onClick={handleLogout}
          style={{
            cursor: 'pointer',
            color: 'crimson',
            fontWeight: 'bold'
          }}
        >
          Logout
        </span>
      )}
    </nav>
  );
}
