import React from 'react';

function RegisterHeader({ title = "Create Admin", subtitle = "Register a new administrator account." }) {
  return (
    <div className="login-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

export default RegisterHeader;
