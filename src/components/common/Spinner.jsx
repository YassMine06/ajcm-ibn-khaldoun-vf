import React from 'react';

const Spinner = ({ size = 24, color = 'var(--green-600)', className = '' }) => {
  return (
    <div 
      className={`spinner ${className}`}
      style={{
        width: size,
        height: size,
        border: `3px solid var(--gray-100)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block'
      }}
    />
  );
};

export default Spinner;
