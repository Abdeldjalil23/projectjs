import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConsultationsPage = () => {
  const { userRole } = useAuth();
  const [tab, setTab] = useState('my');

  // Fake/mock consultation data
  const consultations = [
    {
      id: 1,
      date: new Date(),
      time: '09:00 AM',
      agent: 'Dr. Sofia Bensalem',
      patient: 'Karim Aït',
      type: 'General',
      status: 'Completed',
      location: 'Room 203',
    },
    {
      id: 2,
      date: new Date(Date.now() + 86400000),
      time: '11:00 AM',
      agent: 'Dr. Sofia Bensalem',
      patient: 'Lina Zerrouki',
      type: 'Follow-up',
      status: 'Scheduled',
      location: 'Room 105',
    },
  ];

  const filteredConsultations = tab === 'my'
    ? consultations.filter(c => userRole === 'patient' ? true : false)
    : consultations;

  return (
    <AppLayout title="Consultations">
      <div className="grid grid-cols-1 gap-6">
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
            <Tabs defaultValue="my" value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="my">Mes consultations</TabsTrigger>
                {userRole !== 'patient' && (
                  <TabsTrigger value="all">Consultations de l’agent</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="my" className="space-y-4 mt-4">
                {filteredConsultations.map(consultation => (
                  <div
                    key={consultation.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">
                        {userRole === 'patient' ? consultation.agent : consultation.patient}
                      </h4>
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
                        <p className="font-medium">
                          Patient: {consultation.patient}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {consultation.date.toLocaleDateString()} | Time: {consultation.time}
                        </p>
                        <p className="text-sm">Location: {consultation.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{consultation.type}</Badge>
                        <Badge className="bg-blue-500 text-white">{consultation.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ConsultationsPage;
