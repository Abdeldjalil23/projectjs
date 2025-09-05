import React from 'react';

const HelloWorld: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🦷 Hello World!</h1>
        <p style={{ color: '#666' }}>If you can see this, React is working!</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px',
          color: '#1976d2'
        }}>
          Dental Chart System is Ready! 🚀
        </div>
      </div>
    </div>
  );
};

export default HelloWorld;
