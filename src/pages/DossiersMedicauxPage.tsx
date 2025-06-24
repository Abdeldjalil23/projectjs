import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ClipboardList } from 'lucide-react';

const DossiersMedicauxPage = () => {
  const { userRole } = useAuth();

  const records = [
    {
      id: 1,
      patient: 'Ali Mezhoud',
      agent: 'Dr. Zineb Belkacem',
      date: new Date(),
      summary: 'Douleurs thoraciques persistantes.',
      type: 'Cardiologie',
      status: 'Consulté',
    },
    {
      id: 2,
      patient: 'Fatima Kebbab',
      agent: 'Dr. Zineb Belkacem',
      date: new Date(Date.now() - 86400000),
      summary: 'Suivi post-opératoire.',
      type: 'Chirurgie',
      status: 'Suivi',
    },
  ];

  const isPatient = userRole === 'patient';

  return (
    <AppLayout title="Dossiers Médicaux">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isPatient ? 'Mon Dossier Médical' : 'Dossiers Médicaux des Patients'}
            </CardTitle>
            <CardDescription>
              {isPatient
                ? 'Consultez les informations de votre dossier médical.'
                : 'Liste de tous les dossiers médicaux enregistrés.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">Récents</TabsTrigger>
                {!isPatient && <TabsTrigger value="all">Tous les dossiers</TabsTrigger>}
              </TabsList>

              <TabsContent value="recent" className="space-y-4 mt-4">
                {records.map(record => (
                  <div
                    key={record.id}
                    className="p-4 border rounded-lg flex flex-col md:flex-row justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {isPatient ? record.agent : record.patient}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {record.date.toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">{record.summary}</p>
                      <Badge variant="outline" className="mt-2">{record.type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <Badge variant="outline">{record.status}</Badge>
                      <Badge variant="secondary" className="flex items-center">
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Voir
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {!isPatient && (
                <TabsContent value="all" className="space-y-4 mt-4">
                  {records.map(record => (
                    <div
                      key={record.id}
                      className="p-4 border rounded-lg flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{record.patient}</p>
                        <p className="text-sm text-muted-foreground">{record.summary}</p>
                      </div>
                      <div className="text-right">
                        <p>{record.date.toLocaleDateString()}</p>
                        <Badge variant="outline">{record.type}</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DossiersMedicauxPage;
