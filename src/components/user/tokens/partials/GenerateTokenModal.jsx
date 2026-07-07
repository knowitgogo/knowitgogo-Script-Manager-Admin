import React, { useState } from 'react';

function GenerateTokenModal({
  show,
  onClose,
  generatedToken,
  setGeneratedToken,
  newTokenName,
  setNewTokenName,
  newTokenExpiry,
  setNewTokenExpiry,
  handleGenerate,
  isGenerating,
  copyToClipboard: parentCopyToClipboard,
  error
}) {
  const [copyStatus, setCopyStatus] = useState('');

  if (!show) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => console.error('Failed to copy', err));
  };

  const calculateDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleBackdropClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ background: '#171717', border: '1px solid #333', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Create API Key</h3>
          <button onClick={() => { onClose(); setGeneratedToken(null); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>&times;</button>
        </div>
        
        {generatedToken ? (
          <div>
            <div style={{ background: 'rgba(16, 163, 127, 0.1)', border: '1px solid rgba(16, 163, 127, 0.3)', color: '#10a37f', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>API Key Generated</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Please save this secret key somewhere safe and accessible. For security reasons, you won't be able to view it again through your account. If you lose this secret key, you'll need to generate a new one.</p>
            </div>
            
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#ececec' }}>SECRET KEY</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={generatedToken.token} 
                style={{ flex: 1, background: '#212121', border: '1px solid #333', color: '#fff', padding: '0.625rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}
              />
              <button type="button" onClick={() => handleCopy(generatedToken.token, 'token')} style={{ width: 'auto', padding: '0 1rem', minWidth: '80px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                {copyStatus === 'token' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* ── Embed Script Snippet ── */}
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#ececec' }}>EMBED SCRIPT</label>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#888' }}>
              Paste this snippet into your website's HTML to add the chatbot widget. If the user or token is disabled by an admin/manager, the widget will automatically stop working.
            </p>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <pre style={{ 
                padding: '1rem', 
                background: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                overflowX: 'auto',
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.8rem',
                color: '#d4d4d4',
                margin: 0,
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                <code>{`<script\n  src="http://localhost:4173/chatbot.iife.js"\n  data-api-url="${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/suggest/generate"\n  data-api-key="${generatedToken.token}"\n  defer\n></script>`}</code>
              </pre>
              <button 
                type="button" 
                onClick={() => handleCopy(`<script\n  src="http://localhost:4173/chatbot.iife.js"\n  data-api-url="${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/suggest/generate"\n  data-api-key="${generatedToken.token}"\n  defer\n></script>`, 'script')}
                style={{ 
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  padding: '0.3rem 0.75rem', 
                  background: copyStatus === 'script' ? '#10a37f' : 'rgba(255,255,255,0.1)', 
                  color: copyStatus === 'script' ? '#fff' : '#ccc', 
                  border: 'none', borderRadius: '4px', 
                  fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copyStatus === 'script' ? '✓ Copied!' : 'Copy Script'}
              </button>
            </div>

            <button type="button" onClick={() => { onClose(); setGeneratedToken(null); }} style={{ width: '100%', padding: '0.625rem', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleGenerate}>
            {error && (
              <div style={{ background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a', border: '1px solid rgba(255, 69, 58, 0.3)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="tokenName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#ececec' }}>Display Name</label>
              <input 
                type="text" 
                id="tokenName" 
                value={newTokenName}
                onChange={e => setNewTokenName(e.target.value)}
                placeholder="My API Key"
                required
                style={{ width: '100%', background: '#212121', border: '1px solid #333', color: '#fff', padding: '0.625rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#888' }}>
                A unique name to identify your API key.
              </p>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="tokenExpiry" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#ececec' }}>Expiration</label>
              <select 
                id="tokenExpiry" 
                value={newTokenExpiry}
                onChange={e => setNewTokenExpiry(e.target.value)}
                style={{ width: '100%', background: '#212121', border: '1px solid #333', color: '#fff', padding: '0.625rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                <option value="never">✓ No expiration</option>
                <option value="7_days">7 days ({calculateDate(7)})</option>
                <option value="30_days">30 days ({calculateDate(30)})</option>
                <option value="60_days">60 days ({calculateDate(60)})</option>
                <option value="90_days">90 days ({calculateDate(90)})</option>
                <option value="custom">Custom date...</option>
              </select>
              {newTokenExpiry === 'custom' && (
                <input
                  type="date"
                  id="customExpiryDate"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={e => setNewTokenExpiry('custom:' + e.target.value)}
                  style={{ width: '100%', marginTop: '0.5rem', background: '#212121', border: '1px solid #333', color: '#fff', padding: '0.625rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                />
              )}
              {newTokenExpiry.startsWith('custom:') && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#10a37f' }}>
                  Expires on: {new Date(newTokenExpiry.split(':').slice(1).join(':') + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#888' }}>
                Your API key will stop working after this date.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => onClose()} style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#ececec', fontWeight: '500', cursor: 'pointer', borderRadius: '6px' }}>Cancel</button>
              <button type="submit" disabled={isGenerating} style={{ padding: '0.5rem 1rem', background: '#10a37f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? 'Creating...' : 'Create API key'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default GenerateTokenModal;
