import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, FileText, Key, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from './UserCard';
import '../dashboard/Dashboard.css'; // Reusing minimalist dashboard grid styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to load user dashboard', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboard();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderColor: 'var(--border-color)', borderTopColor: 'var(--primary-color)' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        User Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome back, {user ? user.name : 'User'}!
      </p>

      <div className="dashboard-grid">
        <UserCard 
          title="Account Status" 
          description="View your current account status and details."
          icon={Activity}
          actionLabel="View Status"
          onClick={() => navigate('/user/status')}
          primary={true}
        />
        
        <UserCard 
          title="My Requests" 
          description="View your pending and past requests."
          icon={FileText}
          actionLabel="View Requests"
          onClick={() => navigate('/user/requests')}
          primary={true}
        />
        
        <UserCard 
          title="My Tokens" 
          description="Manage your API tokens."
          icon={Key}
          actionLabel="View Tokens"
          onClick={() => navigate('/user/tokens')}
          primary={false}
        />
        
        <UserCard 
          title="Generate Token" 
          description="Create a new secure API token for access."
          icon={CheckCircle}
          actionLabel="Generate Token"
          onClick={() => navigate('/user/tokens?generate=true')}
          primary={true}
        />
      </div>
    </div>
  );
}

export default Dashboard;
