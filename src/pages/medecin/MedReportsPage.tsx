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
import ActivitieClinic3 from '@/pages/medecin/consolidationTrimesterielle/activitieClinic3';
import ConclusionMed5 from '@/pages/medecin/consolidationTrimesterielle/conclusionMed5';
import Formation9 from '@/pages/medecin/consolidationTrimesterielle/formation9';
import GeneralInfo12467810 from '@/pages/medecin/consolidationTrimesterielle/generalInfo12467810';

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

const DetailsConsolidationTrim = () => {
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
    
    { value: 'activitieClinic', label: 'Activité Clinique' },
    { value: 'conclusionMed', label: 'Conclusion Médicale' },
    { value: 'formation', label: 'Formation' },
    { value: 'autres', label: 'autres' },
  ];

  const formatTabTitle = (str: string) => {
    const withSpaces = str.replace(/([A-Z])/g, ' $1');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  return (
    <AppLayout title="Consolidation Trimestrielle">
      <div className="p-4 md:p-6 space-y-6">
        

        <Tabs defaultValue="autres" className="w-full">
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
        
          

          <TabsContent value="activitieClinic" className="mt-4">
            <ActivitieClinic3 />
          </TabsContent>

          <TabsContent value="conclusionMed" className="mt-4">
            <ConclusionMed5 />
          </TabsContent>

          <TabsContent value="formation" className="mt-4">
            <Formation9 />
          </TabsContent>

          <TabsContent value="autres" className="mt-4">
            <GeneralInfo12467810 />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DetailsConsolidationTrim;
