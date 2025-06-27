// You can place this file in a relevant folder, e.g., src/pages/dossiers/AntecedentsF.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PlusCircle, Save, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Define a type for a single antecedent record for better TypeScript support
type Antecedent = {
  id: number;
  date: string;
  type: string;
  malade: string;
  descriptionMaladie: string;
  interventionsChirurgicale: string;
  descriptionIntervention: string;
  accidents: string;
};

// Initial mock data to show how the table works
const initialData: Antecedent[] = [
  {
    id: 1,
    date: '2015-06-20',
    type: 'Chirurgical',
    malade: 'Non',
    descriptionMaladie: '-',
    interventionsChirurgicale: 'Appendicectomie',
    descriptionIntervention: 'Ablation de l\'appendice suite à une inflammation aiguë.',
    accidents: '-',
  },
  {
    id: 2,
    date: '2021-01-10',
    type: 'Médical',
    malade: 'Oui',
    descriptionMaladie: 'Hypertension artérielle',
    descriptionIntervention: '-',
    interventionsChirurgicale: '-',
    accidents: 'Aucun',
  },
];

const AntecedentsP = () => {
  const [antecedents, setAntecedents] = useState<Antecedent[]>(initialData);

  // Handles changes in any input field within the table
  const handleInputChange = (id: number, field: keyof Antecedent, value: string) => {
    setAntecedents((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Adds a new, empty row to the table
  const handleAddRow = () => {
    const newRow: Antecedent = {
      id: Date.now(), // Use a timestamp for a unique temporary ID
      date: '',
      type: '',
      malade: '',
      descriptionMaladie: '',
      interventionsChirurgicale: '',
      descriptionIntervention: '',
      accidents: '',
    };
    setAntecedents((prev) => [...prev, newRow]);
    toast.info('Nouvelle ligne ajoutée. Veuillez la remplir.');
  };

  // Removes a row from the table by its ID
  const handleDeleteRow = (id: number) => {
    setAntecedents((prev) => prev.filter((row) => row.id !== id));
    toast.success('Ligne supprimée avec succès.');
  };

  // Simulates saving the data
  const handleSave = () => {
    // In a real application, you would send this data to your backend API
    console.log('Données à enregistrer:', antecedents);
    toast.success('Les antécédents ont été enregistrés !');
    // Optionally, you could navigate away after saving
    // navigate('/dossiers');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Saisir les antécédents personnels de l'agent
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des Antécédents</CardTitle>
          <Button onClick={handleAddRow} size="sm" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Ajouter un antécédent
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Date</TableHead>
                  <TableHead className="min-w-[150px]">Type d'antécédents</TableHead>
                  <TableHead className="min-w-[100px]">Malade</TableHead>
                  <TableHead className="min-w-[250px]">Description Maladie</TableHead>
                  <TableHead className="min-w-[250px]">Interventions Chirurgicales</TableHead>
                  <TableHead className="min-w-[250px]">Description de l'intervention</TableHead>
                  <TableHead className="min-w-[200px]">Accidents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {antecedents.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleInputChange(row.id, 'date', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Médical, Chirurgical..."
                        value={row.type}
                        onChange={(e) => handleInputChange(row.id, 'type', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Oui/Non"
                        value={row.malade}
                        onChange={(e) => handleInputChange(row.id, 'malade', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Description de la maladie..."
                        value={row.descriptionMaladie}
                        onChange={(e) => handleInputChange(row.id, 'descriptionMaladie', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Nom de l'intervention..."
                        value={row.interventionsChirurgicale}
                        onChange={(e) => handleInputChange(row.id, 'interventionsChirurgicale', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Détails de l'intervention..."
                        value={row.descriptionIntervention}
                        onChange={(e) => handleInputChange(row.id, 'descriptionIntervention', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Type d'accident..."
                        value={row.accidents}
                        onChange={(e) => handleInputChange(row.id, 'accidents', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {antecedents.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              Aucun antécédent saisi. Cliquez sur "Ajouter" pour commencer.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Annuler
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default AntecedentsP;