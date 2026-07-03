import React, { useState } from 'react';

function GenerateTokenModal({ show, onClose, tokenName, setTokenName, handleSubmit, isSubmitting, error, generatedToken }) {
  const [copyStatus, setCopyStatus] = useState('');

  if (!show) return null;

  const scriptSnippet = `<script
  src="http://localhost:4173/chatbot.iife.js"
  data-api-url="http://127.0.0.1:8000/suggest/generate"
  data-api-key="${generatedToken}"
  defer
></script>`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h3>Generate New Token</h3>
        
        {generatedToken ? (
          <div style={{ marginTop: '1rem' }}>
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              Token generated successfully! Please copy the snippet below as it won't be shown again.
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Generated Token</label>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard(generatedToken, 'token')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  {copyStatus === 'token' ? 'Copied!' : 'Copy Token'}
                </button>
              </div>
              <div style={{ 
                padding: '0.75rem', 
                background: 'var(--bg-color)', 
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}>
                {generatedToken}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Embed Script</label>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard(scriptSnippet, 'script')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  {copyStatus === 'script' ? 'Copied!' : 'Copy Script'}
                </button>
              </div>
              <pre style={{ 
                padding: '1rem', 
                background: '#1e1e1e', 
                color: '#d4d4d4',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                margin: 0
              }}>
                <code>{scriptSnippet}</code>
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            {error && (
              <div className="error-message" style={{ marginBottom: '1rem', color: 'var(--error-text)' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label>Token Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={tokenName} 
                onChange={(e) => setTokenName(e.target.value)} 
                placeholder="e.g. API Access Token"
                required 
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-main)', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isSubmitting || !tokenName.trim()}
                style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
              >
                {isSubmitting ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default GenerateTokenModal;
