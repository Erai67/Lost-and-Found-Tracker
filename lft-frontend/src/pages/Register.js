import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import this

function Register() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      console.log('Registration success:', data);
      setMessage('✅ Registration successful!');

      // ✅ Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Registration failed:', error);
      setMessage('❌ Registration failed: ' + error.message);
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
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          value={usernameInput}
          onChange={e => setUsernameInput(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          required
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
          Register
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

export default Register;
