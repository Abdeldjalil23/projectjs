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
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="text-sm">
            Liste des visites médicales enregistrées pour les agents.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {visites.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 text-xs">N° Visite</TableHead>
                    <TableHead className="h-9 text-xs">Type</TableHead>
                    <TableHead className="h-9 text-xs">Date</TableHead>
                    <TableHead className="h-9 text-xs">Matricule</TableHead>
                    <TableHead className="h-9 text-xs">Nom</TableHead>
                    <TableHead className="h-9 text-xs">Prénom</TableHead>
                    <TableHead className="h-9 text-xs">Structure</TableHead>
                    <TableHead className="h-9 text-xs">Médecin</TableHead>
                    <TableHead className="h-9 text-xs">Infirmier(ère)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visites.map((visit) => (
                    <TableRow key={visit.numeroVisite} className="h-10">
                      <TableCell className="py-2 text-sm font-medium">
                        {visit.numeroVisite}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          {visit.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {visit.date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="py-2 text-sm">{visit.agent.matricule}</TableCell>
                      <TableCell className="py-2 text-sm">{visit.agent.nom}</TableCell>
                      <TableCell className="py-2 text-sm">{visit.agent.prenom}</TableCell>
                      <TableCell className="py-2 text-sm">{visit.agent.structure}</TableCell>
                      <TableCell className="py-2 text-sm">{visit.medecin}</TableCell>
                      <TableCell className="py-2 text-sm">{visit.infirmier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Aucune visite à afficher.
            </p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default VisitePeriodiquePage;