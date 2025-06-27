import { useState } from "react";
// Removed useNavigate as we're handling views internally now
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  User,
  Building2,
  AlertTriangle,
  UserCog,
} from "lucide-react";
// Import your new UsersTable component
import { UsersTable } from "@/pages/admin/UsersTable"; 

// Note: Adjust the import path based on where you saved UsersTable.tsx

// Mock data for all system users (doctors and admins)
const allUsersData = [
  { id: 1, name: 'Dr. Mohammed Ali', email: 'mohammed.ali@sonatrach.dz', avatar: 'MA', role: 'doctor' as const, specialty: 'General Medicine', status: 'active' as const },
  { id: 2, name: 'Dr. Fatima Zahra', email: 'fatima.zahra@sonatrach.dz', avatar: 'FZ', role: 'doctor' as const, specialty: 'Dentist', status: 'active' as const },
  { id: 3, name: 'Dr. Karim Benzema', email: 'karim.benzema@sonatrach.dz', avatar: 'KB', role: 'doctor' as const, specialty: 'Psychologist', status: 'inactive' as const },
  { id: 4, name: 'Dr. Nadia Saoudi', email: 'nadia.saoudi@sonatrach.dz', avatar: 'NS', role: 'doctor' as const, specialty: 'General Medicine', status: 'active' as const },
  { id: 5, name: 'Admin User', email: 'admin@sonatrach.dz', avatar: 'AU', role: 'admin' as const, status: 'active' as const },
  { id: 6, name: 'Super Admin', email: 'super.admin@sonatrach.dz', avatar: 'SA', role: 'admin' as const, status: 'active' as const },
];

export const AdminDashboard = () => {
  // State to manage which view is active: 'dashboard' or a specific user list
  const [view, setView] = useState('dashboard');

  const doctorsData = allUsersData.filter(user => user.role === 'doctor');
  // In a real app, employees might be a different list, here we use all users
  const employeesData = allUsersData; 

  // Main Dashboard View Component
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Card to show all employees */}
        <Card
          className="stats-card cursor-pointer hover:bg-muted/50 transition"
          onClick={() => setView('employees')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-2xl font-bold">{employeesData.length}</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <Users className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
        </Card>

        {/* Card to show doctors */}
        <Card
          className="stats-card cursor-pointer hover:bg-muted/50 transition"
          onClick={() => setView('doctors')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Number Of Doctors</p>
              <h3 className="text-2xl font-bold">{doctorsData.length}</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <User className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          {/* ... other non-clickable cards ... */}
        </Card>
        <Card className="stats-card">
          {/* ... other non-clickable cards ... */}
        </Card>

        {/* Card to show all system users (admins + doctors) */}
        <Card
          className="stats-card cursor-pointer hover:bg-muted/50 transition"
          onClick={() => setView('all_users')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Users</p>
              <h3 className="text-2xl font-bold">{allUsersData.length}</h3>
            </div>
            <div className="p-2 bg-medsuite-secondary rounded-full">
              <UserCog className="h-5 w-5 text-medsuite-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Manage Users</p>
        </Card>
      </div>

      {/* You can add your charts and other dashboard elements here */}
      <Card>
        <CardHeader>
          <CardTitle>Health Analytics</CardTitle>
          <CardDescription>Overview of system activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your charts and other visual elements would go here.</p>
        </CardContent>
      </Card>
    </div>
  );

  // Function to determine which view to render
  const renderContent = () => {
    switch (view) {
      case 'employees':
        return (
          <UsersTable
            title="All Employees"
            description="List of all registered employees in the system."
            users={employeesData}
            onBack={() => setView('dashboard')}
          />
        );
      case 'doctors':
        return (
          <UsersTable
            title="Medical Staff"
            description="List of all doctors registered in the system."
            users={doctorsData}
            onBack={() => setView('dashboard')}
          />
        );
      case 'all_users':
        return (
          <UsersTable
            title="All System Users"
            description="Manage all users, including doctors and administrators."
            users={allUsersData}
            onBack={() => setView('dashboard')}
          />
        );
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>;
};

export default AdminDashboard;