import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import '../admin/AdminLayout.css'; // Reusing the same minimalist layout CSS

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/dashboard`, { headers: { 'Accept': 'application/json' } })
      .then((res) => {
        setIsAuthenticated(true);
        setUserName(res.data?.user?.name || res.data?.name || '');
      })
      .catch(() => navigate('/login'))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/login'); 
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

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
          <h2>User Portal</h2>
        </div>
        <div className="navbar-links">
          <Link to="/user/dashboard" className={`nav-link ${isActive('/user/dashboard')}`}>Dashboard</Link>
          <Link to="/user/tokens" className={`nav-link ${isActive('/user/tokens')}`}>Tokens</Link>
          <Link to="/user/requests" className={`nav-link ${isActive('/user/requests')}`}>Requests</Link>
          <Link to="/user/status" className={`nav-link ${isActive('/user/status')}`}>Status</Link>
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

export default UserLayout;
