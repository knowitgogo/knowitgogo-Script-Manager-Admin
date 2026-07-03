import React from 'react';

function UserCard({ title, description, icon: Icon, actionLabel, onClick, primary }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="icon-wrapper">
          {Icon && <Icon size={24} />}
        </div>
        <h2>{title}</h2>
      </div>
      <div className="card-body">
        <p>{description}</p>
      </div>
      <div className="card-footer">
        <button 
          className={`action-btn ${primary ? 'primary' : 'secondary'}`} 
          onClick={onClick}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default UserCard;
