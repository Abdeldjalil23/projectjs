import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProviderWithNavigate } from "./context/AuthProviderWithNavigate";
import { ChroniqueProvider } from "./context/ChroniqueContext";

import Debug from './pages/Debug';
import SimpleLogin from './pages/SimpleLogin';
import SimpleTest from './pages/SimpleTest';

const queryClient = new QueryClient();

const AppFixed8 = () => {
  console.log('AppFixed8 is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProviderWithNavigate>
            <ChroniqueProvider>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<SimpleLogin />} />
                <Route path="/login" element={<SimpleLogin />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/simple-test" element={<SimpleTest />} />
                
                {/* Route 404 */}
                <Route path="*" element={<Debug />} />
              </Routes>
            </ChroniqueProvider>
          </AuthProviderWithNavigate>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppFixed8;
