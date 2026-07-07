import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Pagination';
import GenerateTokenModal from './partials/GenerateTokenModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function TokensIndex() {
  const [tokens, setTokens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTokens(currentPage);
  }, [currentPage]);

  const fetchTokens = async (page = 1, searchQuery = search) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/tokens?page=${page}&search=${searchQuery}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = response.data;
      if (data.data && typeof data.current_page !== 'undefined') {
        setTokens(data.data);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      } else {
        setTokens(data.data || data || []);
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

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setGenerateError(null);
    setIsGenerating(true);
    
    try {
      const response = await axios.post(`${API_URL}/admin/token/generate`, { name: tokenName }, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      setGeneratedToken(response.data.token);
      // Not fetching tokens again because admin generating token doesn't seem to save it to DB currently
      // But we call fetchTokens just in case the backend gets updated to save it
      fetchTokens(currentPage, search);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setGenerateError(err.response.data.message || 'Validation error');
      } else {
        setGenerateError(err.response?.data?.message || 'Failed to generate token');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setTokenName('');
    setGenerateError(null);
    setGeneratedToken(null);
  };

  if (isLoading && tokens.length === 0) return <div>Loading...</div>;

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Tokens List</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search tokens..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchTokens(1, search); } }}
            className="form-input"
            style={{ width: '250px', margin: 0 }}
          />
          <button 
            className="nav-logout-btn" 
            style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}
            onClick={() => { setCurrentPage(1); fetchTokens(1, search); }}
          >
            Search
          </button>

        </div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>User</th>
            <th>Token (Prefix)</th>
            <th>Last Used At</th>
            <th>Usage Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.length > 0 ? (
            tokens.map(token => (
              <tr key={token.id}>
                <td>{token.name}</td>
                <td>{token.user ? token.user.name : 'Unknown User'}</td>
                <td>{token.token}</td>
                <td>{token.usages_max_created_at ? new Date(token.usages_max_created_at).toLocaleString() : 'Never'}</td>
                <td>{token.usage_count || 0}</td>
                <td>
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
                    Revoke
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', borderBottom: 'none', color: 'var(--text-muted)', padding: '3rem 0' }}>No tokens found</td>
            </tr>
          )}
        </tbody>
      </table>
      
      <Pagination 
        currentPage={currentPage} 
        lastPage={lastPage} 
        onPageChange={setCurrentPage} 
      />

      <GenerateTokenModal 
        show={showGenerateModal}
        onClose={closeGenerateModal}
        tokenName={tokenName}
        setTokenName={setTokenName}
        handleSubmit={handleGenerateToken}
        isSubmitting={isGenerating}
        error={generateError}
        generatedToken={generatedToken}
      />
    </div>
  );
}

export default TokensIndex;
