import { useAuth } from '@/context/AuthContext';
import { useChronique } from '@/context/ChroniqueContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DossiersMedicauxPage = () => {
  const { userRole } = useAuth();
  const { hasChronique } = useChronique();
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

  // Check if any worker in the filtered results has chronic conditions
  const hasChronicWorkers = filteredRecords.some(record => hasChronique(record.id));

  return (
    <AppLayout title="Dossiers Médicaux">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isPatient ? 'Mon Dossier Médical' : 'Dossiers Médicaux des Patients'}
          </h1>
          
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search bar - Red when workers have chronic conditions */}
            <div className="relative flex-1 w-full">
              <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${hasChronicWorkers ? 'text-red-700' : 'text-muted-foreground'}`} />
              <Input
                type="search"
                placeholder="Rechercher un patient..."
                className={`pl-8 ${hasChronicWorkers ? 'border-red-700 focus:border-red-700 focus:ring-red-700' : ''}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {hasChronicWorkers && (
                <div className="absolute right-2.5 top-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
              )}
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
                      <TableHead>Chronique</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const isChronique = hasChronique(record.id);
                      return (
                        <TableRow key={record.id} className={isChronique ? 'bg-red-100' : ''}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.prenom}</TableCell>
                          <TableCell>{record.nom}</TableCell>
                          <TableCell>{record.nomJeuneFille || '-'}</TableCell>
                          <TableCell>{record.fonction}</TableCell>
                          <TableCell>{record.structure}</TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>
                            {isChronique ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-900">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Oui
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Non
                              </span>
                            )}
                          </TableCell>
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
                      );
                    })}
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
