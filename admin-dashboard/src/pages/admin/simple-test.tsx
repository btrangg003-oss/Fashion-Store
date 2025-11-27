import React from 'react';

export default function SimpleTest() {
  const handleClick = () => {
    alert('Nút hoạt động!');
    console.log('Button clicked at:', new Date().toLocaleTimeString());
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>
        🧪 Simple Button Test
      </h1>

      <div style={{ 
        background: '#f0fdf4', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #86efac'
      }}>
        <p style={{ margin: 0, fontSize: '1.125rem' }}>
          <strong>Test này không dùng styled-components</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
          Nếu nút này hoạt động → Vấn đề có thể ở styled-components
        </p>
      </div>

      <button
        onClick={handleClick}
        style={{
          padding: '1rem 2rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        Click để test
      </button>

      <button
        onClick={() => window.location.href = '/admin'}
        style={{
          padding: '1rem 2rem',
          background: 'white',
          color: '#3b82f6',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        ← Quay lại Admin
      </button>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>Hướng dẫn:</h3>
        <ol style={{ color: '#6b7280', paddingLeft: '1.5rem' }}>
          <li>Click nút &quot;Click để test&quot;</li>
          <li>Phải hiện alert &quot;Nút hoạt động!&quot;</li>
          <li>Mở Console (F12) → Phải thấy log</li>
          <li>Nếu OK → Vấn đề ở styled-components hoặc layout</li>
          <li>Nếu không OK → Vấn đề ở JavaScript/Browser</li>
        </ol>
      </div>
    </div>
  );
}
