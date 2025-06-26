// DossiersMedicauxPage.jsx
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Download } from 'lucide-react';
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
  ];

  const filteredRecords = records.filter(record =>
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
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Filtrer</Button>
              <Button variant="outline">Trier</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <Card key={record.id} className="bg-card overflow-hidden">
                    <div className="h-1 w-full bg-medsuite-primary" />
                    <CardContent className="p-4 mt-2">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg text-medsuite-primary">
                            {record.prenom} {record.nom}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Nom de jeune fille:</strong> {record.nomJeuneFille || '-'}</p>
                            <p><strong>Fonction:</strong> {record.fonction}</p>
                            <p><strong>Structure:</strong> {record.structure}</p>
                            <p><strong>Email:</strong> {record.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 md:mt-0 self-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dossier/${record.id}`)}
                          >
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Aucun dossier patient trouvé correspondant à vos critères.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DossiersMedicauxPage;
