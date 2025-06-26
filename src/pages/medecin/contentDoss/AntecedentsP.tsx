// src/pages/medecin/AntecedentsP.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import InfoTextareaField from '@/components/InfoTextareaField';
// PostesOccupesTab.jsx (in the same folder as DossierDetailsPage.jsx)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockPostesOccupesData = [
  {
    id: 'po1',
    intituleFonction: 'Développeur Web Junior',
    du: '2015-09-01',
    au: '2017-08-31',
    risquesProfessionnels: ['Travail sur écran', 'Stress'],
    nuisances: ['Bruit de bureau'],
    typeChangement: 'Promotion interne',
    motif: 'Évolution de carrière',
    motifsChangementPoste: 'Opportunité pour un poste de Développeur Confirmé.',
  },
  {
    id: 'po2',
    intituleFonction: 'Développeur Web Confirmé',
    du: '2017-09-01',
    au: '2020-01-15',
    risquesProfessionnels: ['Travail sur écran prolongé', 'Sédentarité'],
    nuisances: ['Climatisation variable'],
    typeChangement: 'Démission',
    motif: 'Nouvelle opportunité externe',
    motifsChangementPoste: 'Recherche de nouveaux défis techniques.',
  },
  {
    id: 'po3',
    intituleFonction: 'Chef de Projet Technique',
    du: '2020-02-01',
    au: null, 
    risquesProfessionnels: ['Gestion du stress', 'Charge mentale'],
    nuisances: ['Réunions fréquentes'],
    typeChangement: 'En cours',
    motif: '-',
    motifsChangementPoste: '-',
  },
];

const formatDate = (dateString) => {
  if (!dateString) return 'En cours';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short', // Using short month for brevity
    day: 'numeric',
  });
};

const AntecedentsP = ({ patientId }) => {
  // TODO: Fetch data based on patientId in a real app
  const postesData = mockPostesOccupesData; 

  if (!postesData || postesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Postes Occupés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun poste occupé n'a été enregistré pour ce patient.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Postes Occupés</CardTitle>
        <CardDescription>Liste des fonctions exercées par le patient.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Intitulé Fonction</TableHead>
                <TableHead className="min-w-[100px]">Du</TableHead>
                <TableHead className="min-w-[100px]">Au</TableHead>
                <TableHead className="min-w-[200px]">Risques Professionnels</TableHead>
                <TableHead className="min-w-[180px]">Nuisances</TableHead>
                <TableHead className="min-w-[150px]">Type Changement</TableHead>
                <TableHead className="min-w-[180px]">Motif</TableHead>
                <TableHead className="min-w-[250px]">Détails Changement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postesData.map((poste) => (
                <TableRow key={poste.id}>
                  <TableCell className="font-medium">{poste.intituleFonction}</TableCell>
                  <TableCell>{formatDate(poste.du)}</TableCell>
                  <TableCell>{poste.au ? formatDate(poste.au) : <Badge variant="outline">En cours</Badge>}</TableCell>
                  <TableCell>
                    {Array.isArray(poste.risquesProfessionnels) && poste.risquesProfessionnels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {poste.risquesProfessionnels.map((risque, index) => (
                          <Badge key={index} variant="destructive" className="text-xs font-normal">{risque}</Badge>
                        ))}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(poste.nuisances) && poste.nuisances.length > 0 ? (
                       <div className="flex flex-wrap gap-1">
                        {poste.nuisances.map((nuisance, index) => (
                          <Badge key={index} variant="secondary" className="text-xs font-normal">{nuisance}</Badge>
                        ))}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{poste.typeChangement || '-'}</TableCell>
                  <TableCell>{poste.motif || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{poste.motifsChangementPoste || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AntecedentsP;
