import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, Users, MapPin, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DoctorDashboard = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [consultationTab, setConsultationTab] = useState('my');

  const upcomingAppointments = [
    { id: 3, patient: 'Mohammed Hassan', time: '11:00 AM', status: 'Confirmed', type: 'Consultation', avatar: 'MH' },
    { id: 4, patient: 'Fatima Zahra', time: '12:30 PM', status: 'Confirmed', type: 'Check-up', avatar: 'FZ' },
  ];

  const recentPatients = [
    { id: 1, name: 'Karim Salah', lastVisit: '2 days ago', condition: 'Hypertension', status: 'Stable', avatar: 'KS' },
    { id: 2, name: 'Leila Benkiran', lastVisit: '4 days ago', condition: 'Diabetes Type 2', status: 'Review', avatar: 'LB' },
    { id: 3, name: 'Omar Farid', lastVisit: '1 week ago', condition: 'Post-surgery', status: 'Improving', avatar: 'OF' },
  ];

  const consultations = [
    {
      id: 1,
      date: new Date('2025-06-23'),
      time: '10:00 AM',
      agent: 'Dr. Sofia Bensalem',
      patient: 'Karim Salah',
      type: 'General',
      status: 'Completed',
      location: 'Room 203',
      avatar: 'KS',
    },
    {
      id: 2,
      date: new Date('2025-06-25'),
      time: '11:00 AM',
      agent: 'Dr. Sofia Bensalem',
      patient: 'Mohammed Hassan',
      type: 'Follow-up',
      status: 'Scheduled',
      location: 'Room 105',
      avatar: 'MH',
    },
    {
      id: 3,
      date: new Date('2025-06-25'),
      time: '12:30 PM',
      agent: 'Dr. Ahmed Zaki',
      patient: 'Fatima Zahra',
      type: 'Check-up',
      status: 'Scheduled',
      location: 'Room 108',
      avatar: 'FZ',
    },
  ];

  const filteredConsultations = consultationTab === 'my'
    ? consultations.filter(c => userRole === 'patient' ? true : c.agent === 'Dr. Sofia Bensalem') // Adjust based on doctor
    : consultations;

  return (
    <AppLayout title="Doctor Dashboard">
      <div className="space-y-6">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="stats-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                    <h3 className="text-2xl font-bold">24</h3>
                  </div>
                  <div className="p-2 bg-medsuite-secondary rounded-full">
                    <Calendar className="h-4 w-4 text-medsuite-primary" />
                  </div>
                </div>
                <p className="text-xs text-medsuite-primary">+2 from yesterday</p>
              </Card>

              <Card className="stats-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Patients</p>
                    <h3 className="text-2xl font-bold">12</h3>
                  </div>
                  <div className="p-2 bg-medsuite-secondary rounded-full">
                    <Users className="h-4 w-4 text-medsuite-primary" />
                  </div>
                </div>
                <p className="text-xs text-medsuite-primary">4 waiting</p>
              </Card>

              <Card className="stats-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h3 className="text-2xl font-bold">8</h3>
                  </div>
                  <div className="p-2 bg-medsuite-secondary rounded-full">
                    <CheckCircle className="h-4 w-4 text-medsuite-primary" />
                  </div>
                </div>
                <p className="text-xs text-medsuite-primary">On schedule</p>
              </Card>

              <Card className="stats-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Appointment</p>
                    <h3 className="text-2xl font-bold">09:30</h3>
                  </div>
                  <div className="p-2 bg-medsuite-secondary rounded-full">
                    <Clock className="h-4 w-4 text-medsuite-primary" />
                  </div>
                </div>
                <p className="text-xs text-medsuite-primary">In 15 minutes</p>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{appointment.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{appointment.time}</p>
                          <Badge variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{patient.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{patient.lastVisit}</p>
                          <Badge variant={patient.status === 'Stable' ? 'default' : 'secondary'}>
                            {patient.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consultations">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Consultations</CardTitle>
                  <CardDescription>
                    View {userRole === 'patient' ? 'your consultations' : 'all consultations'}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {userRole === 'patient' ? 'Book Consultation' : 'New Consultation'}
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="my" value={consultationTab} onValueChange={setConsultationTab}>
                  <TabsList>
                    <TabsTrigger value="my">Mes consultations</TabsTrigger>
                    {userRole !== 'patient' && (
                      <TabsTrigger value="all">Toutes les consultations</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="my" className="space-y-4 mt-4">
                    {filteredConsultations.map(consultation => (
                      <div
                        key={consultation.id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{consultation.avatar}</AvatarFallback>
                            </Avatar>
                            <h4 className="font-semibold">
                              {userRole === 'patient' ? consultation.agent : consultation.patient}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {consultation.time}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {consultation.location}
                            </span>
                          </div>
                          <Badge variant="outline">{consultation.type}</Badge>
                        </div>
                        <div className="mt-3 md:mt-0 flex items-center gap-2">
                          <Badge className={`
                            ${consultation.status === 'Completed' ? 'bg-green-500' :
                              consultation.status === 'Scheduled' ? 'bg-yellow-500' :
                              'bg-gray-500'} text-white`}>
                            {consultation.status}
                          </Badge>
                          <Button variant="outline" size="sm">Details</Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="all" className="mt-4">
                    <div className="space-y-4">
                      {consultations.map(consultation => (
                        <div
                          key={consultation.id}
                          className="flex justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{consultation.avatar}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium">
                                Patient: {consultation.patient}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Date: {consultation.date.toLocaleDateString()} | Time: {consultation.time}
                            </p>
                            <p className="text-sm">Location: {consultation.location}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge>{consultation.type}</Badge>
                            <Badge className={`
                              ${consultation.status === 'Completed' ? 'bg-green-500' :
                                consultation.status === 'Scheduled' ? 'bg-yellow-500' :
                                'bg-gray-500'} text-white`}>
                              {consultation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;