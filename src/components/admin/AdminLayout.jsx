import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import './AdminLayout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/admin/dashboard`, { headers: { 'Accept': 'application/json' } })
      .then((res) => {
        setIsAuthenticated(true);
        setUserName(res.data?.admin?.name || res.data?.user?.name || res.data?.name || '');
      })
      .catch(() => navigate('/admin/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/admin/logout`, {}, {
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      navigate('/admin/login');
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="admin-layout">
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <h2>Admin Panel</h2>
        </div>
        <div className="navbar-links">
          <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>Dashboard</Link>
          <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>Users</Link>
          <Link to="/admin/managers" className={`nav-link ${isActive('/admin/managers')}`}>Managers</Link>
          <Link to="/admin/tokens" className={`nav-link ${isActive('/admin/tokens')}`}>Tokens</Link>
          <Link to="/admin/requests" className={`nav-link ${isActive('/admin/requests')}`}>Requests</Link>
          <Link to="/admin/status" className={`nav-link ${isActive('/admin/status')}`}>Status</Link>
        </div>
        <div className="nav-actions-container">
          {userName && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginRight: '0.75rem', fontWeight: 500 }}>Hi, {userName}</span>}
          <ThemeToggle />
          <button className="nav-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
