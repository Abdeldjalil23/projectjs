
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Plus, User, MapPin } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AppointmentsPage = () => {
  const { userRole } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState('upcoming');
  
  // Mock data
  const appointments = [
    { 
      id: 1,
      date: new Date(), 
      time: '10:00 AM', 
      doctor: 'Dr. Mohammed Ali',
      patient: 'Ahmed Boulmerka',
      type: 'Consultation',
      status: 'Confirmed',
      location: 'Medical Center, Floor 2, Room 204'
    },
    { 
      id: 2,
      date: new Date(Date.now() + 86400000), 
      time: '11:30 AM', 
      doctor: 'Dr. Fatima Zahra',
      patient: 'Samira Hamdani',
      type: 'Follow-up',
      status: 'Pending',
      location: 'Medical Center, Floor 1, Room 105'
    },
    { 
      id: 3,
      date: new Date(Date.now() + 172800000), 
      time: '2:15 PM', 
      doctor: 'Dr. Karim Benzema',
      patient: 'Ibrahim Nacer',
      type: 'Check-up',
      status: 'Confirmed',
      location: 'Medical Center, Floor 3, Room 310'
    }
  ];
  
  const pageTitle = userRole === 'patient' ? 'My Appointments' : 'Appointments';
  
  return (
    <AppLayout title={pageTitle}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{pageTitle}</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </div>
            {userRole !== 'patient' ? (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            ) : (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                {userRole === 'doctor' && (
                  <TabsTrigger value="requested">Requested</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-medsuite-secondary rounded-lg p-3 min-w-16">
                        <span className="font-bold text-lg">{appointment.date.getDate()}</span>
                        <span className="text-xs">{appointment.date.toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold">
                          {userRole === 'patient' ? appointment.doctor : appointment.patient}
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {appointment.location}
                          </span>
                        </div>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center gap-2">
                      <Badge className={`
                        ${appointment.status === 'Confirmed' ? 'bg-green-500' : 
                          appointment.status === 'Pending' ? 'bg-yellow-500' : 
                          'bg-red-500'} text-white
                      `}>
                        {appointment.status}
                      </Badge>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                <div className="p-4 text-center text-muted-foreground">
                  No past appointments to display
                </div>
              </TabsContent>
              {userRole === 'doctor' && (
                <TabsContent value="requested" className="mt-4">
                  <div className="p-4 text-center text-muted-foreground">
                    No appointment requests pending
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Appointment Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="mt-6">
              <h4 className="font-medium mb-3">Selected Date: {date?.toLocaleDateString()}</h4>
              <div className="space-y-2">
                {appointments.filter(a => 
                  a.date.toDateString() === (date?.toDateString() || '')
                ).length > 0 ? (
                  appointments.filter(a => 
                    a.date.toDateString() === (date?.toDateString() || '')
                  ).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback className="bg-medsuite-secondary text-medsuite-dark">
                            {userRole === 'patient' ? 'DR' : 'PT'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {userRole === 'patient' ? appointment.doctor : appointment.patient}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">{appointment.type}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No appointments scheduled for this date
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AppointmentsPage;
