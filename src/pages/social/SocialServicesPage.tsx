import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Shield,
  BookOpen
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

// Mock data for social services
const socialServices = [
  {
    id: 1,
    serviceName: 'Employee Wellness Program',
    type: 'Wellness',
    status: 'Active',
    participants: 45,
    maxCapacity: 50,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    location: 'Main Conference Hall',
    coordinator: 'Dr. Sarah Johnson',
    description: 'Comprehensive wellness program including stress management, nutrition, and fitness sessions.'
  },
  {
    id: 2,
    serviceName: 'Family Counseling Sessions',
    type: 'Counseling',
    status: 'Active',
    participants: 12,
    maxCapacity: 15,
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    location: 'Counseling Center',
    coordinator: 'Dr. Sarah Johnson',
    description: 'Group and individual counseling sessions for employees and their families.'
  },
  {
    id: 3,
    serviceName: 'Mental Health Awareness Workshop',
    type: 'Education',
    status: 'Upcoming',
    participants: 0,
    maxCapacity: 30,
    startDate: '2024-02-01',
    endDate: '2024-02-01',
    location: 'Training Room A',
    coordinator: 'Dr. Sarah Johnson',
    description: 'One-day workshop on mental health awareness and stress management techniques.'
  },
  {
    id: 4,
    serviceName: 'Peer Support Group',
    type: 'Support',
    status: 'Active',
    participants: 8,
    maxCapacity: 12,
    startDate: '2024-01-10',
    endDate: '2024-12-31',
    location: 'Support Group Room',
    coordinator: 'Dr. Sarah Johnson',
    description: 'Weekly peer support group meetings for employees dealing with similar challenges.'
  },
  {
    id: 5,
    serviceName: 'Financial Planning Seminar',
    type: 'Education',
    status: 'Completed',
    participants: 25,
    maxCapacity: 25,
    startDate: '2024-01-05',
    endDate: '2024-01-05',
    location: 'Auditorium',
    coordinator: 'Dr. Sarah Johnson',
    description: 'Seminar on financial planning and retirement preparation for employees.'
  }
];

const SocialServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Upcoming': return 'bg-blue-500';
      case 'Completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Wellness': return <Heart className="h-4 w-4" />;
      case 'Counseling': return <Users className="h-4 w-4" />;
      case 'Education': return <BookOpen className="h-4 w-4" />;
      case 'Support': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredServices = socialServices.filter(service => {
    const matchesSearch = service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AppLayout title="Social Services">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Services",
              value: socialServices.length,
              icon: <Users className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Active Services",
              value: socialServices.filter(s => s.status === 'Active').length,
              icon: <CheckCircle className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Total Participants",
              value: socialServices.reduce((sum, service) => sum + service.participants, 0),
              icon: <Users className="h-5 w-5 text-medsuite-primary" />,
            },
            {
              title: "Upcoming Services",
              value: socialServices.filter(s => s.status === 'Upcoming').length,
              icon: <AlertCircle className="h-5 w-5 text-medsuite-primary" />,
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
              <CardTitle className="text-xl">Social Services Programs</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Manage and track social support programs and services
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Counseling">Counseling</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Services Table */}
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Participants</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.serviceName}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {service.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(service.type)}
                          <span className="text-sm">{service.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-2 py-1 text-white ${getStatusColor(service.status)}`}
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{service.participants}/{service.maxCapacity}</div>
                          <div className="text-muted-foreground">
                            {Math.round((service.participants / service.maxCapacity) * 100)}% full
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {service.startDate}
                          </div>
                          <div className="text-muted-foreground">to {service.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {service.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
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

export default SocialServicesPage; 