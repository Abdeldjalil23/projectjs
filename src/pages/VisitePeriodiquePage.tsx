import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const VisitePeriodiquePage = () => {
  const { userRole } = useAuth();

  const visites = [
    {
      id: 1,
      date: new Date(),
      time: '09:00',
      patient: 'Noureddine Touati',
      doctor: 'Dr. Amel Kherbache',
      location: 'Centre Médical Bloc A',
      type: 'Visite annuelle',
      status: 'Terminée',
    },
    {
      id: 2,
      date: new Date(Date.now() + 86400000),
      time: '11:00',
      patient: 'Imane Gaci',
      doctor: 'Dr. Amel Kherbache',
      location: 'Centre Médical Bloc B',
      type: 'Suivi post-visite',
      status: 'Planifiée',
    },
  ];

  const isPatient = userRole === 'patient';
  const pageTitle = 'Visites Périodiques';

  return (
    <AppLayout title={pageTitle}>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isPatient
                ? 'Consultez vos visites médicales programmées et passées.'
                : 'Liste des visites périodiques des agents.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {visites.map(visit => (
              <div
                key={visit.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold">
                    {isPatient ? visit.doctor : visit.patient}
                  </p>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {visit.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {visit.time}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {visit.location}
                    </span>
                  </div>
                  <Badge variant="outline">{visit.type}</Badge>
                </div>

                <div className="mt-3 md:mt-0 flex items-center gap-2">
                  <Badge variant="outline">{visit.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VisitePeriodiquePage;
