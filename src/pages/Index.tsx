
import { useAuth, UserRole } from '@/context/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import AppLayout from '@/components/layout/AppLayout';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
// import PatientDashboard from '@/components/dashboard/PatientDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const Index = () => {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'doctor':
        return <DoctorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      // case 'patient':
      //   return <PatientDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'doctor':
        return 'Doctor Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      // case 'patient':
      //   return 'My Health Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <AppLayout title={getDashboardTitle()}>
      {renderDashboard()}
    </AppLayout>
  );
};

export default Index;
