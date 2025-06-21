
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, FileText, Pill, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export const PatientDashboard = () => {
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Ahmed Malik', department: 'Cardiology', date: 'Today', time: '14:30', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Sara Taleb', department: 'General Medicine', date: 'May 15', time: '10:00', status: 'Pending' },
  ];
  
  const medications = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', remaining: 80 },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', remaining: 45 },
    { id: 3, name: 'Simvastatin', dosage: '20mg', frequency: 'Once at night', remaining: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4 mb-6">
        <Card className="flex-1 p-6 bg-gradient-to-br from-medsuite-primary to-medsuite-accent text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Welcome, Mohammed</h2>
              <p className="text-sm opacity-90">Your health dashboard</p>
            </div>
            <div className="p-2 bg-white/20 rounded-full">
              <User className="h-6 w-6" />
            </div>
          </div>
          <div className="flex mt-4 gap-4">
            <Button size="sm" variant="secondary" className="bg-white text-medsuite-primary hover:bg-white/90">
              Book Appointment
            </Button>
            <Button size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/20">
              View Records
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled medical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <p className="font-medium">{appointment.doctor}</p>
                      <p className="text-xs text-muted-foreground">{appointment.department}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{appointment.date}, {appointment.time}</span>
                      </div>
                    </div>
                    <div>
                      <Badge variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'} className="mb-2">
                        {appointment.status}
                      </Badge>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" variant="outline" className="text-xs">Details</Button>
                        <Button size="sm" variant="outline" className="text-xs">Reschedule</Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">Book New Appointment</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No Upcoming Appointments</h3>
                <p className="text-sm text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
                <Button>Book an Appointment</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-4 w-4" /> Medications
            </CardTitle>
            <CardDescription>Your current prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm">{medication.dosage}</p>
                        <p className="text-xs text-muted-foreground">{medication.frequency}</p>
                      </div>
                      <Badge variant="outline">
                        {medication.remaining}% left
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={medication.remaining} className="h-2" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">View All Prescriptions</Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Recent Medical Reports
          </CardTitle>
          <CardDescription>Your latest health information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="medsuite-card medsuite-card-hover">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Blood Work Results</h3>
                <Badge>New</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">May 2, 2025</p>
              <p className="text-sm mt-3">General blood panel with cholesterol screening</p>
              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
            
            <div className="medsuite-card medsuite-card-hover">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Annual Checkup</h3>
                <Badge variant="outline">Archived</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">January 15, 2025</p>
              <p className="text-sm mt-3">Routine physical examination report</p>
              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
            
            <div className="medsuite-card medsuite-card-hover">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Vaccination Record</h3>
                <Badge variant="outline">Archived</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">December 5, 2024</p>
              <p className="text-sm mt-3">Influenza and COVID-19 booster shots</p>
              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
