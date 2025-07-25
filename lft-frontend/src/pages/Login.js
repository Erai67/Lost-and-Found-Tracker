import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setMessage('✅ Login successful!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setMessage('❌ Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '3rem auto',
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        backgroundColor: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', textAlign: 'center', color: message.includes('success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}
