import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DossiersMedicauxPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const records = [
    {
      id: 1,
      prenom: 'Ali',
      nom: 'Mezhoud',
      nomJeuneFille: '',
      fonction: 'Technicien',
      structure: 'Service Technique',
      email: 'ali.mezhoud@example.com',
    },
    {
      id: 2,
      prenom: 'Fatima',
      nom: 'Kebbab',
      nomJeuneFille: 'Bensalem',
      fonction: 'Infirmière',
      structure: 'Clinique Centrale',
      email: 'fatima.kebbab@example.com',
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
            {isPatient ? (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Aucun dossier médical récent disponible.
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Tous les dossiers</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Prénom</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Nom de jeune fille</TableHead>
                        <TableHead>Fonction</TableHead>
                        <TableHead>Structure</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.prenom}</TableCell>
                          <TableCell>{record.nom}</TableCell>
                          <TableCell>{record.nomJeuneFille || '-'}</TableCell>
                          <TableCell>{record.fonction}</TableCell>
                          <TableCell>{record.structure}</TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex items-center"
                              onClick={() => navigate(`/dossier/${record.id}`)}
                            >
                              <ClipboardList className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DossiersMedicauxPage;
