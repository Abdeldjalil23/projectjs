// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DossiersMedicauxPage from "./pages/medecin/DossiersMedicauxPage";
import VisitePeriodiquePage from "./pages/medecin/VisitePeriodiquePage";
import DossierDetailsPage from "./pages/medecin/DossierDetailsPage";
import NouvelleConsultation from "./pages/medecin/Nouvelleconsultation";
import PrescriptionsPage from "./pages/medecin/PrescriptionsPage";
import NouveauPatientPage from "./pages/medecin/NouveauPatientPage";
import SettingsPage from "./pages/SettingsPage";
import DoctorsPage from "./pages/admin/DoctorsPage";
import AddDoctorPage from "./pages/admin/AddDoctorPage";
import ReportsPage from "./pages/admin/ReportsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import AddDepartmentPage from "./pages/admin/AddDepartmentPage";
import StatsPage from "./pages/admin/StatsPage";

import PrivateRoute from "./pages/PrivateRoute"; 
import { AuthProviderWithNavigate } from "./context/AuthProviderWithNavigate";
import LoginPage from "./components/LoginScreen"; 
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProviderWithNavigate>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <PrivateRoute>
                  <PrescriptionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/nouveau-patient"
              element={
                <PrivateRoute>
                  <NouveauPatientPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <PrivateRoute>
                  <DoctorsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctors/add"
              element={
                <PrivateRoute>
                  <AddDoctorPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <ReportsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <PrivateRoute>
                  <DepartmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/departments/add"
              element={
                <PrivateRoute>
                  <AddDepartmentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <PrivateRoute>
                  <StatsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dossiers-medicaux"
              element={
                <PrivateRoute>
                  <DossiersMedicauxPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dossier/:id"
              element={
                <PrivateRoute>
                  <DossierDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dossier/:id/nouvelle-consultation"
              element={
                <PrivateRoute>
                  <NouvelleConsultation />
                </PrivateRoute>
              }
            />
            <Route
              path="/visite-periodique"
              element={
                <PrivateRoute>
                  <VisitePeriodiquePage />
                </PrivateRoute>
              }
            />
            {/* صفحة 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProviderWithNavigate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
