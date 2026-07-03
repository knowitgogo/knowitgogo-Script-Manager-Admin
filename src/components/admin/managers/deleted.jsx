import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function DeletedManagers() {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeletedManagers();
  }, []);

  const fetchDeletedManagers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/managers/deleted`, {
        headers: { 'Accept': 'application/json' }
      });
      // Handle various response shapes
      const data = response.data;
      if (Array.isArray(data)) {
        setManagers(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setManagers(data.data);
      } else if (data?.managers?.data && Array.isArray(data.managers.data)) {
        setManagers(data.managers.data);
      } else {
        setManagers([]);
      }
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Are you sure you want to restore this manager?')) return;
    
    try {
      await axios.post(`${API_URL}/admin/managers/${id}/restore`, {}, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: 'Manager restored successfully' });
      fetchDeletedManagers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to restore manager' });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Deleted Managers</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>List of soft-deleted managers.</p>
        </div>
        <Link to="/admin/managers" className="nav-logout-btn" style={{ background: 'var(--secondary-color)', color: 'var(--text-main)', textDecoration: 'none' }}>
          Back to Active Managers
        </Link>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Deleted At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.length > 0 ? (
            managers.map(manager => (
              <tr key={manager.id}>
                <td>{manager.name}</td>
                <td>{manager.email}</td>
                <td>{manager.deleted_at ? new Date(manager.deleted_at).toLocaleString() : 'Unknown'}</td>
                <td>
                  <button onClick={() => handleRestore(manager.id)} style={{ background: 'var(--success-color)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Restore
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No deleted managers found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DeletedManagers;
