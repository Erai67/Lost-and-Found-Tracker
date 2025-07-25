import React, { useEffect, useState } from 'react';

export default function FoundItems() {
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all-found')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setFoundItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch found items');
        setLoading(false);
      });
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
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Found Items</h2>

      {loading && <p style={{ textAlign: 'center' }}>Loading found items...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && foundItems.length === 0 && (
        <p style={{ textAlign: 'center' }}>No found items reported yet.</p>
      )}

      {!loading && !error && foundItems.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, gap: '1rem', display: 'flex', flexDirection: 'column' }}>
          {foundItems.map(item => (
            <li
              key={item._id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <strong>{item.name}</strong> — {item.description} — <em>Location:</em> {item.location} — <em>Date:</em> {new Date(item.date).toLocaleDateString()}
              {item.reportedBy && (
                <span> — Reported by: {item.reportedBy.username || item.reportedBy.email}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
