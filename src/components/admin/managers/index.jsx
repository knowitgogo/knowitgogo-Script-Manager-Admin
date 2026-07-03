import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Pagination from '../../Pagination';
import ManagerModal from './partials/ManagerModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ManagersIndex() {
  const [managers, setManagers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagers(currentPage);
  }, [currentPage]);

  const fetchManagers = async (page = 1, searchQuery = search) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/managers?page=${page}&search=${searchQuery}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = response.data;
      if (data.data && typeof data.current_page !== 'undefined') {
        setManagers(data.data);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      } else {
        setManagers(data.data || data || []);
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

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', password_confirmation: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (manager) => {
    setIsEdit(true);
    setEditingId(manager.id);
    setFormData({ name: manager.name, email: manager.email, password: '', password_confirmation: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    
    try {
      if (isEdit) {
        // If password is blank, remove it from formData so backend doesn't try to update it
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
          delete dataToSend.password_confirmation;
        }
        await axios.put(`${API_URL}/admin/managers/${editingId}`, dataToSend, {
          headers: { 'Accept': 'application/json' }
        });
        setAlert({ type: 'success', message: 'Manager updated successfully' });
      } else {
        await axios.post(`${API_URL}/admin/managers`, formData, {
          headers: { 'Accept': 'application/json' }
        });
        setAlert({ type: 'success', message: 'Manager created successfully' });
      }
      setShowModal(false);
      fetchManagers(currentPage, search);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key][0];
        }
        setErrors(newErrors);
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save manager' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/managers/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: 'Manager deleted successfully' });
      fetchManagers(currentPage, search);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete manager' });
    }
  };

  if (isLoading && managers.length === 0) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Managers List</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search managers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchManagers(1, search); } }}
            className="form-input"
            style={{ width: '250px', margin: 0 }}
          />
          <button 
            className="nav-logout-btn" 
            style={{ background: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}
            onClick={() => { setCurrentPage(1); fetchManagers(1, search); }}
          >
            Search
          </button>
          <Link to="/admin/managers/deleted" className="nav-logout-btn" style={{ background: 'var(--secondary-color)', color: 'var(--text-main)', textDecoration: 'none', marginLeft: '0.5rem' }}>Deleted Managers</Link>
          <button className="nav-logout-btn" style={{ background: 'var(--primary-color)', color: 'var(--primary-text)' }} onClick={handleOpenCreate}>+ Create Manager</button>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.length > 0 ? (
            managers.map(manager => (
              <tr key={manager.id}>
                <td>{manager.name}</td>
                <td>{manager.email}</td>
                <td>
                  <button style={{ marginRight: '0.5rem' }} onClick={() => handleOpenEdit(manager)}>Edit</button>
                  <button onClick={() => handleDelete(manager.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>No managers found</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination 
        currentPage={currentPage} 
        lastPage={lastPage} 
        onPageChange={setCurrentPage} 
      />

      <ManagerModal
        show={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        isEdit={isEdit}
      />
    </div>
  );
}

export default ManagersIndex;
