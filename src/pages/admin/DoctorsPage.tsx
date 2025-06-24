
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, Download, Star, Mail, Calendar, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const DoctorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for doctors
  const doctors = [
    {
      id: 1,
      name: 'Dr. Mohammed Ali',
      specialty: 'Cardiology',
      appointments: 24,
      rating: 4.8,
      status: 'Active',
      avatar: 'MA',
      email: 'mohammed.ali@sonatrach.dz',
      phone: '+213 12345678',
      department: 'Medical Center 1'
    },
    {
      id: 2,
      name: 'Dr. Fatima Zahra',
      specialty: 'Internal Medicine',
      appointments: 18,
      rating: 4.5,
      status: 'Active',
      avatar: 'FZ',
      email: 'fatima.zahra@sonatrach.dz',
      phone: '+213 87654321',
      department: 'Medical Center 2'
    },
    {
      id: 3,
      name: 'Dr. Karim Benzema',
      specialty: 'Orthopedics',
      appointments: 15,
      rating: 4.9,
      status: 'On Leave',
      avatar: 'KB',
      email: 'karim.benzema@sonatrach.dz',
      phone: '+213 56781234',
      department: 'Medical Center 1'
    },
    {
      id: 4,
      name: 'Dr. Nadia Saoudi',
      specialty: 'Pediatrics',
      appointments: 22,
      rating: 4.7,
      status: 'Active',
      avatar: 'NS',
      email: 'nadia.saoudi@sonatrach.dz',
      phone: '+213 43218765',
      department: 'Medical Center 3'
    }
  ];
  
  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Doctors Management">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Manage company medical personnel</CardDescription>
          </div>
          <Button asChild>
            <Link to="/doctors/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search doctors by name, specialty, or department..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Doctors</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="on-leave">On Leave</TabsTrigger>
              <TabsTrigger value="by-department">By Department</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted/50 text-sm font-medium">
                  <div className="col-span-4 lg:col-span-3">Doctor</div>
                  <div className="col-span-3 lg:col-span-2">Specialty</div>
                  <div className="col-span-2 hidden lg:block">Department</div>
                  <div className="col-span-2 text-center hidden md:block">Appointments</div>
                  <div className="col-span-2 text-center hidden lg:block">Rating</div>
                  <div className="col-span-3 lg:col-span-1 text-right">Status</div>
                </div>
                
                <div className="divide-y">
                  {filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="grid grid-cols-12 p-4 items-center">
                      <div className="col-span-4 lg:col-span-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-medsuite-primary text-white">
                              {doctor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[140px] lg:max-w-[200px]">
                              {doctor.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 lg:col-span-2">{doctor.specialty}</div>
                      <div className="col-span-2 hidden lg:block">{doctor.department}</div>
                      <div className="col-span-2 text-center hidden md:block">
                        <div className="flex items-center justify-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{doctor.appointments}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center hidden lg:block">
                        <div className="flex items-center justify-center">
                          <Star className="mr-1 h-4 w-4 text-yellow-500" />
                          <span>{doctor.rating}</span>
                        </div>
                      </div>
                      <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-2">
                        <Badge className={`${
                          doctor.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                        } text-white`}>
                          {doctor.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {filteredDoctors.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No doctors found matching your search criteria
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-6">
              {/* Active doctors content - this would be similar to "all" but filtered */}
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted/50 text-sm font-medium">
                  <div className="col-span-4 lg:col-span-3">Doctor</div>
                  <div className="col-span-3 lg:col-span-2">Specialty</div>
                  <div className="col-span-2 hidden lg:block">Department</div>
                  <div className="col-span-2 text-center hidden md:block">Appointments</div>
                  <div className="col-span-2 text-center hidden lg:block">Rating</div>
                  <div className="col-span-3 lg:col-span-1 text-right">Status</div>
                </div>
                
                <div className="divide-y">
                  {filteredDoctors
                    .filter(doctor => doctor.status === 'Active')
                    .map(doctor => (
                      <div key={doctor.id} className="grid grid-cols-12 p-4 items-center">
                        <div className="col-span-4 lg:col-span-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-medsuite-primary text-white">
                                {doctor.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[140px] lg:max-w-[200px]">
                                {doctor.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 lg:col-span-2">{doctor.specialty}</div>
                        <div className="col-span-2 hidden lg:block">{doctor.department}</div>
                        <div className="col-span-2 text-center hidden md:block">
                          <div className="flex items-center justify-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{doctor.appointments}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center hidden lg:block">
                          <div className="flex items-center justify-center">
                            <Star className="mr-1 h-4 w-4 text-yellow-500" />
                            <span>{doctor.rating}</span>
                          </div>
                        </div>
                        <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-2">
                          <Badge className="bg-green-500 text-white">
                            {doctor.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                  ))}
                  
                  {filteredDoctors.filter(doctor => doctor.status === 'Active').length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No active doctors found matching your search criteria
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="on-leave" className="mt-6">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted/50 text-sm font-medium">
                  <div className="col-span-4 lg:col-span-3">Doctor</div>
                  <div className="col-span-3 lg:col-span-2">Specialty</div>
                  <div className="col-span-2 hidden lg:block">Department</div>
                  <div className="col-span-2 text-center hidden md:block">Appointments</div>
                  <div className="col-span-2 text-center hidden lg:block">Rating</div>
                  <div className="col-span-3 lg:col-span-1 text-right">Status</div>
                </div>
                
                <div className="divide-y">
                  {filteredDoctors
                    .filter(doctor => doctor.status === 'On Leave')
                    .map(doctor => (
                      <div key={doctor.id} className="grid grid-cols-12 p-4 items-center">
                        <div className="col-span-4 lg:col-span-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-medsuite-primary text-white">
                                {doctor.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[140px] lg:max-w-[200px]">
                                {doctor.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 lg:col-span-2">{doctor.specialty}</div>
                        <div className="col-span-2 hidden lg:block">{doctor.department}</div>
                        <div className="col-span-2 text-center hidden md:block">
                          <div className="flex items-center justify-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{doctor.appointments}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center hidden lg:block">
                          <div className="flex items-center justify-center">
                            <Star className="mr-1 h-4 w-4 text-yellow-500" />
                            <span>{doctor.rating}</span>
                          </div>
                        </div>
                        <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-2">
                          <Badge className="bg-yellow-500 text-white">
                            {doctor.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                  ))}
                  
                  {filteredDoctors.filter(doctor => doctor.status === 'On Leave').length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No doctors on leave found matching your search criteria
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="by-department" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Medical Center 1</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {filteredDoctors
                        .filter(doctor => doctor.department === 'Medical Center 1')
                        .map(doctor => (
                          <div key={doctor.id} className="flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-medsuite-primary text-white">
                                  {doctor.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                doctor.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                              } text-white`}>
                                {doctor.status}
                              </Badge>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </div>
                          </div>
                      ))}
                      
                      {filteredDoctors.filter(doctor => doctor.department === 'Medical Center 1').length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No doctors in this department
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Medical Center 2</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {filteredDoctors
                        .filter(doctor => doctor.department === 'Medical Center 2')
                        .map(doctor => (
                          <div key={doctor.id} className="flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-medsuite-primary text-white">
                                  {doctor.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                doctor.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                              } text-white`}>
                                {doctor.status}
                              </Badge>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </div>
                          </div>
                      ))}
                      
                      {filteredDoctors.filter(doctor => doctor.department === 'Medical Center 2').length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No doctors in this department
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Medical Center 3</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {filteredDoctors
                        .filter(doctor => doctor.department === 'Medical Center 3')
                        .map(doctor => (
                          <div key={doctor.id} className="flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-medsuite-primary text-white">
                                  {doctor.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                doctor.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                              } text-white`}>
                                {doctor.status}
                              </Badge>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </div>
                          </div>
                      ))}
                      
                      {filteredDoctors.filter(doctor => doctor.department === 'Medical Center 3').length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No doctors in this department
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DoctorsPage;
