import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, Users, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DoctorDashboard = () => {
  const { userRole } = useAuth();
  const [consultationTab, setConsultationTab] = useState('my');

  const upcomingAppointments = [
    { id: 3, patient: 'Mohammed Hassan', status: 'Confirmed', type: 'Consultation', avatar: 'MH' },
    { id: 4, patient: 'Fatima Zahra', status: 'Confirmed', type: 'Check-up', avatar: 'FZ' },
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
      agent: 'Dr. Sofia Bensalem',
      patient: 'Karim Salah',
      status: 'Completed',
      avatar: 'KS',
    },
    {
      id: 2,
      date: new Date('2025-06-25'),
      agent: 'Dr. Sofia Bensalem',
      patient: 'Mohammed Hassan',
      status: 'Scheduled',
      avatar: 'MH',
    },
    {
      id: 3,
      date: new Date('2025-06-25'),
      agent: 'Dr. Ahmed Zaki',
      patient: 'Fatima Zahra',
      status: 'Scheduled',
      avatar: 'FZ',
    },
  ];

  const filteredConsultations = consultationTab === 'my'
    ? consultations.filter(c => userRole === 'patient' ? true : c.agent === 'Dr. Sofia Bensalem')
    : consultations;

  return (
    <div className="space-y-6">
      {/* Dashboard Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Appointments",
            value: 24,
            icon: <Calendar className="h-5 w-5 text-medsuite-primary" />,
          },
          {
            title: "Today's Patients",
            value: 12,
            icon: <Users className="h-5 w-5 text-medsuite-primary" />,
          },
          {
            title: "Completed",
            value: 8,
            icon: <CheckCircle className="h-5 w-5 text-medsuite-primary" />,
          },
          {
            title: "Pending",
            value: 4,
            icon: <Clock className="h-5 w-5 text-medsuite-primary" />,
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

      {/* Consultations Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <CardTitle className="text-xl">Consultations</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              View {userRole === 'patient' ? 'your consultations' : 'all consultations'}
            </CardDescription>
          </div>
          
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="my" value={consultationTab} onValueChange={setConsultationTab}>
            <TabsList>
              <TabsTrigger value="my">Mes consultations</TabsTrigger>
            </TabsList>

            <TabsContent value="my" className="space-y-4 mt-4">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{consultation.avatar}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-base">
                        {userRole === 'patient' ? consultation.agent : consultation.patient}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 flex items-center gap-2">
                    <Badge
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${consultation.status === 'Completed' ? 'bg-green-500' :
                          consultation.status === 'Scheduled' ? 'bg-yellow-500' :
                            'bg-gray-500'} text-white`}
                    >
                      {consultation.status}
                    </Badge>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
};

export default DoctorDashboard;