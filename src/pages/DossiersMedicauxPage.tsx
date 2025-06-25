// DossiersMedicauxPage.jsx
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, PlusCircle } from 'lucide-react'; // Import PlusCircle
import { useNavigate } from 'react-router-dom';

const DossiersMedicauxPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const records = [ // This should ideally be fetched from an API
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

  const handleAddNewPatient = () => {
    navigate('/nouveau-patient');
  };

  return (
    <AppLayout title="Dossiers Médicaux">
      <div className="p-4 md:p-6 space-y-6"> {/* Consistent padding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight"> {/* Use h1 for main page title */}
            {isPatient ? 'Mon Dossier Médical' : 'Dossiers Médicaux des Patients'}
          </h1>
          {!isPatient && (
            <Button onClick={handleAddNewPatient}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouveau Patient
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            {/* CardTitle can be removed if main title is outside, or kept for context within card */}
            {/* <CardTitle>Optional: Liste des Dossiers</CardTitle> */}
            <CardDescription>
              {isPatient
                ? 'Consultez les informations de votre dossier médical.'
                : 'Liste de tous les dossiers médicaux enregistrés. Cliquez sur "Voir" pour consulter ou ajoutez un nouveau patient.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPatient ? (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Aucun dossier médical récent disponible pour vous.
                  {/* Consider fetching and displaying the patient's own record if available */}
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Tous les dossiers</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4 overflow-x-auto">
                  {records.length > 0 ? (
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
                  ) : (
                     <p className="text-center text-muted-foreground py-4">
                        Aucun dossier patient trouvé. Cliquez sur "Nouveau Patient" pour en ajouter un.
                     </p>
                  )}
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