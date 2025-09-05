import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

const SimpleLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ID || !password) {
      alert('Please enter both ID and password');
      return;
    }

    login(selectedRole);
    alert(`Logged in as ${selectedRole}`);
    
    switch (selectedRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'doctor':
        navigate('/dashboard');
        break;
      case 'social':
        navigate('/social/dashboard');
        break;
      case 'dentist':
        navigate('/dentist/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '24px' }}>🦷 MedSuite Login</h1>
          <p style={{ color: '#666' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
              <option value="social">Social Worker</option>
              <option value="dentist">Dentist</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              ID
            </label>
            <input
              type="text"
              value={ID}
              onChange={(e) => setID(e.target.value)}
              placeholder="Enter your ID"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#EF8A23',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D67B16'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF8A23'}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Test credentials: Any ID and password will work
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
