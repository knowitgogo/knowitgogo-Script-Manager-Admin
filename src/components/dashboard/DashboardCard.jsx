import React from 'react';

function DashboardCard({ title, description, value, actionLabel, icon: Icon, primary, onClick }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="icon-wrapper">
          <Icon size={24} />
        </div>
        <h2>{title}</h2>
      </div>
      <div className="card-body">
        {value !== undefined && <div className="card-value">{value}</div>}
        <p>{description}</p>
      </div>
      <div className="card-footer">
        <button onClick={onClick} className={`action-btn ${primary ? 'primary' : 'secondary'}`}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default DashboardCard;
