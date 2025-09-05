import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Debug from './pages/Debug';
import SimpleLogin from './pages/SimpleLogin';
import SimpleTest from './pages/SimpleTest';

const queryClient = new QueryClient();

const AppFixed3 = () => {
  console.log('AppFixed3 is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default AppFixed3;
