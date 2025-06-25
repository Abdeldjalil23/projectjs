
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ConsultationsPage from "./pages/CONSULTATIONS";
import DossiersMedicauxPage from './pages/DossiersMedicauxPage';
import SyntheseActivitesPage from './pages/SyntheseActivitesPage';
import VisitePeriodiquePage from './pages/VisitePeriodiquePage';

import PrescriptionsPage from "./pages/PrescriptionsPage";
import SettingsPage from "./pages/SettingsPage";
import DoctorsPage from "./pages/admin/DoctorsPage";
import AddDoctorPage from "./pages/admin/AddDoctorPage";
import ReportsPage from "./pages/admin/ReportsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import AddDepartmentPage from "./pages/admin/AddDepartmentPage";
import StatsPage from "./pages/admin/StatsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            {/* <Route path="/messages" element={<MessagesPage />} /> */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/add" element={<AddDoctorPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/dossiers-medicaux" element={<DossiersMedicauxPage />} />
            <Route path="/departments/add" element={<AddDepartmentPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/synthese-activites" element={<SyntheseActivitesPage />} />
            <Route path="/visite-periodique" element={<VisitePeriodiquePage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
