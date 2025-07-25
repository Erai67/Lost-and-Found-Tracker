import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function ReportLost() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    image: '',
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      await API.post('/items/lost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Lost item reported');
      navigate('/lost');
    } catch {
      alert('Failed to report lost item');
    }
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '2rem auto',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        background: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Report Lost Item</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          rows="4"
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          style={{ padding: '0.5rem 0' }}
        />

        {preview && (
          <div>
            <p style={{ marginBottom: '5px' }}>Image Preview:</p>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        )}

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
          Submit
        </button>
      </form>
    </div>
  );
}
