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
        <h2 className="text-xl font-bold">Nouvelle consultation pour le patient #{id}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Motif</label>
            <Input type="text" placeholder="Motif de consultation" required />
          </div>

          <div>
            <label className="block mb-1 font-medium">Observations</label>
            <Textarea placeholder="Observations médicales..." required />
          </div>

          <div>
            <label className="block mb-1 font-medium">Traitement proposé</label>
            <Textarea placeholder="Traitement..." required />
          </div>

          <Button type="submit">Enregistrer</Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default LetterOrientation;
