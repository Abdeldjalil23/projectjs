import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


const DossierDetailsPage = () => {
  const { id } = useParams();
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
  ];
    const { userRole } = useAuth();
    const isPatient = userRole === 'patient';
  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  return (
    <AppLayout title={`Dossier Médical #${id}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Détails du dossier n° {id}</h2>
          <Button onClick={handleNewConsultation}>
            Nouvelle Consultation
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardContent>
                {isPatient ? (
                    <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                        Aucun dossier médical récent disponible.
                    </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all">
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
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;
