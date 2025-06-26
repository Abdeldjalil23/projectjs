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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
          <Checkbox id={option.id} checked={!!patientData[option.id]} disabled />
          <Label htmlFor={option.id} className="font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

// Function to format tab titles nicely
const formatTabTitle = (str) => {
  if (!str) return '';
  const withSpaces = str.replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

// ✅ Main Page Component
const DossierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // MOCK DATA
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
    chronique: true,
  };

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };
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

const PostesOccupesTab = ({ patientId=id }) => {
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
  const tabsConfig = [
    { value: "info", label: "Infos Générales", component: null }, // Content for "info" is directly below
    { value: "postes", label: "Postes Occupés", component: PostesOccupesTab },
    { value: "antecedentsP", label: "Antécédents P.", component: null /* Placeholder */ },
    { value: "antecedentsF", label: "Antécédents F.", component: null /* Placeholder */ },
    { value: "accidents", label: "Accidents", component: null /* Placeholder */ },
    { value: "vaccins", label: "Vaccins", component: null /* Placeholder */ },
    { value: "intoxications", label: "Intoxications", component: null /* Placeholder */ },
    { value: "visite1", label: "Visite 1", component: null /* Placeholder */ },
    { value: "visite2", label: "Visite 2", component: null /* Placeholder */ },
  ];

  const getAge = (birthDateString) => { // Removed TypeScript type annotation
    if (!birthDateString) return '';
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
    <AppLayout title={`Dossier Médical: ${patientData.prenom} ${patientData.nom}`}>
      <div className="p-4 md:p-6 space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {patientData.prenom} {patientData.nom} - {getAge(patientData.dnaiss)} ans
            {patientData.chronique && <span className="text-red-600 font-semibold ml-2">(Chronique)</span>}
          </h1>
          <Button onClick={handleNewConsultation}>Nouvelle Consultation</Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <TabsList className="inline-flex h-auto p-0 bg-transparent rounded-none">
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
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                  <InfoField label="Prénom" value={patientData.prenom} />
                  <InfoField label="Nom" value={patientData.nom} />
                  <InfoField label="Sexe" value={patientData.sexe} />
                  <InfoField label="Nombre d'enfants" value={patientData.nbreEnf?.toString()} type="number" />
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
                   <CheckboxGroup
                    groupLabel="Handicap"
                    options={[
                      { id: 'handicapMoteur', label: 'Moteur' },
                      { id: 'handicapAuditif', label: 'Auditif' },
                      { id: 'handicapVisuel', label: 'Visuel' },
                    ]}
                    patientData={patientData}
                  />
                  <div className="hidden lg:block"></div>

                  <InfoTextareaField label="Qualification Personnelle" value={patientData.qualificationPersonnelle} />
                  <InfoTextareaField label="Activités Professionnelles Antérieures" value={patientData.activitesProfessionnellesAnterieures} />
                  
                  <h3 className="text-lg font-semibold col-span-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">Contact</h3>
                  <InfoField label="GSM" value={patientData.contactGsm} type="tel" />
                  <InfoField label="Poste (interne)" value={patientData.contactPoste} />
                  <InfoField label="Email" value={patientData.contactEmail} type="email" />

                  <h3 className="text-lg font-semibold col-span-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">Affectation</h3>
                  <InfoField label="Structure d'affectation" value={patientData.affectationStructure} />
                  <InfoField label="Date de Recrutement" value={patientData.affectationDateRecrutement} type="date" />
                  <InfoField label="Date de Départ à la Retraite (prévue)" value={patientData.affectationDepartRetraite} type="date" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Render other tabs using tabsConfig */}
          {tabsConfig.filter(tab => tab.value !== "info").map(tab => {
            const TabComponent = tab.component;
            return (
              <TabsContent value={tab.value} key={tab.value} className="mt-4">
                {TabComponent ? (
                  <TabComponent patientId={id} /> 
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{formatTabTitle(tab.label.endsWith('.') ? tab.value : tab.label)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Contenu pour "{formatTabTitle(tab.label.endsWith('.') ? tab.value : tab.label)}" à venir...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;