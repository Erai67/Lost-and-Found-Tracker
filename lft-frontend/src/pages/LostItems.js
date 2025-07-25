import React, { useEffect, useState } from 'react';
import API from '../api';

export default function LostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLost() {
      try {
        const res = await API.get('/items/lost');
        setItems(res.data);
      } catch {
        setError('Failed to load lost items');
      } finally {
        setLoading(false);
      }
    }
    fetchLost();
  }, []);

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '2rem auto',
        padding: '1.5rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Lost Items</h2>

      {loading && <p style={{ textAlign: 'center' }}>Loading lost items...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p style={{ textAlign: 'center' }}>No lost items reported yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, gap: '1rem', display: 'flex', flexDirection: 'column' }}>
          {items.map(i => (
            <li
              key={i._id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <strong>{i.name}</strong> — {i.description}<br />
              <em>Location:</em> {i.location} | <em>Date:</em> {new Date(i.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
