// src/pages/medecin/DossierDetailsPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import PostesOccupeesPage   from '@/pages/medecin/contentDoss/PostesOccupesTab';
import AntecedentsP from '@/pages/medecin/contentDoss/AntecedentsP';
import AntecedentsF from '@/pages/medecin/contentDoss/AntecedentsF';
import Visite1 from '@/pages/medecin/contentDoss/Visite1';
import Visite2 from '@/pages/medecin/contentDoss/Visite2';


// ========== Reusable Fields ==========

const InfoField = ({ label = '', value = '', type = 'text', readOnly = true, placeholder = '' }) => (
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

const InfoTextareaField = ({ label = '', value = '', readOnly = true, placeholder = '' }) => (
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

const CheckboxGroup = ({ groupLabel, options, patientData }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{groupLabel}</Label>
    <div className="space-y-1">
      {options.map(option => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox id={option.id} checked={!!patientData[option.id]} disabled />
          <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
        </div>
      ))}
    </div>
  </div>
);

// ========== Main Page Component ==========

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
    chronique: true,
  };

  const getAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleNewConsultation = () => {
    navigate(`/dossier/${id}/nouvelle-consultation`);
  };

  const tabsConfig = [
    { value: 'info', label: 'Infos Générales' },
    { value: 'postes', label: 'Postes Occupés' },
    { value: 'antecedentsP', label: 'Antécédents P.' },
    { value: 'antecedentsF', label: 'Antécédents F.' },
    { value: 'accidents', label: 'Accidents' },
    { value: 'vaccins', label: 'Vaccins' },
    { value: 'intoxications', label: 'Intoxications' },
    { value: 'visite1', label: 'Visite 1' },
  ];

  const formatTabTitle = (str: string) => {
    const withSpaces = str.replace(/([A-Z])/g, ' $1');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  return (
    <AppLayout title="Dossier Médical">
      <div className="p-4 md:p-6 space-y-6">
        {/* Title + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={patientData.profileImageUrl} alt="Avatar" />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {(patientData.prenom?.[0] || '') + (patientData.nom?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {patientData.prenom} {patientData.nom}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Âge:</span>
                  <span>{getAge(patientData.dnaiss)} ans</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Sexe:</span>
                  <span>{patientData.sexe}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Groupe:</span>
                  <span>{patientData.gsang}</span>
                </span>
                {patientData.chronique && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Chronique
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleNewConsultation}>Nouvelle Consultation</Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <TabsList className="inline-flex h-auto p-0 bg-transparent rounded-none">
              {tabsConfig.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tabs Content */}

          <TabsContent value="info" className="mt-4">
            <Card>
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

          <TabsContent value="postes" className="mt-4">
            <PostesOccupeesPage patientId={patientData} />
          </TabsContent>

          <TabsContent value="antecedentsP" className="mt-4">
            <AntecedentsP />
          </TabsContent>

          <TabsContent value="antecedentsF" className="mt-4">
            <AntecedentsF agentId={patientData.id} />
          </TabsContent>

          <TabsContent value="visite1" className="mt-4">
            <Visite1 />
          </TabsContent>

          <TabsContent value="visite2" className="mt-4">
            <Visite2 agentId={patientData.id} />
          </TabsContent>

       
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DossierDetailsPage;
