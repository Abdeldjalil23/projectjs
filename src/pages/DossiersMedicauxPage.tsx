import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DossiersMedicauxPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isPatient = userRole === 'patient';

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
    {
      id: 3,
      prenom: 'Mohamed',
      nom: 'Amrani',
      nomJeuneFille: '',
      fonction: 'Médecin',
      structure: 'Centre Médical',
      email: 'mohamed.amrani@example.com',
    },
  ];

  const filteredRecords = records.filter((record) =>
    record.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.nomJeuneFille.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.fonction.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.structure.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Dossiers Médicaux">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isPatient ? 'Mon Dossier Médical' : 'Dossiers Médicaux des Patients'}
          </h1>
          {!isPatient && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/nouveau-patient')}
            >
              Nouveau Patient
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un patient..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Optional: Filter/Sort buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Filtrer</Button>
              <Button variant="outline">Trier</Button>
            </div>
          </CardHeader>

          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {filteredRecords.map((record) => (
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
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dossier/${record.id}`)}
                            className="flex items-center"
                          >
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                Aucun dossier patient trouvé correspondant à vos critères.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DossiersMedicauxPage;
