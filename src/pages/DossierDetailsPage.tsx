import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { useAuth } from '@/context/AuthContext'; // Keep if needed for other logic like the button

// Helper component for input fields to reduce repetition
const InfoField = ({ label, value, type = "text", readOnly = true, placeholder }) => (
  <div className="space-y-1">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Input
      id={label.toLowerCase().replace(/\s/g, '-')}
      type={type}
      value={value || ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full"
    />
  </div>
);

const InfoTextareaField = ({ label, value, readOnly = true, placeholder }) => (
  <div className="space-y-1 md:col-span-2 lg:col-span-3"> {/* Allow textarea to span more columns */}
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Textarea
      id={label.toLowerCase().replace(/\s/g, '-')}
      value={value || ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full min-h-[80px]"
    />
  </div>
);

// Helper component for checkbox groups
const CheckboxGroup = ({ groupLabel, options, patientData }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{groupLabel}</Label>
    <div className="space-y-1">
      {options.map(option => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={patientData[option.id]}
            disabled // For display purposes
          />
          <Label htmlFor={option.id} className="font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);


const DossierDetailsPage = () => {
  const { id } = useParams(); // This id would be used to fetch the specific patient
  const navigate = useNavigate();
  // const { userRole } = useAuth(); // You might use this to control editability or button visibility
  // const isPatient = userRole === 'patient';

  // MOCK PATIENT DATA - In a real app, fetch this based on `id`
  // This should ideally come from an API: fetch(`/api/patients/${id}`)
  const patientData = {
    id: id,
    profileImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Patient${id}&radius=50&backgroundColor=00897b,039be5,3949ab,e53935,fb8c00&backgroundType=gradientLinear&fontSize=40`, // Placeholder image
    prenom: 'Ali', // Added from your original example
    nom: 'Mezhoud',  // Added from your original example
    sexe: 'Masculin',
    nbreEnf: 2,
    dnaiss: '1980-05-15', // Date de naissance
    gsang: 'O+', // Groupe sanguin
    nss: '1800515123456', // Numéro de Sécurité Sociale
    serviceNational: 'Accompli',
    adresse: '123 Rue Principale, Ville, Pays',
    // Formation: scolaire ou profesienelle (checkboxes)
    formationScolaire: true,
    formationProfessionnelle: false,
    qualificationPersonnelle: 'Baccalauréat Scientifique, Diplôme d\'ingénieur en informatique.',
    activitesProfessionnellesAnterieures: 'Développeur Web chez Tech Solutions (2015-2020)\nChef de projet chez Innovatech (2020-2023)',
    // Handicapé: moteur ou auditif ou visuel (checkboxes)
    handicapMoteur: false,
    handicapAuditif: true,
    handicapVisuel: false,
    // Contact
    contactGsm: '0601020304',
    contactPoste: '1234',
    contactEmail: 'ali.mezhoud@example.com',
    // Affectation
    affectationStructure: 'Hôpital Central - Service Cardiologie',
    affectationDepartRetraite: '2045-12-31',
    affectationDateRecrutement: '2010-01-20',
  };

  if (!patientData) {
    // Handle case where patient data might not be found (e.g., after API call)
    return (
      <AppLayout title="Dossier Médical Introuvable">
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Dossier n° {id} introuvable.</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Retour</Button>
        </div>
      </AppLayout>
    );
  }

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  return (
    <AppLayout title={`Dossier Médical ${patientData.prenom} ${patientData.nom} #${id}`}>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Dossier Patient: {patientData.prenom} {patientData.nom} (N° {id})
          </h2>
          {/* Example: Conditionally show button based on role */}
          {/* {!isPatient && ( */}
          <Button onClick={handleNewConsultation}>
            Nouvelle Consultation
          </Button>
          {/* )} */}
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-24 w-24 border">
                <AvatarImage src={patientData.profileImageUrl} alt={`Profil de ${patientData.prenom}`} />
                <AvatarFallback>{patientData.prenom?.[0]}{patientData.nom?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">Informations Générales et Personnelles</CardTitle>
                <CardDescription>Détails complets du patient.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {/* Basic Info */}
              <InfoField label="Prénom" value={patientData.prenom} />
              <InfoField label="Nom" value={patientData.nom} />
              <InfoField label="Sexe" value={patientData.sexe} />
              <InfoField label="Nombre d'enfants" value={patientData.nbreEnf} type="number" />
              <InfoField label="Date de Naissance" value={patientData.dnaiss} type="date" />
              <InfoField label="Groupe Sanguin" value={patientData.gsang} />
              <InfoField label="N° Sécurité Sociale (NSS)" value={patientData.nss} />
              <InfoField label="Service National" value={patientData.serviceNational} />
              
              <InfoTextareaField label="Adresse" value={patientData.adresse} />

              {/* Formation */}
              <div className="md:col-span-1 lg:col-span-1 space-y-2"> {/* Group checkboxes */}
                <CheckboxGroup
                  groupLabel="Formation"
                  options={[
                    { id: 'formationScolaire', label: 'Scolaire' },
                    { id: 'formationProfessionnelle', label: 'Professionnelle' },
                  ]}
                  patientData={patientData}
                />
              </div>

              <InfoTextareaField label="Qualification Personnelle" value={patientData.qualificationPersonnelle} />
              <InfoTextareaField label="Activités Professionnelles Antérieures" value={patientData.activitesProfessionnellesAnterieures} />

              {/* Handicap */}
              <div className="md:col-span-1 lg:col-span-1 space-y-2"> {/* Group checkboxes */}
                <CheckboxGroup
                  groupLabel="Handicap"
                  options={[
                    { id: 'handicapMoteur', label: 'Moteur' },
                    { id: 'handicapAuditif', label: 'Auditif' },
                    { id: 'handicapVisuel', label: 'Visuel' },
                  ]}
                  patientData={patientData}
                />
              </div>
              
              {/* Spacer for grid alignment if needed, or just let it flow */}
              <div className="hidden lg:block"></div> 
              <div className="hidden lg:block"></div>


              {/* Contact Section Title (Optional) */}
              <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4 mb-2 border-b pb-1">Contact</h3>
              <InfoField label="GSM" value={patientData.contactGsm} type="tel" />
              <InfoField label="Poste (Tél. interne)" value={patientData.contactPoste} />
              <InfoField label="Email" value={patientData.contactEmail} type="email" />

              {/* Affectation Section Title (Optional) */}
              <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4 mb-2 border-b pb-1">Affectation</h3>
              <InfoField label="Structure d'affectation" value={patientData.affectationStructure} />
              <InfoField label="Date de départ à la retraite (prévue)" value={patientData.affectationDepartRetraite} type="date" />
              <InfoField label="Date de recrutement" value={patientData.affectationDateRecrutement} type="date" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;