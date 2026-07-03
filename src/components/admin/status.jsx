import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function StatusView() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/status`, {
          headers: { 'Accept': 'application/json' }
        });
        setStatus(response.data);
      } catch (err) {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <h2 style={{ margin: '0 0 1rem 0' }}>System Status</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Total Admins</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{status?.totalAdmins || 0}</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Total Managers</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{status?.totalManagers || 0}</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Total Users</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{status?.totalUsers || 0}</div>
        </div>
      </div>
    </div>
  );
}

export default StatusView;
