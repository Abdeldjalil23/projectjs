import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  HeartPulse, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for patient cases
const patientCases = [
  {
    id: 1,
    patientName: 'Ahmed Boulmerka',
    caseType: 'Mental Health Support',
    priority: 'High',
    status: 'Active',
    assignedTo: 'Sarah Johnson',
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-22',
    contactInfo: {
      phone: '+213 123 456 789',
      email: 'ahmed.boulmerka@sonatrach.dz',
      department: 'Production Department'
    },
    avatar: 'AB'
  },
  {
    id: 2,
    patientName: 'Fatima Zahra',
    caseType: 'Family Counseling',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Sarah Johnson',
    lastContact: '2024-01-10',
    nextFollowUp: '2024-01-25',
    contactInfo: {
      phone: '+213 987 654 321',
      email: 'fatima.zahra@sonatrach.dz',
      department: 'HR Department'
    },
    avatar: 'FZ'
  },
  {
    id: 3,
    patientName: 'Karim Salah',
    caseType: 'Stress Management',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Sarah Johnson',
    lastContact: '2024-01-05',
    nextFollowUp: '2024-02-05',
    contactInfo: {
      phone: '+213 555 123 456',
      email: 'karim.salah@sonatrach.dz',
      department: 'IT Department'
    },
    avatar: 'KS'
  },
  {
    id: 4,
    patientName: 'Leila Benkiran',
    caseType: 'Work-Life Balance',
    priority: 'Medium',
    status: 'Active',
    assignedTo: 'Sarah Johnson',
    lastContact: '2024-01-12',
    nextFollowUp: '2024-01-19',
    contactInfo: {
      phone: '+213 777 888 999',
      email: 'leila.benkiran@sonatrach.dz',
      department: 'Finance Department'
    },
    avatar: 'LB'
  }
];

const PatientSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-orange-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredCases = patientCases.filter(case_ => {
    const matchesSearch = case_.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         case_.caseType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppLayout title="Patient Support">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Cases",
              value: patientCases.length,
              icon: <HeartPulse className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Active Cases",
              value: patientCases.filter(c => c.status === 'Active').length,
              icon: <AlertCircle className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Pending Cases",
              value: patientCases.filter(c => c.status === 'Pending').length,
              icon: <Clock className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Resolved Cases",
              value: patientCases.filter(c => c.status === 'Resolved').length,
              icon: <CheckCircle className="h-5 w-5 text-medsuite-primary" />,
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

        {/* Main Content */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-xl">Patient Cases</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage and track patient support cases
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients or case types..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cases Table */}
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Case Type</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Next Follow-up</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((case_) => (
                    <TableRow key={case_.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{case_.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{case_.patientName}</div>
                            <div className="text-sm text-muted-foreground">{case_.contactInfo.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{case_.caseType}</div>
                        <div className="text-sm text-muted-foreground">Assigned to {case_.assignedTo}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-2 py-1 text-white ${getPriorityColor(case_.priority)}`}
                        >
                          {case_.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-2 py-1 text-white ${getStatusColor(case_.status)}`}
                        >
                          {case_.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{case_.nextFollowUp}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {case_.contactInfo.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {case_.contactInfo.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PatientSupportPage; 