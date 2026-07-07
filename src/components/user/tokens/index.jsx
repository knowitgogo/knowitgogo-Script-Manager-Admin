import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import GenerateTokenModal from './partials/GenerateTokenModal';
import EditTokenModal from './partials/EditTokenModal';
import { Pencil, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

function TokensIndex() {
  const [tokensData, setTokensData] = useState({ data: [], current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState('never');
  const [generatedToken, setGeneratedToken] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTokenData, setEditTokenData] = useState(null);

  const [alert, setAlert] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page') || 1;
    if (params.get('generate') === 'true') {
      setShowGenerateModal(true);
    }
    fetchTokens(page);
  }, [location]);

  const fetchTokens = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tokens?page=${page}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.data.tokens) {
        setTokensData(response.data.tokens);
      }
    } catch (err) {
      console.error('Failed to load tokens', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    
    setGenerateError(null);
    setIsGenerating(true);
    try {
      // Parse custom expiry: "custom:2026-08-15" → expiry="custom", custom_date="2026-08-15"
      let expiry = newTokenExpiry;
      let customDate = null;
      if (newTokenExpiry.startsWith('custom:')) {
        expiry = 'custom';
        customDate = newTokenExpiry.split(':').slice(1).join(':');
      }
      const response = await axios.post(`${API_URL}/token/generate`, { name: newTokenName, expiry, custom_date: customDate }, {
        headers: { 'Accept': 'application/json' }
      });
      setGeneratedToken(response.data.data);
      setAlert({ type: 'success', message: response.data.message });
      setNewTokenName('');
      fetchTokens(tokensData.current_page);
    } catch (err) {
      let errorMsg = 'Failed to generate token';
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const errors = err.response.data.errors;
        errorMsg = Object.values(errors).flat()[0];
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setGenerateError(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (tokenId) => {
    if (!window.confirm('Are you sure you want to delete this token?')) return;
    try {
      const response = await axios.delete(`${API_URL}/tokens/${tokenId}`, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: response.data.message });
      fetchTokens(tokensData.current_page);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete token' });
    }
  };

  const handleToggleStatus = async (tokenId) => {
    try {
      const response = await axios.post(`${API_URL}/tokens/${tokenId}/disable`, {}, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: response.data.message });
      fetchTokens(tokensData.current_page);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change token status' });
    }
  };
  
  const openEditModal = (token) => {
    setEditTokenData({ id: token.id, name: token.name });
    setShowEditModal(true);
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTokenData.name.trim()) return;
    
    try {
      const response = await axios.put(`${API_URL}/tokens/${editTokenData.id}`, { name: editTokenData.name }, {
        headers: { 'Accept': 'application/json' }
      });
      setAlert({ type: 'success', message: response.data.message });
      setShowEditModal(false);
      fetchTokens(tokensData.current_page);
    } catch (err) {
      let errorMsg = 'Failed to update token';
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const errors = err.response.data.errors;
        errorMsg = Object.values(errors).flat()[0];
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setAlert({ type: 'error', message: errorMsg });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlert({ type: 'success', message: 'Token copied to clipboard!' });
    }).catch(err => {
      setAlert({ type: 'error', message: 'Failed to copy token' });
    });
  };

  if (isLoading && tokensData.data.length === 0) {
    return <div className="spinner" style={{ margin: '2rem auto', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary-color)' }}></div>;
  }

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>API Keys</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your project API keys. Remember to keep your API keys safe to prevent unauthorized access.</p>
        </div>
        <button 
          className="action-btn" 
          style={{ width: 'auto', padding: '0.625rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} 
          onClick={() => { setShowGenerateModal(true); setGeneratedToken(null); setGenerateError(null); setNewTokenExpiry('never'); setNewTokenName(''); }}
        >
          + Create API Key
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
        </div>
      )}

      {tokensData.data.length === 0 ? (
        <div style={{ padding: '2rem', background: 'var(--hover-bg)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center' }}>
          You have no tokens. Generate one to get started.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>NAME</th>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>SECRET KEY</th>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>CREATED</th>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>LAST USED</th>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>EXPIRES</th>
                <th style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>USAGE (24HRS)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokensData.data.map(token => (
                <tr key={token.id}>
                  <td style={{ fontWeight: '500' }}>{token.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{token.token ? token.token.substring(0, 4) + '...' + token.token.slice(-4) : 'gsk_...I7cX'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(token.created_at).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{token.usages_24h_count || 0} API Calls</td>
                  <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => openEditModal(token)} className="action-btn" style={{ padding: '0.5rem', background: 'var(--surface-color)', border: 'none', color: 'var(--text-muted)', width: 'auto', minWidth: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(token.id)} className="action-btn" style={{ padding: '0.5rem', background: 'rgba(255, 69, 58, 0.1)', border: 'none', color: 'var(--error-text)', width: 'auto', minWidth: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {tokensData.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: tokensData.last_page }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => { navigate(`/user/tokens?page=${page}`); fetchTokens(page); }}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                background: page === tokensData.current_page ? 'var(--primary-color)' : 'var(--surface-color)',
                color: page === tokensData.current_page ? 'var(--primary-text)' : 'var(--text-main)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <GenerateTokenModal 
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        generatedToken={generatedToken}
        setGeneratedToken={setGeneratedToken}
        newTokenName={newTokenName}
        setNewTokenName={setNewTokenName}
        newTokenExpiry={newTokenExpiry}
        setNewTokenExpiry={setNewTokenExpiry}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        copyToClipboard={copyToClipboard}
        error={generateError}
      />
      
      <EditTokenModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        editTokenData={editTokenData}
        setEditTokenData={setEditTokenData}
        handleEditSubmit={handleEditSubmit}
      />
    </div>
  );
}

export default TokensIndex;
