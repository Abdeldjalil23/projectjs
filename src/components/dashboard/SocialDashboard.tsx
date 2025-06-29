import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Users, Shield, UserCheck, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data ---
// In a real application, you would fetch this data from your API.
const allUsersData = [
  { id: 1, name: 'Dr. Mohammed Ali', email: 'mohammed.ali@sonatrach.dz', avatar: 'MA', role: 'doctor' as const },
  { id: 2, name: 'Amira Bouzid (Admin)', email: 'amira.bouzid@sonatrach.dz', avatar: 'AB', role: 'admin' as const },
  { id: 3, name: 'Dr. Fatima Zahra', email: 'fatima.zahra@sonatrach.dz', avatar: 'FZ', role: 'doctor' as const },
  { id: 4, name: 'Yacine Brahimi (Admin)', email: 'yacine.brahimi@sonatrach.dz', avatar: 'YB', role: 'admin' as const },
  { id: 5, name: 'Dr. Karim Benzema', email: 'karim.benzema@sonatrach.dz', avatar: 'KB', role: 'doctor' as const },
  { id: 6, name: 'Dr. Nadia Saoudi', email: 'nadia.saoudi@sonatrach.dz', avatar: 'NS', role: 'doctor' as const },
];
// Type for better TypeScript IntelliSense
type UserRole = 'all' | 'doctor' | 'admin';

export const SocialDashboard = () => {
  const navigate = useNavigate();
  // State to keep track of the current filter
  const [activeFilter, setActiveFilter] = useState<UserRole>('all');

  // Filter the users based on the active filter state
  const filteredUsers = allUsersData.filter(user => {
    if (activeFilter === 'all') {
      return true; // Show all users
    }
    return user.role === activeFilter; // Show only users with the matching role
  });

  // Calculate statistics
  const totalUsers = allUsersData.length;
  const doctorsCount = allUsersData.filter(u => u.role === 'doctor').length;
  const adminsCount = allUsersData.filter(u => u.role === 'admin').length;
  const activeUsers = totalUsers - 1; // Mock data for active users

  return (
    <AppLayout title="Social Dashboard">
      <div className="space-y-6">
        {/* Dashboard Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Users",
              value: totalUsers,
              icon: <Users className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Doctors",
              value: doctorsCount,
              icon: <UserCheck className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Administrators",
              value: adminsCount,
              icon: <Shield className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Active Users",
              value: activeUsers,
              icon: <UserX className="h-5 w-5 text-medsuite-primary" />,
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="stats-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 bg-medsuite-secondary rounded-full shadow-sm">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* User Management Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                View, manage, and filter all system users.
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/users')}>
              Manage Users
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="role-filter" className="text-sm font-medium">
                Filter by role:
              </label>
              <Select value={activeFilter} onValueChange={(value: UserRole) => setActiveFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Users ({allUsersData.length})
                  </SelectItem>
                  <SelectItem value="doctor">
                    Doctors ({allUsersData.filter(u => u.role === 'doctor').length})
                  </SelectItem>
                  <SelectItem value="admin">
                    Admins ({allUsersData.filter(u => u.role === 'admin').length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => alert(`Viewing profile for ${user.name}`)}>
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert(`Editing user ${user.name}`)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No users found for this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SocialDashboard;