import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

const DossierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  return (
    <AppLayout title={`Dossier Médical #${id}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Détails du dossier n° {id}</h2>
          <Button onClick={handleNewConsultation}>
            Nouvelle Consultation
          </Button>
        </div>
        <p className="text-muted-foreground">
          Informations complètes du patient avec l’ID {id} seront affichées ici.
        </p>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;
