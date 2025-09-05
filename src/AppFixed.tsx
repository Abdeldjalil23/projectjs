import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Debug from './pages/Debug';
import SimpleLogin from './pages/SimpleLogin';
import SimpleTest from './pages/SimpleTest';

const AppFixed = () => {
  console.log('AppFixed is rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<SimpleLogin />} />
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/simple-test" element={<SimpleTest />} />
        
        {/* Route 404 */}
        <Route path="*" element={<Debug />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppFixed;
