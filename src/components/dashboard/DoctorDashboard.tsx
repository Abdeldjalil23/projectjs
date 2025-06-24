
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const DoctorDashboard = () => {
  const upcomingAppointments = [
    { id: 2, patient: 'Sara Rahim', time: '10:15 AM', status: 'Waiting', type: 'Follow-up', avatar: 'SR' },
    { id: 3, patient: 'Mohammed Hassan', time: '11:00 AM', status: 'Confirmed', type: 'Consultation', avatar: 'MH' },
    { id: 4, patient: 'Fatima Zahra', time: '12:30 PM', status: 'Confirmed', type: 'Check-up', avatar: 'FZ' },
  ];
  
  const recentPatients = [
    { id: 1, name: 'Karim Salah', lastVisit: '2 days ago', condition: 'Hypertension', status: 'Stable', avatar: 'KS' },
    { id: 2, name: 'Leila Benkiran', lastVisit: '4 days ago', condition: 'Diabetes Type 2', status: 'Review', avatar: 'LB' },
    { id: 3, name: 'Omar Farid', lastVisit: '1 week ago', condition: 'Post-surgery', status: 'Improving', avatar: 'OF' },
  ];

  return (
    <div className="space-y-6">
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-medsuite-secondary text-medsuite-dark">
                          {appointment.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                          <Badge variant="outline" className="text-xs">
                            {appointment.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant={appointment.status === 'Waiting' ? 'secondary' : 'outline'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">View All Appointments</Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
       
      </div>
    </div>
  );
};

export default DoctorDashboard;
