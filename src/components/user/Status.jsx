import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

function Status() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/status`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to load user status', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatus();
  }, [navigate]);

  if (isLoading) {
    return <div className="spinner" style={{ margin: '2rem auto', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary-color)' }}></div>;
  }

  if (!user) return <div>Failed to load status.</div>;

  return (
    <div className="admin-card" style={{ maxWidth: '800px' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Account Status</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Name:</strong>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{user.name}</span>
        </div>
        
        <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Email:</strong>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{user.email}</span>
        </div>
        
        <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Registered:</strong>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{new Date(user.created_at).toLocaleDateString()}</span>
        </div>

        <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Status:</strong>
          {user.disabled ? (
            <span style={{ color: 'var(--error-text)', fontWeight: 'bold' }}>Disabled</span>
          ) : (
            <span style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>Active</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Status;
