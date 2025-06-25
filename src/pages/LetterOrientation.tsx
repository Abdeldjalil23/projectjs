// src/pages/letterorientation.tsx
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const LetterOrientation = () => {
  const { id } = useParams(); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Consultation enregistrée");
  };

  return (
    <AppLayout title="Nouvelle Consultation">
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold">Letter D'Orientation pour le patient {id}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nom</label>
            <Input type="text" placeholder="Nom du patient" required />
          </div>
            <div>
                <label className="block mb-1 font-medium">Prénom</label>
                <Input type="text" placeholder="Prénom du patient" required />
            </div>
            <div>
                <label className="block mb-1 font-medium">Âge</label>
                <Input type="number" min={0} placeholder="Âge du patient" required />
            </div>

            <div>
                <label className="block mb-1 font-medium">Nature de Visite</label>
                <select className="border border-gray-300 rounded-md p-2 w-full" required>
                    <option value="">— Sélectionner la nature de la visite —</option>
                    <option value="periodique">Visite périodique</option>
                    <option value="specifique">Visite spécifique</option>
                    <option value="soins">Visite de soins</option>
                    <option value="urgence_medicochirurgicale">Urgence médico-chirurgicale</option>
                    <option value="embauche">Visite d'embauche</option>


                </select>
            </div>
          <div>
            <Textarea placeholder="Le/La susnomme nécessite un avis / consultation en ..." required />
          </div>

          <Button type="submit">Envoyer</Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default LetterOrientation;
