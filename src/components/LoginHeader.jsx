import React from 'react';

function LoginHeader({ title = "Admin Portal", subtitle = "Admins and managers can sign in here." }) {
  return (
    <div className="login-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

export default LoginHeader;
