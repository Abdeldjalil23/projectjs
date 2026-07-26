import { useAuth } from '@/context/AuthContext'; // Keep if used for filtering data upstream
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VisitePeriodiquePage = () => {
  const visites = [
    {
      numeroVisite: '001',
      type: 'Visite annuelle',
      date: new Date('2024-07-15'),
      agent: {
        matricule: '1023S',
        nom: 'Touati',
        prenom: 'Noureddine',
        structure: 'OP',
      },
      medecin: 'Dr. Amel Kherbache',
      infirmier: 'Inf. Samira Lido',
    },
    {
      numeroVisite: '002',
      type: 'Visite particulière',
      date: new Date('2024-07-22'),
      agent: {
        matricule: '1023A',
        nom: 'Gaci',
        prenom: 'Imane',
        structure: 'IT',
      },
      medecin: 'Dr. Amel Kherbache',
      infirmier: 'Inf. Karim Belkacem',
    },
    {
      numeroVisite: '003',
      type: 'Visite annuelle',
      date: new Date('2024-06-10'),
      agent: {
        matricule: '1023H',
        nom: 'Benmohamed',
        prenom: 'Ali',
        structure: 'DP',
      },
      medecin: 'Dr. Farid Lounis',
      infirmier: 'Inf. Samira Lido',
    },
    {
      numeroVisite: '004',
      type: 'Visite particulière',
      date: new Date('2024-08-01'),
      agent: {
        matricule: '1023G',
        nom: 'Salah',
        prenom: 'Fatima',
        structure: 'EP',
      },
      medecin: 'Dr. Sonia Cherif',
      infirmier: 'Inf. Karim Belkacem',
    },
  ];

  const pageTitle = 'Suivi des Visites Médicales'; 

  return (
    <AppLayout title={pageTitle}>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              Liste des visites médicales enregistrées pour les agents.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {visites.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Visite</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Infirmier(ère)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visites.map((visit, index) => ( // Added index as fallback key if numeroVisite isn't unique enough for some reason
                    <TableRow key={visit.numeroVisite || index}>
                      <TableCell className="font-medium">{visit.numeroVisite}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{visit.type}</Badge>
                      </TableCell>
                      <TableCell>{visit.date.toLocaleDateString()}</TableCell>
                      <TableCell>{visit.agent.matricule}</TableCell>
                      <TableCell>{visit.agent.nom}</TableCell>
                      <TableCell>{visit.agent.prenom}</TableCell>
                      <TableCell>{visit.agent.structure}</TableCell>
                      <TableCell>{visit.medecin}</TableCell>
                      <TableCell>{visit.infirmier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aucune visite à afficher.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VisitePeriodiquePage;