import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data representing a person's medical history.
// In a real app, this would be fetched from an API.
const mockAntecedentsData = [
  {
    id: 'ant1',
    date: '2018-05-20',
    type: 'Médical',
    maladie: 'Asthme allergique',
    descriptionMaladie: 'Crises déclenchées par le pollen au printemps. Traité avec Ventoline.',
    interventionChirurgicale: null,
    descriptionIntervention: null,
    accidents: null,
  },
  {
    id: 'ant2',
    date: '2021-11-10',
    type: 'Chirurgical',
    maladie: null,
    descriptionMaladie: null,
    interventionChirurgicale: 'Appendicectomie',
    descriptionIntervention: 'Ablation de l\'appendice suite à une crise aiguë. Cicatrice discrète.',
    accidents: null,
  },
  {
    id: 'ant3',
    date: '2022-03-15',
    type: 'Accident',
    maladie: null,
    descriptionMaladie: null,
    interventionChirurgicale: null,
    descriptionIntervention: null,
    accidents: 'Chute de vélo, fracture du poignet gauche. Plâtre pendant 6 semaines.',
  },
  {
    id: 'ant4',
    date: '2015-01-01',
    type: 'Médical',
    maladie: 'Varicelle',
    descriptionMaladie: 'Maladie infantile classique, sans complications notoires.',
    interventionChirurgicale: null,
    descriptionIntervention: null,
    accidents: null,
  },
];

// Helper function to format date strings
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to determine badge variant based on antecedent type
const getTypeVariant = (type: string | null) => {
  switch (type) {
    case 'Médical':
      return 'secondary';
    case 'Chirurgical':
      return 'outline';
    case 'Accident':
      return 'destructive';
    default:
      return 'default';
  }
};

const AntecedentsF = ({ agentId }: { agentId: string }) => {
  // TODO: Fetch real data based on agentId in a real application
  const antecedentsData = mockAntecedentsData;

  // Handle case where there is no data
  if (!antecedentsData || antecedentsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saisir les antécédents personnels de l'agent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun antécédent n'a été enregistré pour cet agent.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saisir les antécédents personnels de l'agent</CardTitle>
        <CardDescription>
          Historique des antécédents médicaux, chirurgicaux et accidentels de l'agent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Type d'antécédent</TableHead>
                <TableHead className="min-w-[180px]">Maladie</TableHead>
                <TableHead className="min-w-[250px]">Description Maladie</TableHead>
                <TableHead className="min-w-[200px]">Intervention Chirurgicale</TableHead>
                <TableHead className="min-w-[250px]">Description de l'Intervention</TableHead>
                <TableHead className="min-w-[250px]">Accidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {antecedentsData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(item.type)}>{item.type || '-'}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.maladie || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.descriptionMaladie || '-'}</TableCell>
                  <TableCell className="font-medium">{item.interventionChirurgicale || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.descriptionIntervention || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.accidents || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AntecedentsF;