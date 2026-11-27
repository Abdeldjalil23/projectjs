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
import PageLoader from "./components/shared/PageLoader";

// Pages are loaded on demand so the first visit downloads less code.
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const StaffDashboard = lazy(() => import("./components/dashboard/StaffDashboard"));
const AccountsPage = lazy(() => import("./pages/admin/AccountsPage"));
const RolesPermissionsPage = lazy(() => import("./pages/admin/RolesPermissionsPage"));
const BeneficiariesPage = lazy(() => import("./pages/beneficiaries/BeneficiariesPage"));
const ImportBeneficiariesPage = lazy(() => import("./pages/beneficiaries/ImportBeneficiariesPage"));
const PatientFilePage = lazy(() => import("./pages/patient/PatientFilePage"));
const VisitSchedulePage = lazy(() => import("./pages/visits/VisitSchedulePage"));
const VisitCertificatePage = lazy(() => import("./pages/visits/VisitCertificatePage"));
const DocumentsPage = lazy(() => import("./pages/documents/DocumentsPage"));
const DocumentPrintPage = lazy(() => import("./pages/documents/DocumentPrintPage"));
const MedicinesPage = lazy(() => import("./pages/medicines/MedicinesPage"));
const CareRequestsPage = lazy(() => import("./pages/careRequests/CareRequestsPage"));
const CareRequestPrintPage = lazy(() => import("./pages/careRequests/CareRequestPrintPage"));
const VerifyCareRequestPage = lazy(() => import("./pages/careRequests/VerifyCareRequestPage"));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));
const ReportPrintPage = lazy(() => import("./pages/reports/ReportPrintPage"));
const WorkerApp = lazy(() => import("./worker/WorkerApp"));

const queryClient = new QueryClient();

const DOCTOR: UserRole[] = ["doctor"];
const ADMIN: UserRole[] = ["admin"];
const SOCIAL: UserRole[] = ["social"];
const DENTIST: UserRole[] = ["dentist"];
// Pages shared by every staff workspace; the permission decides who may open them.
const STAFF: UserRole[] = ["admin", "doctor", "dentist", "social"];

// Sends "/" to the dashboard of the logged-in role.
const HomeRedirect = () => {
  const { userRole } = useAuth();
  return <Navigate to={dashboardPathFor(userRole)} replace />;
};

const protectedRoutes: { path: string; element: JSX.Element; roles?: UserRole[]; permission?: string }[] = [
  { path: "/", element: <HomeRedirect /> },
  { path: "/settings", element: <SettingsPage /> },

  // Home page of each workspace: the same dashboard, filled according to the permissions.
  { path: "/medecin/dashboard", element: <StaffDashboard />, roles: DOCTOR },
  { path: "/admin/dashboard", element: <StaffDashboard />, roles: ADMIN },
  { path: "/dentist/dashboard", element: <StaffDashboard />, roles: DENTIST },
  { path: "/social/dashboard", element: <StaffDashboard />, roles: SOCIAL },

  { path: "/admin/accounts", element: <AccountsPage />, roles: ADMIN, permission: "users.manage" },
  { path: "/admin/roles", element: <RolesPermissionsPage />, roles: ADMIN, permission: "roles.manage" },
  { path: "/beneficiaries", element: <BeneficiariesPage />, roles: STAFF, permission: "beneficiaries.read" },
  { path: "/beneficiaries/import", element: <ImportBeneficiariesPage />, roles: STAFF, permission: "beneficiaries.import" },
  { path: "/beneficiaries/:id", element: <PatientFilePage />, roles: STAFF, permission: "beneficiaries.read" },
  { path: "/visits", element: <VisitSchedulePage />, roles: STAFF, permission: "appointments.read" },
  { path: "/visits/:id/certificate", element: <VisitCertificatePage />, roles: STAFF, permission: "visits.read" },
  { path: "/documents", element: <DocumentsPage />, roles: STAFF, permission: "documents.read" },
  { path: "/documents/:id/print", element: <DocumentPrintPage />, roles: STAFF, permission: "documents.read" },
  { path: "/medicines", element: <MedicinesPage />, roles: STAFF, permission: "medicines.read" },

  // Care coverage requests (phase 3). Accounts that may only make requests see the page too.
  { path: "/care-requests", element: <CareRequestsPage />, roles: STAFF, permission: "care_requests.read" },
  { path: "/care-requests/:id/print", element: <CareRequestPrintPage />, roles: STAFF, permission: "care_requests.read" },

  // Activity reports (phase 4): counts only, from what is recorded.
  { path: "/reports", element: <ReportsPage />, roles: STAFF, permission: "reports.read" },
  { path: "/reports/print", element: <ReportPrintPage />, roles: STAFF, permission: "reports.read" },
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Route login public */}
                  <Route path="/login" element={<LoginPage />} />
                  {/* Opened by scanning the QR code of a care coverage: no account needed. */}
                  <Route path="/verify/:token" element={<VerifyCareRequestPage />} />
                  {/* The workers' app (phase 5), with its own sign-in. */}
                  <Route path="/app/*" element={<WorkerApp />} />

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
            </AuthProviderWithNavigate>
          </BrowserRouter>
        </TooltipProvider>
      </DirectionProvider>
    </QueryClientProvider>
  );
}

export default App;
