import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Debug from './pages/Debug';

const AppSimple = () => {
  console.log('AppSimple is rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Debug />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<Debug />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppSimple;
