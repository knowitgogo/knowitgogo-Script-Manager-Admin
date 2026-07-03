import React from 'react';

function ManagerModal({
  show,
  onClose,
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  errors,
  isEdit
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow)', color: 'var(--text-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Manager' : 'Create Manager'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            {errors.name && <span style={{ color: 'var(--error-text)', fontSize: '0.875rem' }}>{errors.name}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            {errors.email && <span style={{ color: 'var(--error-text)', fontSize: '0.875rem' }}>{errors.email}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Password {isEdit && '(Leave blank to keep current)'}</label>
            <input 
              type="password" 
              id="password" 
              className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required={!isEdit}
            />
            {errors.password && <span style={{ color: 'var(--error-text)', fontSize: '0.875rem' }}>{errors.password}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password_confirmation">Confirm Password</label>
            <input 
              type="password" 
              id="password_confirmation" 
              className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`} 
              value={formData.password_confirmation}
              onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
              required={!isEdit}
            />
            {errors.password_confirmation && <span style={{ color: 'var(--error-text)', fontSize: '0.875rem' }}>{errors.password_confirmation}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="action-btn secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="action-btn primary">
              {isSubmitting ? 'Saving...' : 'Save Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManagerModal;
