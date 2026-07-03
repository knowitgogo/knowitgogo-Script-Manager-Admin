import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '2rem' }}>Page Not Found</h2>
      <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
