import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui/tabs';

// ✅ InfoField component
const InfoField = ({
  label = '',
  value = '',
  type = 'text',
  readOnly = true,
  placeholder = ''
}) => (
  <div className="space-y-1">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Input
      id={label.toLowerCase().replace(/\s/g, '-')}
      type={type}
      value={value ?? ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full"
    />
  </div>
);

// ✅ InfoTextareaField component
const InfoTextareaField = ({
  label = '',
  value = '',
  readOnly = true,
  placeholder = ''
}) => (
  <div className="space-y-1 md:col-span-2 lg:col-span-3">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Textarea
      id={label.toLowerCase().replace(/\s/g, '-')}
      value={value ?? ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full min-h-[80px]"
    />
  </div>
);

// ✅ CheckboxGroup component
const CheckboxGroup = ({ groupLabel, options, patientData }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{groupLabel}</Label>
    <div className="space-y-1">
      {options.map(option => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox id={option.id} checked={patientData[option.id]} disabled />
          <Label htmlFor={option.id} className="font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

// ✅ Main Page Component
const DossierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const patientData = {
    id,
    profileImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Patient${id}&radius=50&backgroundColor=00897b,039be5,3949ab,e53935,fb8c00&backgroundType=gradientLinear&fontSize=40`,
    prenom: 'Ali',
    nom: 'Mezhoud',
    sexe: 'Masculin',
    nbreEnf: 2,
    dnaiss: '1980-05-15',
    gsang: 'O+',
    nss: '1800515123456',
    serviceNational: 'Accompli',
    adresse: '123 Rue Principale, Ville, Pays',
    formationScolaire: true,
    formationProfessionnelle: false,
    qualificationPersonnelle: 'Baccalauréat Scientifique, Diplôme d\'ingénieur en informatique.',
    activitesProfessionnellesAnterieures: 'Développeur Web chez Tech Solutions (2015-2020)\nChef de projet chez Innovatech (2020-2023)',
    handicapMoteur: false,
    handicapAuditif: true,
    handicapVisuel: false,
    contactGsm: '0601020304',
    contactPoste: '1234',
    contactEmail: 'ali.mezhoud@example.com',
    affectationStructure: 'Hôpital Central - Service Cardiologie',
    affectationDepartRetraite: '2045-12-31',
    affectationDateRecrutement: '2010-01-20',
  };

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  return (
    <AppLayout title={`Dossier Médical ${patientData.prenom} ${patientData.nom} #${id}`}>
      <div className="p-4 md:p-6 space-y-6">

        {/* Title + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Dossier Patient: {patientData.prenom} {patientData.nom} (N° {id})
          </h2>
          <Button onClick={handleNewConsultation}>Nouvelle Consultation</Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="info">Infos Générales</TabsTrigger>
            <TabsTrigger value="postes">Postes Occupés</TabsTrigger>
            <TabsTrigger value="antecedentsP">Antécédents P</TabsTrigger>
            <TabsTrigger value="antecedentsF">Antécédents F</TabsTrigger>
            <TabsTrigger value="accidents">Accidents</TabsTrigger>
            <TabsTrigger value="vaccins">Vaccins</TabsTrigger>
            <TabsTrigger value="intoxications">Intoxications</TabsTrigger>
            <TabsTrigger value="visite1">Visite 1</TabsTrigger>
            <TabsTrigger value="visite2">Visite 2</TabsTrigger>
          </TabsList>

          {/* Tab: Infos Générales */}
          <TabsContent value="info">
            <Card>
              <CardHeader className="flex gap-4 items-start">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage src={patientData.profileImageUrl} />
                  <AvatarFallback>{patientData.prenom[0]}{patientData.nom[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Informations Générales</CardTitle>
                  <CardDescription>Détails complets du patient.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="Prénom" value={patientData.prenom} />
                  <InfoField label="Nom" value={patientData.nom} />
                  <InfoField label="Sexe" value={patientData.sexe} />
                  <InfoField label="Nombre d'enfants" value={patientData.nbreEnf?.toString() ?? ''} type="number" />
                  <InfoField label="Date de Naissance" value={patientData.dnaiss} type="date" />
                  <InfoField label="Groupe Sanguin" value={patientData.gsang} />
                  <InfoField label="N° Sécurité Sociale (NSS)" value={patientData.nss} />
                  <InfoField label="Service National" value={patientData.serviceNational} />
                  <InfoTextareaField label="Adresse" value={patientData.adresse} />

                  <CheckboxGroup
                    groupLabel="Formation"
                    options={[
                      { id: 'formationScolaire', label: 'Scolaire' },
                      { id: 'formationProfessionnelle', label: 'Professionnelle' },
                    ]}
                    patientData={patientData}
                  />

                  <InfoTextareaField label="Qualification Personnelle" value={patientData.qualificationPersonnelle} />
                  <InfoTextareaField label="Activités Professionnelles Antérieures" value={patientData.activitesProfessionnellesAnterieures} />

                  <CheckboxGroup
                    groupLabel="Handicap"
                    options={[
                      { id: 'handicapMoteur', label: 'Moteur' },
                      { id: 'handicapAuditif', label: 'Auditif' },
                      { id: 'handicapVisuel', label: 'Visuel' },
                    ]}
                    patientData={patientData}
                  />

                  <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4">Contact</h3>
                  <InfoField label="GSM" value={patientData.contactGsm} />
                  <InfoField label="Poste (interne)" value={patientData.contactPoste} />
                  <InfoField label="Email" value={patientData.contactEmail} type="email" />

                  <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4">Affectation</h3>
                  <InfoField label="Structure d'affectation" value={patientData.affectationStructure} />
                  <InfoField label="Date de Départ à la Retraite" value={patientData.affectationDepartRetraite} type="date" />
                  <InfoField label="Date de Recrutement" value={patientData.affectationDateRecrutement} type="date" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="space-y-4">
  
          </div>

          {['postes', 'antecedentsP', 'antecedentsF', 'accidents', 'vaccins', 'intoxications', 'visite1', 'visite2'].map(tab => (
            <TabsContent value={tab} key={tab}>
              <Card>
                <CardHeader><CardTitle>{tab.replace(/([A-Z])/g, ' $1')}</CardTitle></CardHeader>
                <CardContent><p>Détails à ajouter...</p></CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;
