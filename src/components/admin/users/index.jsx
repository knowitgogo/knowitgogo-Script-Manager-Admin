import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Pagination';
import CreateUserModal from './partials/CreateUserModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function UsersIndex() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1, searchQuery = search) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users?page=${page}&search=${searchQuery}`, {
        headers: { 'Accept': 'application/json' }
      });
      // Handle various response shapes: paginated, wrapped, or plain array
      const data = response.data;
      if (data.data && typeof data.current_page !== 'undefined') {
        setUsers(data.data);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data?.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data?.users?.data)) {
        setUsers(data.users.data);
      } else if (Array.isArray(data?.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateErrors({});
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/admin/users`, createFormData, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: response.data.message || 'User created successfully' });
      setShowCreateModal(false);
      setCreateFormData({ name: '', email: '', password: '', password_confirmation: '' });
      fetchUsers(currentPage, search);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key][0];
        }
        setCreateErrors(newErrors);
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    const handleToggleStatus = async (userId) => {
      try {
        const response = await axios.post(`${API_URL}/admin/users/${userId}/status`, {}, {
          headers: { 'Accept': 'application/json' }
        });
        setAlert({ type: 'success', message: response.data.message || 'User status updated successfully' });
        fetchUsers(currentPage, search);
      } catch (err) {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update user status' });
      }
    };

  if (isLoading && users.length === 0) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Users List</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchUsers(1, search); } }}
            className="form-input"
            style={{ width: '250px', margin: 0 }}
          />
          <button 
            className="nav-logout-btn" 
            style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}
            onClick={() => { setCurrentPage(1); fetchUsers(1, search); }}
          >
            Search
          </button>
          <button 
            className="nav-logout-btn" 
            style={{ background: 'var(--primary-color)', color: 'var(--primary-text)', marginLeft: '0.5rem' }}
            onClick={() => { setCreateFormData({ name: '', email: '', password: '', password_confirmation: '' }); setCreateErrors({}); setShowCreateModal(true); }}
          >
            + Create User
          </button>
        </div>
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.disabled ? 'status-disabled' : 'status-active'}`}>
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleStatus(user.id)}
                    style={{ 
                      padding: '0.35rem 0.75rem', 
                      background: user.disabled ? 'var(--primary-color)' : 'var(--error-bg)',
                      color: user.disabled ? 'var(--primary-text)' : 'var(--error-text)',
                      border: user.disabled ? '1px solid var(--primary-color)' : '1px solid var(--error-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginRight: '0.5rem'
                    }}
                  >
                    {user.disabled ? 'Enable' : 'Disable'}
                  </button>
                  <button 
                    style={{ 
                      padding: '0.35rem 0.75rem', 
                      background: 'transparent',
                      color: 'var(--primary-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginRight: '0.5rem'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    style={{ 
                      padding: '0.35rem 0.75rem', 
                      background: 'var(--error-bg)',
                      color: 'var(--error-text)',
                      border: '1px solid var(--error-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination 
        currentPage={currentPage} 
        lastPage={lastPage} 
        onPageChange={setCurrentPage} 
      />

      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={createFormData}
        setFormData={setCreateFormData}
        handleSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
        errors={createErrors}
      />
    </div>
  );
}

export default UsersIndex;
