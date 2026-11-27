// The workers' app (phase 5): a web app the worker installs on their phone, under /app.
// It has its own sign-in (number and password, activated with a code from the centre) and only
// reaches the worker_* functions of the server.
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { setupWorkerPwa } from './pwa';
import { RequireWorker, WorkerAuthProvider } from './WorkerAuth';
import { WorkerActivate, WorkerLogin } from './WorkerSignIn';
import { WorkerDocumentsPage, WorkerNewRequest, WorkerRequestDetail, WorkerRequestsPage } from './WorkerRequests';
import { WorkerAppointmentsPage, WorkerContactsPage, WorkerDoctorsPage, WorkerHome, WorkerNotificationsPage } from './WorkerPages';

const PAGES: [string, JSX.Element][] = [
  ['', <WorkerHome />],
  ['requests', <WorkerRequestsPage />],
  ['requests/new', <WorkerNewRequest />],
  ['requests/:id', <WorkerRequestDetail />],
  ['documents', <WorkerDocumentsPage />],
  ['doctors', <WorkerDoctorsPage />],
  ['appointments', <WorkerAppointmentsPage />],
  ['notifications', <WorkerNotificationsPage />],
  ['contacts', <WorkerContactsPage />],
];

export const WorkerApp = () => {
  useEffect(() => {
    setupWorkerPwa();
  }, []);

  return (
    <WorkerAuthProvider>
      <Routes>
        <Route path="login" element={<WorkerLogin />} />
        <Route path="activate" element={<WorkerActivate />} />
        {PAGES.map(([path, element]) => (
          <Route key={path} path={path} element={<RequireWorker>{element}</RequireWorker>} />
        ))}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </WorkerAuthProvider>
  );
};

export default WorkerApp;
