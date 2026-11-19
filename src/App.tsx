import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import DentistDashboard from "./components/dashboard/DentistDashboard";

// Pages admin
import AdminDashboard from "./components/dashboard/AdminDashboard";
import ReportsPage from "./pages/admin/ReportsPage";
import VisitePerdPage from "./pages/admin/AdminViPerdPage";
import AdminViPerdPage from "./pages/admin/AdminViPerdPage";
import RequestsPriseEnChargePage from "./pages/admin/RequestsPriseEnCharge";

// Pages social
import SocialDashboard from "./components/dashboard/SocialDashboard";
import PatientSupportPage from "./pages/social/PatientSupportPage";
import SocialServicesPage from "./pages/social/SocialServicesPage";
import SocialReportsPage from "./pages/social/SocialReportsPage";
import SocialResourcesPage from "./pages/social/SocialResourcesPage";

// Pages dentist
import PatientManagement from "./pages/dentist/PatientManagement";

import PrivateRoute from "./pages/PrivateRoute";
import { AuthProviderWithNavigate } from "./context/AuthProviderWithNavigate";
import { useAuth, UserRole } from "./context/AuthContext";
import { dashboardPathFor } from "./lib/roles";
import { ChroniqueProvider } from "./context/ChroniqueContext";

const queryClient = new QueryClient();

const DOCTOR: UserRole[] = ["doctor"];
const ADMIN: UserRole[] = ["admin"];
const SOCIAL: UserRole[] = ["social"];
const DENTIST: UserRole[] = ["dentist"];

// Sends "/" to the dashboard of the logged-in role.
const HomeRedirect = () => {
  const { userRole } = useAuth();
  return <Navigate to={dashboardPathFor(userRole)} replace />;
};

const protectedRoutes: { path: string; element: JSX.Element; roles?: UserRole[] }[] = [
  { path: "/", element: <HomeRedirect /> },
  { path: "/settings", element: <SettingsPage /> },

  // Doctor
  { path: "/dashboard", element: <DoctorDashboard />, roles: DOCTOR },
  { path: "/medecin/dashboard", element: <DoctorDashboard />, roles: DOCTOR },
  { path: "/prescriptions", element: <PrescriptionsPage />, roles: DOCTOR },
  { path: "/medecin/reports", element: <MedReportsPage />, roles: DOCTOR },
  { path: "/dossiers-medicaux", element: <DossiersMedicauxPage />, roles: DOCTOR },
  { path: "/dossier/:id", element: <DossierDetailsPage />, roles: DOCTOR },
  { path: "/dossier/:id/nouvelle-consultation", element: <NouvelleConsultation />, roles: DOCTOR },
  { path: "/nouvelle-consultation", element: <NouvelleConsultation />, roles: DOCTOR },
  { path: "/visite-periodique", element: <MedViPerPage />, roles: DOCTOR },

  // Admin
  { path: "/admin/dashboard", element: <AdminDashboard />, roles: ADMIN },
  { path: "/admin/reports", element: <ReportsPage />, roles: ADMIN },
  { path: "/admin/visite-perdue", element: <AdminViPerdPage />, roles: ADMIN },
  { path: "/visite-perdue", element: <VisitePerdPage />, roles: ADMIN },
  { path: "/admin/requests-prise-en-charge", element: <RequestsPriseEnChargePage />, roles: ADMIN },

  // Social
  { path: "/social/dashboard", element: <SocialDashboard />, roles: SOCIAL },
  { path: "/social/patients", element: <PatientSupportPage />, roles: SOCIAL },
  { path: "/social/services", element: <SocialServicesPage />, roles: SOCIAL },
  { path: "/social/reports", element: <SocialReportsPage />, roles: SOCIAL },
  { path: "/social/resources", element: <SocialResourcesPage />, roles: SOCIAL },

  // Dentist
  { path: "/dentist/dashboard", element: <DentistDashboard />, roles: DENTIST },
  { path: "/dentist/patient-management", element: <PatientManagement />, roles: DENTIST },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors />
        <BrowserRouter>
          <AuthProviderWithNavigate>
            <ChroniqueProvider>
              <Routes>
                {/* Route login public */}
                <Route path="/login" element={<LoginPage />} />

                {/* Routes protégées */}
                {protectedRoutes.map(({ path, element, roles }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<PrivateRoute roles={roles}>{element}</PrivateRoute>}
                  />
                ))}

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChroniqueProvider>
          </AuthProviderWithNavigate>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
