import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";

import Debug from './pages/Debug';
import SimpleLogin from './pages/SimpleLogin';
import SimpleTest from './pages/SimpleTest';

const queryClient = new QueryClient();

const AppFixed6 = () => {
  console.log('AppFixed6 is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppFixed6;
