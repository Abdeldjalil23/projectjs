import React from 'react';

const Debug: React.FC = () => {
  console.log('Debug component is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      color: 'white',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>
        <h1>🔴 DEBUG PAGE</h1>
        <p>If you see this, React is working!</p>
        <p>Check browser console for logs</p>
      </div>
    </div>
  );
};

export default Debug;
