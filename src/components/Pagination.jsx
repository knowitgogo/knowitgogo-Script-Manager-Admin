import React from 'react';

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;

  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '0.5rem' }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-color)',
          color: 'var(--text-main)',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        Prev
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-color)',
            background: currentPage === page ? 'var(--primary-color)' : 'var(--surface-color)',
            color: currentPage === page ? 'var(--primary-text)' : 'var(--text-main)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-color)',
          color: 'var(--text-main)',
          borderRadius: '4px',
          cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
          opacity: currentPage === lastPage ? 0.5 : 1
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
