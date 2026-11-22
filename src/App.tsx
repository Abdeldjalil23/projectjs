import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginScreen";
import PrivateRoute from "./pages/PrivateRoute";
import { AuthProviderWithNavigate } from "./context/AuthProviderWithNavigate";
import { useAuth, UserRole } from "./context/AuthContext";
import { dashboardPathFor } from "./lib/roles";
import { ChroniqueProvider } from "./context/ChroniqueContext";
import PageLoader from "./components/shared/PageLoader";

// Pages are loaded on demand so the first visit downloads less code.
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Pages médecin
const DossiersMedicauxPage = lazy(() => import("./pages/medecin/DossiersMedicauxPage"));
const MedViPerPage = lazy(() => import("./pages/medecin/MedViPerPage"));
const DossierDetailsPage = lazy(() => import("./pages/medecin/DossierDetailsPage"));
const NouvelleConsultation = lazy(() => import("./pages/medecin/Nouvelleconsultation"));
const PrescriptionsPage = lazy(() => import("./pages/medecin/PrescriptionsPage"));
const MedReportsPage = lazy(() => import("./pages/medecin/MedReportsPage"));
const DoctorDashboard = lazy(() => import("./components/dashboard/DoctorDashboard"));
const DentistDashboard = lazy(() => import("./components/dashboard/DentistDashboard"));

// Pages admin
const AdminDashboard = lazy(() => import("./components/dashboard/AdminDashboard"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const AdminViPerdPage = lazy(() => import("./pages/admin/AdminViPerdPage"));
const RequestsPriseEnChargePage = lazy(() => import("./pages/admin/RequestsPriseEnCharge"));
const AccountsPage = lazy(() => import("./pages/admin/AccountsPage"));
const RolesPermissionsPage = lazy(() => import("./pages/admin/RolesPermissionsPage"));

// Pages social
const SocialDashboard = lazy(() => import("./components/dashboard/SocialDashboard"));
const PatientSupportPage = lazy(() => import("./pages/social/PatientSupportPage"));
const SocialServicesPage = lazy(() => import("./pages/social/SocialServicesPage"));
const SocialReportsPage = lazy(() => import("./pages/social/SocialReportsPage"));
const SocialResourcesPage = lazy(() => import("./pages/social/SocialResourcesPage"));

// Pages dentist
const PatientManagement = lazy(() => import("./pages/dentist/PatientManagement"));

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

const protectedRoutes: { path: string; element: JSX.Element; roles?: UserRole[]; permission?: string }[] = [
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
  { path: "/visite-perdue", element: <Navigate to="/admin/visite-perdue" replace />, roles: ADMIN },
  { path: "/admin/requests-prise-en-charge", element: <RequestsPriseEnChargePage />, roles: ADMIN },
  { path: "/admin/accounts", element: <AccountsPage />, roles: ADMIN, permission: "users.manage" },
  { path: "/admin/roles", element: <RolesPermissionsPage />, roles: ADMIN, permission: "roles.manage" },

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
  // Arabic is written right to left: menus, dialogs and notifications follow the direction.
  const { i18n } = useTranslation();
  const dir = i18n.dir();

  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir={dir}>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors dir={dir} position={dir === "rtl" ? "bottom-left" : "bottom-right"} />
          <BrowserRouter>
            <AuthProviderWithNavigate>
              <ChroniqueProvider>
                <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Route login public */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Routes protégées */}
                  {protectedRoutes.map(({ path, element, roles, permission }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <PrivateRoute roles={roles} permission={permission}>
                          {element}
                        </PrivateRoute>
                      }
                    />
                  ))}

                  {/* Route 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </ChroniqueProvider>
            </AuthProviderWithNavigate>
          </BrowserRouter>
        </TooltipProvider>
      </DirectionProvider>
    </QueryClientProvider>
  );
}

export default App;
