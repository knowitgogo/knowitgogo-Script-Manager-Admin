import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function RequestsView() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/requests`, {
          headers: { 'Accept': 'application/json' }
        });
        setRequests(response.data.data || response.data || []);
      } catch (err) {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <h2 style={{ margin: '0 0 1rem 0' }}>Pending Requests</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Request Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req, index) => (
              <tr key={index}>
                <td>{req.user || 'Unknown'}</td>
                <td>{req.type || 'General'}</td>
                <td>{req.date || 'Today'}</td>
                <td>
                  <button style={{ marginRight: '0.5rem' }}>Approve</button>
                  <button>Deny</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No pending requests</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsView;
