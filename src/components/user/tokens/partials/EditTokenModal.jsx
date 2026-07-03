import React from 'react';

function EditTokenModal({
  show,
  onClose,
  editTokenData,
  setEditTokenData,
  handleEditSubmit
}) {
  if (!show || !editTokenData) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow)', color: 'var(--text-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Edit Token</h3>
          <button onClick={() => onClose()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>
        
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="editTokenName">Token Name</label>
            <input 
              type="text" 
              id="editTokenName" 
              className="form-control" 
              value={editTokenData.name}
              onChange={e => setEditTokenData({...editTokenData, name: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => onClose()} className="action-btn secondary">Cancel</button>
            <button type="submit" className="action-btn primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTokenModal;
