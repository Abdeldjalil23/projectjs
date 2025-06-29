// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./components/LoginScreen";

// Pages médecin
import DossiersMedicauxPage from "./pages/medecin/DossiersMedicauxPage";
import MedViPerPage from "./pages/medecin/MedViPerPage";
import DossierDetailsPage from "./pages/medecin/DossierDetailsPage";
import NouvelleConsultation from "./pages/medecin/Nouvelleconsultation";
import PrescriptionsPage from "./pages/medecin/PrescriptionsPage";
import MedReportsPage from "./pages/medecin/MedReportsPage";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";


// Pages admin
import AdminDashboard from "./components/dashboard/AdminDashboard";
import DoctorsPage from "./pages/admin/DoctorsPage";
import AddDoctorPage from "./pages/admin/AddDoctorPage";
import ReportsPage from "./pages/admin/ReportsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import AddDepartmentPage from "./pages/admin/AddDepartmentPage";
import StatsPage from "./pages/admin/StatsPage";
import VisitePerdPage from "./pages/admin/AdminViPerdPage";
import UsersPage from "./pages/admin/UsersPage";
import AdminViPerdPage from "./pages/admin/AdminViPerdPage";

// Pages social
import SocialDashboard from "./components/dashboard/SocialDashboard";
import PatientSupportPage from "./pages/social/PatientSupportPage";
import SocialServicesPage from "./pages/social/SocialServicesPage";
import SocialReportsPage from "./pages/social/SocialReportsPage";
import SocialResourcesPage from "./pages/social/SocialResourcesPage";


import PrivateRoute from "./pages/PrivateRoute";
import { AuthProviderWithNavigate } from "./context/AuthProviderWithNavigate";
import path from "path";

const queryClient = new QueryClient();

const protectedRoutes = [
  { path: "/", element: <Index /> },
  { path: "/prescriptions", element: <PrescriptionsPage /> },
  { path: "/medecin/reports", element: <MedReportsPage /> },
  { path: "/dashboard", element: <DoctorDashboard /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/social/dashboard", element: <SocialDashboard /> },
  { path: "/social/patients", element: <PatientSupportPage /> },
  { path: "/social/services", element: <SocialServicesPage /> },
  { path: "/social/reports", element: <SocialReportsPage /> },
  { path: "/social/resources", element: <SocialResourcesPage /> },
  { path: "/visite-perdue", element: <VisitePerdPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/admin/doctors", element: <DoctorsPage /> },
  { path: "/admin/doctors/add", element: <AddDoctorPage /> },
  { path: "/admin/reports", element: <ReportsPage /> },
  { path: "/admin/departments", element: <DepartmentsPage /> },
  { path: "/admin/departments/add", element: <AddDepartmentPage /> },
  { path: "/admin/stats", element: <StatsPage /> },
  { path: "/dossiers-medicaux", element: <DossiersMedicauxPage /> },
  { path: "/dossier/:id", element: <DossierDetailsPage /> },
  { path: "/dossier/:id/nouvelle-consultation", element: <NouvelleConsultation /> },
  { path: "/admin/visite-perdue", element: <AdminViPerdPage /> },
  { path: "/admin/users", element: <UsersPage /> },
  { path: "/visite-periodique", element: <MedViPerPage /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProviderWithNavigate>
          <Routes>
            {/* Route login public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes protégées */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<PrivateRoute>{element}</PrivateRoute>}
              />
            ))}

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProviderWithNavigate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
