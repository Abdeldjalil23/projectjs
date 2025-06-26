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
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui/tabs';

// ✅ InfoField component (no changes needed, looks good)
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
      value={value ?? ''} // Good: handles null/undefined
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full"
    />
  </div>
);

// ✅ InfoTextareaField component (no changes needed, looks good)
const InfoTextareaField = ({
  label = '',
  value = '',
  readOnly = true,
  placeholder = ''
}) => (
  <div className="space-y-1 md:col-span-2 lg:col-span-3"> {/* Spans correctly */}
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Textarea
      id={label.toLowerCase().replace(/\s/g, '-')}
      value={value ?? ''} // Good: handles null/undefined
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full min-h-[80px]"
    />
  </div>
);

// ✅ CheckboxGroup component (no changes needed, looks good)
const CheckboxGroup = ({ groupLabel, options, patientData }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{groupLabel}</Label>
    <div className="space-y-1">
      {options.map(option => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox id={option.id} checked={!!patientData[option.id]} disabled /> {/* Ensure boolean */}
          <Label htmlFor={option.id} className="font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

// Function to format tab titles nicely (e.g., "antecedentsP" -> "Antecedents P")
const formatTabTitle = (str) => {
  if (!str) return '';
  const withSpaces = str.replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

// ✅ Main Page Component
const DossierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // MOCK DATA (ensure all fields used in UI are present)
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
    chronique: true, // Example field to indicate chronic condition
    // Add other fields if they are to be displayed in other tabs
  };

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  const tabsConfig = [
    { value: "info", label: "Infos Générales" },
    { value: "postes", label: "Postes Occupés" },
    { value: "antecedentsP", label: "Antécédents P." }, // Shorter label for tab
    { value: "antecedentsF", label: "Antécédents F." }, // Shorter label for tab
    { value: "accidents", label: "Accidents" },
    { value: "vaccins", label: "Vaccins" },
    { value: "intoxications", label: "Intoxications" },
    { value: "visite1", label: "Visite 1" },
    { value: "visite2", label: "Visite 2" },
  ];

  const getAge = (birthDateString: string) => {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
  return (
    <AppLayout title={`Dossier Médical`}>
      <div className="p-4 md:p-6 space-y-6">

        {/* Title + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight"> {/* Changed to h1 for main page title */}
            {patientData.prenom} {patientData.nom}  age {getAge(patientData.dnaiss)} {patientData.chronique ? ' (Chronique)' : ''}
          </h1>
          <Button onClick={handleNewConsultation}>Nouvelle Consultation</Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          {/* Wrapper for scrollable TabsList */}
          <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <TabsList className="inline-flex h-auto p-0 bg-transparent rounded-none">
              {/* Use inline-flex for TabsList if you want it to not take full width if tabs are few */}
              {/* Or remove inline-flex if you want it to always try to fill width before scrolling */}
              {tabsConfig.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none focus-visible:ring-offset-0"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab: Infos Générales */}
          <TabsContent value="info" className="mt-4"> {/* Added mt-4 for spacing below tabslist */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start gap-4"> {/* Ensure flex-row for side-by-side on sm+ */}
                <Avatar className="h-24 w-24 border flex-shrink-0">
                  <AvatarImage src={patientData.profileImageUrl} alt={`Avatar de ${patientData.prenom}`} />
                  <AvatarFallback>
                    {(patientData.prenom?.[0] || '') + (patientData.nom?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <CardTitle className="text-xl">Informations Générales et Personnelles</CardTitle>
                  <CardDescription>Détails complets du patient.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Increased gap-y for better vertical spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                  <InfoField label="Prénom" value={patientData.prenom} />
                  <InfoField label="Nom" value={patientData.nom} />
                  <InfoField label="Sexe" value={patientData.sexe} />
                  <InfoField label="Nombre d'enfants" value={patientData.nbreEnf?.toString()} type="number" />
                  <InfoField label="Date de Naissance" value={patientData.dnaiss} type="date" />
                  <InfoField label="Groupe Sanguin" value={patientData.gsang} />
                  <InfoField label="N° Sécurité Sociale (NSS)" value={patientData.nss} />
                  <InfoField label="Service National" value={patientData.serviceNational} />
                  
                  {/* Address spans full width on relevant breakpoints */}
                  <InfoTextareaField label="Adresse" value={patientData.adresse} />

                  {/* Formation and Handicap groups */}
                  <CheckboxGroup
                    groupLabel="Formation"
                    options={[
                      { id: 'formationScolaire', label: 'Scolaire' },
                      { id: 'formationProfessionnelle', label: 'Professionnelle' },
                    ]}
                    patientData={patientData}
                  />
                   <CheckboxGroup
                    groupLabel="Handicap"
                    options={[
                      { id: 'handicapMoteur', label: 'Moteur' },
                      { id: 'handicapAuditif', label: 'Auditif' },
                      { id: 'handicapVisuel', label: 'Visuel' },
                    ]}
                    patientData={patientData}
                  />
                  {/* Spacer for grid alignment if needed, or let it flow */}
                  <div className="hidden lg:block"></div>


                  <InfoTextareaField label="Qualification Personnelle" value={patientData.qualificationPersonnelle} />
                  <InfoTextareaField label="Activités Professionnelles Antérieures" value={patientData.activitesProfessionnellesAnterieures} />
                  
                  {/* Contact Section */}
                  <h3 className="text-lg font-semibold col-span-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">Contact</h3>
                  <InfoField label="GSM" value={patientData.contactGsm} type="tel" />
                  <InfoField label="Poste (interne)" value={patientData.contactPoste} />
                  <InfoField label="Email" value={patientData.contactEmail} type="email" />

                  {/* Affectation Section */}
                  <h3 className="text-lg font-semibold col-span-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">Affectation</h3>
                  <InfoField label="Structure d'affectation" value={patientData.affectationStructure} />
                  <InfoField label="Date de Recrutement" value={patientData.affectationDateRecrutement} type="date" />
                  <InfoField label="Date de Départ à la Retraite (prévue)" value={patientData.affectationDepartRetraite} type="date" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder for other tabs */}
          {tabsConfig.filter(tab => tab.value !== "info").map(tab => (
            <TabsContent value={tab.value} key={tab.value} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{formatTabTitle(tab.label.endsWith('.') ? tab.value : tab.label)}</CardTitle> {/* Use value for more detailed title if label is short */}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Contenu pour "{formatTabTitle(tab.label.endsWith('.') ? tab.value : tab.label)}" à venir...</p>
                  {/* You would fetch and display specific data for each tab here */}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;