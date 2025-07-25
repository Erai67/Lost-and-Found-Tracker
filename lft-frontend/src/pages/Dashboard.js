import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [lostItems, setLostItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const res = await API.get('/items/lost');
        setLostItems(res.data);
      } catch {
        setError('Failed to load your lost items');
      } finally {
        setLoadingItems(false);
      }
    };
    fetchLostItems();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await API.get('/items/matches');
        setMatches(res.data);
      } catch {
        setError('Failed to load matches');
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  const handleVerify = async (itemId) => {
    try {
      await API.put(`/items/verify/${itemId}`);
      setLostItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, matchStatus: 'verified' } : item
        )
      );
      alert('Match verified!');
    } catch {
      alert('Failed to verify match');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/items/lost/${itemId}`);
      setLostItems((prev) => prev.filter((item) => item._id !== itemId));
      alert('Lost item deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setNewName(item.name);
    setNewDescription(item.description);
    setNewLocation(item.location);
    setNewDate(item.date ? item.date.slice(0, 10) : '');
  };

  const handleReject = async (itemId) => {
    try {
      await API.put(`/items/reject/${itemId}`);
      setLostItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, matchedWith: null, matchStatus: 'pending' } : item
        )
      );
      alert('Match rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject match');
    }
  };

  const handleEditSubmit = async () => {
    if (!newName.trim()) return alert('Name cannot be empty');
    if (!newDescription.trim()) return alert('Description cannot be empty');

    try {
      const res = await API.put(`/items/lost/${editingItem._id}`, {
        name: newName,
        description: newDescription,
        location: newLocation,
        date: newDate,
      });
      setLostItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? res.data.item : item))
      );
      alert('Item updated');
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item');
    }
  };

  if (loadingItems || loadingMatches) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Your Lost Items</h2>

      {lostItems.map((item) => (
        <div
          key={item._id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fafafa',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
        >
          <h3>{item.name}</h3>
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>

          {item.matchedWith ? (
            <div style={{ backgroundColor: '#eaffea', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>🔔 Potential Match Found</h4>
              <p><strong>Found Item:</strong> {item.matchedWith.name || 'N/A'}</p>
              <p><strong>Description:</strong> {item.matchedWith.description || 'N/A'}</p>
              <p><strong>Location:</strong> {item.matchedWith.location || 'N/A'}</p>
              <p><strong>Reported By:</strong> {item.matchedWith.reportedBy?.username || 'N/A'} (
                {item.matchedWith.reportedBy?.email || 'No email'})
              </p>

              {item.matchedWith.image ? (
                <>
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.matchedWith.image}`}
                    alt="Matched item"
                    style={{
                      width: '200px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      marginTop: '0.5rem',
                    }}
                  />
                  <div style={{ marginTop: '0.5rem' }}>
                    {item.matchStatus !== 'verified' ? (
                      <>
                        <button onClick={() => handleVerify(item._id)}>✅ Verify</button>{' '}
                        <button onClick={() => handleReject(item._id)}>❌ Not Mine</button>
                      </>
                    ) : (
                      <p style={{ color: 'green' }}>✅ Match verified</p>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No image provided</p>
              )}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No match found for this item yet.</p>
          )}

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => openEditForm(item)}>✏️ Edit</button>{' '}
            <button onClick={() => handleDelete(item._id)}>🗑️ Delete</button>
          </div>
        </div>
      ))}

      {editingItem && (
        <div
          style={{
            border: '2px solid #0077cc',
            padding: '1.5rem',
            marginTop: '2rem',
            borderRadius: '8px',
            backgroundColor: '#f0f8ff',
          }}
        >
          <h3>Edit Item</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name:</label><br />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description:</label><br />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Location:</label><br />
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Date:</label><br />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <button onClick={handleEditSubmit}>💾 Save</button>{' '}
          <button onClick={() => setEditingItem(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
