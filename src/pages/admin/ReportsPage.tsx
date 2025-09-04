import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Reusable Components with corrected types
interface InfoFieldProps {
  label: string;
  value: string | number;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InfoField = ({ 
  label, 
  value, 
  type = 'text', 
  readOnly = false, 
  placeholder = '', 
  className = '',
  onChange 
}: InfoFieldProps) => (
  <div className={`space-y-1 ${className}`}>
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium">
      {label}
    </Label>
    <Input
      id={label.toLowerCase().replace(/\s/g, '-')}
      type={type}
      value={value || ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full"
      onChange={onChange}
    />
  </div>
);

interface InfoTextareaFieldProps {
  label: string;
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InfoTextareaField = ({ 
  label, 
  value, 
  readOnly = false, 
  placeholder = '',
  onChange 
}: InfoTextareaFieldProps) => (
  <div className="space-y-1">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')} className="text-sm font-medium">
      {label}
    </Label>
    <Textarea
      id={label.toLowerCase().replace(/\s/g, '-')}
      value={value || ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full min-h-[80px]"
      onChange={onChange}
    />
  </div>
);

interface DataTableProps {
  headers: string[];
  data: (string | number)[][];
  title?: string;
}

const DataTable = ({ headers, data, title }: DataTableProps) => (
  <div className="my-4">
    {title && <h4 className="font-medium mb-2">{title}</h4>}
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="bg-gray-100">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

// Tab Components
const ClinicalActivities = () => {
  const [clinicalData, setClinicalData] = useState({
    // 3.1 Visites d'embauche
    permanentStaff: 0,
    contractStaff: 0,
    apprentices: 0,
    totalHiringVisits: 0,
    
    // 3.2 Visites périodiques
    annualStaff: 0,
    annualExamined: 0,
    annualCoverage: 0,
    specialApprentices: 0,
    specialExposed: 0,
    specialStaff: 0,
    specialExamined: 0,
    specialVisits: 0,
    specialCoverage: 0,
    
    // 3.3 Visites de reprise de travail
    occupationalDisease: 0,
    workAccidents: 0,
    maternityLeave: 0,
    workStoppage: 0,
    repeatedAbsences: 0,
    
    // 3.4 Visites spontanées
    employerRequest: 0,
    agentRequest: 0,
    totalSpontaneous: 0,
    
    // 3.5 Urgences médico-chirurgicales
    medicalCases: 0,
    surgicalCases: 0,
    managedCases: 0,
    evacuatedCases: 0,
    totalEmergencies: 0,
    
    // 3.6 Visites médicales de soins
    sonatrachWorkers: 0,
    totalCareVisits: 0,
    
    // Notes fields
    annualNotes: '',
    specialNotes: '',
  });

  const calculateTotal = () => {
    setClinicalData(prev => ({
      ...prev,
      totalHiringVisits: prev.permanentStaff + prev.contractStaff + prev.apprentices,
      totalSpontaneous: prev.employerRequest + prev.agentRequest,
      totalEmergencies: prev.medicalCases + prev.surgicalCases,
      annualCoverage: prev.annualStaff > 0 ? Math.round((prev.annualExamined / prev.annualStaff) * 100) : 0,
      specialCoverage: prev.specialStaff > 0 ? Math.round((prev.specialExamined / prev.specialStaff) * 100) : 0,
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setClinicalData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* 3.1 Visites d'embauche */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Visites d'embauche</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoField 
              label="Personnel permanent" 
              value={clinicalData.permanentStaff} 
              type="number" 
              onChange={(e) => handleInputChange('permanentStaff', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Personnel contractuel" 
              value={clinicalData.contractStaff} 
              type="number"
              onChange={(e) => handleInputChange('contractStaff', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Apprentis" 
              value={clinicalData.apprentices} 
              type="number"
              onChange={(e) => handleInputChange('apprentices', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Total des visites" 
              value={clinicalData.totalHiringVisits} 
              readOnly 
              className="bg-gray-50"
            />
          </div>
          <Button onClick={calculateTotal} className="mt-2">Calculer le total</Button>
        </div>

        {/* 3.2 Visites périodiques */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Visites périodiques</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Visite annuelle</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoField 
                label="Effectif soumis à la visite" 
                value={clinicalData.annualStaff} 
                type="number"
                onChange={(e) => handleInputChange('annualStaff', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Personnel examiné" 
                value={clinicalData.annualExamined} 
                type="number"
                onChange={(e) => handleInputChange('annualExamined', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Taux de couverture (%)" 
                value={clinicalData.annualCoverage} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            <InfoTextareaField 
              label="Notes" 
              value={clinicalData.annualNotes}
              onChange={(e) => handleInputChange('annualNotes', e.target.value)}
              placeholder="Notes sur les visites annuelles"
            />
          </div>

          <div>
            <h4 className="font-medium mb-2">Visites particulières</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoField 
                label="Effectif soumis" 
                value={clinicalData.specialStaff} 
                type="number"
                onChange={(e) => handleInputChange('specialStaff', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Personnel examiné" 
                value={clinicalData.specialExamined} 
                type="number"
                onChange={(e) => handleInputChange('specialExamined', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Nombre de visites" 
                value={clinicalData.specialVisits} 
                type="number"
                onChange={(e) => handleInputChange('specialVisits', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Taux de couverture (%)" 
                value={clinicalData.specialCoverage} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            <InfoTextareaField 
              label="Notes" 
              value={clinicalData.specialNotes}
              onChange={(e) => handleInputChange('specialNotes', e.target.value)}
              placeholder="Notes sur les visites particulières"
            />
          </div>
        </div>

        {/* 3.3 Visites de reprise de travail */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Visites de reprise de travail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <InfoField 
              label="Maladie professionnelle" 
              value={clinicalData.occupationalDisease} 
              type="number"
              onChange={(e) => handleInputChange('occupationalDisease', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Accidents de travail" 
              value={clinicalData.workAccidents} 
              type="number"
              onChange={(e) => handleInputChange('workAccidents', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Congé de maternité" 
              value={clinicalData.maternityLeave} 
              type="number"
              onChange={(e) => handleInputChange('maternityLeave', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Arrêt de travail" 
              value={clinicalData.workStoppage} 
              type="number"
              onChange={(e) => handleInputChange('workStoppage', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Absences répétées" 
              value={clinicalData.repeatedAbsences} 
              type="number"
              onChange={(e) => handleInputChange('repeatedAbsences', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 3.4 Visites spontanées */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Visites spontanées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField 
              label="À la demande de l'employeur" 
              value={clinicalData.employerRequest} 
              type="number"
              onChange={(e) => handleInputChange('employerRequest', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="À la demande de l'agent" 
              value={clinicalData.agentRequest} 
              type="number"
              onChange={(e) => handleInputChange('agentRequest', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Total des visites" 
              value={clinicalData.totalSpontaneous} 
              readOnly 
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* 3.5 Urgences médico-chirurgicales */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Urgences médico-chirurgicales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Médicales" 
              value={clinicalData.medicalCases} 
              type="number"
              onChange={(e) => handleInputChange('medicalCases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Chirurgicales" 
              value={clinicalData.surgicalCases} 
              type="number"
              onChange={(e) => handleInputChange('surgicalCases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Total" 
              value={clinicalData.totalEmergencies} 
              readOnly 
              className="bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField 
              label="Prise en charge" 
              value={clinicalData.managedCases} 
              type="number"
              onChange={(e) => handleInputChange('managedCases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Évacué" 
              value={clinicalData.evacuatedCases} 
              type="number"
              onChange={(e) => handleInputChange('evacuatedCases', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 3.6 Visites médicales de soins */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Visites médicales de soins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField 
              label="Travailleurs Sonatrach" 
              value={clinicalData.sonatrachWorkers} 
              type="number"
              onChange={(e) => handleInputChange('sonatrachWorkers', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Total" 
              value={clinicalData.totalCareVisits} 
              type="number"
              onChange={(e) => handleInputChange('totalCareVisits', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Training = () => {
  const [trainingData, setTrainingData] = useState({
    // 9.1 Formation et travaux du médecin
    doctorTrainingType: '',
    doctorTrainingPlace: '',
    doctorTrainingDuration: '',
    doctorInternshipType: '',
    doctorInternshipPlace: '',
    doctorInternshipDuration: '',
    doctorSeminarType: '',
    doctorSeminarPlace: '',
    doctorSeminarDuration: '',
    doctorOtherType: '',
    doctorOtherPlace: '',
    doctorOtherDuration: '',
    
    // 9.2 Formations animées par le médecin
    conductedTrainingType: '',
    conductedTrainingPlace: '',
    conductedTrainingDuration: '',
    conductedFirstAidType: '',
    conductedFirstAidPlace: '',
    conductedFirstAidDuration: '',
    conductedOccupationalType: '',
    conductedOccupationalPlace: '',
    conductedOccupationalDuration: '',
    conductedOtherType: '',
    conductedOtherPlace: '',
    conductedOtherDuration: '',
    
    // 9.3 Séance d'éducation sanitaire
    healthEducationThemes: '',
    healthEducationParticipants: 0,
    healthEducationTotal: 0,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setTrainingData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* 9.1 Formation et travaux du médecin */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Formation et travaux du médecin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Formation" 
              value={trainingData.doctorTrainingType}
              onChange={(e) => handleInputChange('doctorTrainingType', e.target.value)}
              placeholder="Type de formation"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.doctorTrainingPlace}
              onChange={(e) => handleInputChange('doctorTrainingPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.doctorTrainingDuration}
              onChange={(e) => handleInputChange('doctorTrainingDuration', e.target.value)}
              placeholder="Ex: 2 jours"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Stage" 
              value={trainingData.doctorInternshipType}
              onChange={(e) => handleInputChange('doctorInternshipType', e.target.value)}
              placeholder="Type de stage"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.doctorInternshipPlace}
              onChange={(e) => handleInputChange('doctorInternshipPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.doctorInternshipDuration}
              onChange={(e) => handleInputChange('doctorInternshipDuration', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Participation à un séminaire" 
              value={trainingData.doctorSeminarType}
              onChange={(e) => handleInputChange('doctorSeminarType', e.target.value)}
              placeholder="Nom du séminaire"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.doctorSeminarPlace}
              onChange={(e) => handleInputChange('doctorSeminarPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.doctorSeminarDuration}
              onChange={(e) => handleInputChange('doctorSeminarDuration', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField 
              label="Autres" 
              value={trainingData.doctorOtherType}
              onChange={(e) => handleInputChange('doctorOtherType', e.target.value)}
              placeholder="Type d'activité"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.doctorOtherPlace}
              onChange={(e) => handleInputChange('doctorOtherPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.doctorOtherDuration}
              onChange={(e) => handleInputChange('doctorOtherDuration', e.target.value)}
            />
          </div>
        </div>

        {/* 9.2 Formations animées par le médecin */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Formations animées par le médecin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Formation" 
              value={trainingData.conductedTrainingType}
              onChange={(e) => handleInputChange('conductedTrainingType', e.target.value)}
              placeholder="Type de formation"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.conductedTrainingPlace}
              onChange={(e) => handleInputChange('conductedTrainingPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.conductedTrainingDuration}
              onChange={(e) => handleInputChange('conductedTrainingDuration', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Secourisme" 
              value={trainingData.conductedFirstAidType}
              onChange={(e) => handleInputChange('conductedFirstAidType', e.target.value)}
              placeholder="Détails"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.conductedFirstAidPlace}
              onChange={(e) => handleInputChange('conductedFirstAidPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.conductedFirstAidDuration}
              onChange={(e) => handleInputChange('conductedFirstAidDuration', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Médecin de travail" 
              value={trainingData.conductedOccupationalType}
              onChange={(e) => handleInputChange('conductedOccupationalType', e.target.value)}
              placeholder="Détails"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.conductedOccupationalPlace}
              onChange={(e) => handleInputChange('conductedOccupationalPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.conductedOccupationalDuration}
              onChange={(e) => handleInputChange('conductedOccupationalDuration', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField 
              label="Autres" 
              value={trainingData.conductedOtherType}
              onChange={(e) => handleInputChange('conductedOtherType', e.target.value)}
              placeholder="Type d'activité"
            />
            <InfoField 
              label="Lieu" 
              value={trainingData.conductedOtherPlace}
              onChange={(e) => handleInputChange('conductedOtherPlace', e.target.value)}
            />
            <InfoField 
              label="Durée" 
              value={trainingData.conductedOtherDuration}
              onChange={(e) => handleInputChange('conductedOtherDuration', e.target.value)}
            />
          </div>
        </div>

        {/* 9.3 Séance d'éducation sanitaire */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Séance d'éducation sanitaire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InfoTextareaField 
              label="Thèmes" 
              value={trainingData.healthEducationThemes}
              onChange={(e) => handleInputChange('healthEducationThemes', e.target.value)}
              placeholder="Thèmes abordés"
            />
            <div className="space-y-4">
              <InfoField 
                label="Nombre de participants" 
                value={trainingData.healthEducationParticipants} 
                type="number"
                onChange={(e) => handleInputChange('healthEducationParticipants', parseInt(e.target.value) || 0)}
              />
              <InfoField 
                label="Total" 
                value={trainingData.healthEducationTotal} 
                type="number"
                onChange={(e) => handleInputChange('healthEducationTotal', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MedicalConclusions = () => {
  const [medicalData, setMedicalData] = useState({
    // 5.1 Décisions d'aptitudes
    hiredAptitude: 0,
    hiredAptitudeWithReserve: 0,
    hiredUnfit: 0,
    periodicAptitude: 0,
    periodicAptitudeWithReserve: 0,
    periodicUnfit: 0,
    returnAptitude: 0,
    returnAptitudeWithReserve: 0,
    returnUnfit: 0,
    otherAptitude: 0,
    otherAptitudeWithReserve: 0,
    otherUnfit: 0,
    totalAptitude: 0,
    
    // 5.2 Déclarations de maladies professionnelles
    occupationalDiseases: [],
    occupationalDiseaseTable: '',
    occupationalDiseaseName: '',
    occupationalDiseaseCount: 0,
    occupationalDiseaseTotal: 0,
    
    // 5.2.2 Maladies à caractère professionnel
    workRelatedDiseases: [],
    workRelatedRisk: '',
    workRelatedJob: '',
    workRelatedCount: 0,
    workRelatedTotal: 0,
    
    // 5.3 Déclarations d'accidents de travail
    accidentsWithoutStop: 0,
    accidentsWithStop: 0,
    accidentsWithDeath: 0,
    accidentObservations: '',
    
    // 5.4 Maladies à déclarations obligatoires
    notifiableDiseases: [],
    notifiableDiseaseName: '',
    notifiableDiseaseCount: 0,
    notifiableDiseaseObservations: '',
    
    // 5.5 Orientations spécialisées
    cardiologyReferrals: 0,
    dermatologyReferrals: 0,
    otherReferrals: 0,
    
    // 5.6 Affections chroniques dépistées
    htaCases: 0,
    idmCases: 0,
    valvulopathyCases: 0,
    
    // 5.7 Reclassements professionnels
    jobChangeTemporary: 0,
    jobChangePermanent: 0,
    workplaceAdjustmentTemporary: 0,
    workplaceAdjustmentPermanent: 0,
    
    // 5.8 Maladies de longue durée et invalidité
    longTermDiseases: 0,
    disabilityCases: 0,
    
    // Travailleurs fortement exposés
    exposedWorkers: [],
    exposedRisk: '',
    exposedStaff: 0,
    exposedExamined: 0,
    exposedVisits: 0,
    exposedCoverage: 0,
    exposedNotes: '',
  });

  const handleInputChange = (field: string, value: string | number) => {
    setMedicalData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAptitudeTotal = () => {
    const hiredTotal = medicalData.hiredAptitude + medicalData.hiredAptitudeWithReserve + medicalData.hiredUnfit;
    const periodicTotal = medicalData.periodicAptitude + medicalData.periodicAptitudeWithReserve + medicalData.periodicUnfit;
    const returnTotal = medicalData.returnAptitude + medicalData.returnAptitudeWithReserve + medicalData.returnUnfit;
    const otherTotal = medicalData.otherAptitude + medicalData.otherAptitudeWithReserve + medicalData.otherUnfit;
    
    const total = hiredTotal + periodicTotal + returnTotal + otherTotal;
    
    setMedicalData(prev => ({ ...prev, totalAptitude: total }));
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* 5.1 Décisions d'aptitudes */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Décisions d'aptitudes</h3>
          <DataTable
            headers={['', 'Aptitude', 'Aptitude avec réserve', 'Inapte']}
            data={[
              ['Embauché', medicalData.hiredAptitude, medicalData.hiredAptitudeWithReserve, medicalData.hiredUnfit],
              ['Périodique', medicalData.periodicAptitude, medicalData.periodicAptitudeWithReserve, medicalData.periodicUnfit],
              ['Reprise', medicalData.returnAptitude, medicalData.returnAptitudeWithReserve, medicalData.returnUnfit],
              ['Autres', medicalData.otherAptitude, medicalData.otherAptitudeWithReserve, medicalData.otherUnfit],
              ['Total', medicalData.totalAptitude, '', ''],
            ]}
          />
          <Button onClick={calculateAptitudeTotal} className="mt-2">Calculer le total</Button>
        </div>

        {/* 5.2 Déclarations de maladies professionnelles */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Déclarations de maladies professionnelles</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Maladies professionnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <InfoField 
                label="N° du tableau" 
                value={medicalData.occupationalDiseaseTable}
                onChange={(e) => handleInputChange('occupationalDiseaseTable', e.target.value)}
              />
              <InfoField 
                label="Maladie" 
                value={medicalData.occupationalDiseaseName}
                onChange={(e) => handleInputChange('occupationalDiseaseName', e.target.value)}
              />
              <InfoField 
                label="Nombre" 
                value={medicalData.occupationalDiseaseCount} 
                type="number"
                onChange={(e) => handleInputChange('occupationalDiseaseCount', parseInt(e.target.value) || 0)}
              />
            </div>
            <InfoField 
              label="Total" 
              value={medicalData.occupationalDiseaseTotal} 
              type="number"
              onChange={(e) => handleInputChange('occupationalDiseaseTotal', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Maladies à caractère professionnel</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <InfoField 
                label="Risque / Agent causal" 
                value={medicalData.workRelatedRisk}
                onChange={(e) => handleInputChange('workRelatedRisk', e.target.value)}
              />
              <InfoField 
                label="Poste occupé" 
                value={medicalData.workRelatedJob}
                onChange={(e) => handleInputChange('workRelatedJob', e.target.value)}
              />
              <InfoField 
                label="Nombre" 
                value={medicalData.workRelatedCount} 
                type="number"
                onChange={(e) => handleInputChange('workRelatedCount', parseInt(e.target.value) || 0)}
              />
            </div>
            <InfoField 
              label="Total" 
              value={medicalData.workRelatedTotal} 
              type="number"
              onChange={(e) => handleInputChange('workRelatedTotal', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 5.3 Déclarations d'accidents de travail */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Déclarations d'accidents de travail</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InfoField 
              label="Accidents sans arrêt" 
              value={medicalData.accidentsWithoutStop} 
              type="number"
              onChange={(e) => handleInputChange('accidentsWithoutStop', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Accident entraînant un arrêt" 
              value={medicalData.accidentsWithStop} 
              type="number"
              onChange={(e) => handleInputChange('accidentsWithStop', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Accident entraînant un décès" 
              value={medicalData.accidentsWithDeath} 
              type="number"
              onChange={(e) => handleInputChange('accidentsWithDeath', parseInt(e.target.value) || 0)}
            />
          </div>
          <InfoTextareaField 
            label="Observations" 
            value={medicalData.accidentObservations}
            onChange={(e) => handleInputChange('accidentObservations', e.target.value)}
          />
        </div>

        {/* 5.4 Maladies à déclarations obligatoires */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Maladies à déclarations obligatoires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InfoField 
              label="Maladies" 
              value={medicalData.notifiableDiseaseName}
              onChange={(e) => handleInputChange('notifiableDiseaseName', e.target.value)}
            />
            <InfoField 
              label="Nombre" 
              value={medicalData.notifiableDiseaseCount} 
              type="number"
              onChange={(e) => handleInputChange('notifiableDiseaseCount', parseInt(e.target.value) || 0)}
            />
          </div>
          <InfoTextareaField 
            label="Observations" 
            value={medicalData.notifiableDiseaseObservations}
            onChange={(e) => handleInputChange('notifiableDiseaseObservations', e.target.value)}
          />
        </div>

        {/* 5.5 Orientations spécialisées */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Orientations spécialisées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField 
              label="Cardiologie" 
              value={medicalData.cardiologyReferrals} 
              type="number"
              onChange={(e) => handleInputChange('cardiologyReferrals', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Dermatologie" 
              value={medicalData.dermatologyReferrals} 
              type="number"
              onChange={(e) => handleInputChange('dermatologyReferrals', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Autres" 
              value={medicalData.otherReferrals} 
              type="number"
              onChange={(e) => handleInputChange('otherReferrals', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 5.6 Affections chroniques dépistées */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Affections chroniques dépistées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField 
              label="HTA" 
              value={medicalData.htaCases} 
              type="number"
              onChange={(e) => handleInputChange('htaCases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="IDM" 
              value={medicalData.idmCases} 
              type="number"
              onChange={(e) => handleInputChange('idmCases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Valvulopathies" 
              value={medicalData.valvulopathyCases} 
              type="number"
              onChange={(e) => handleInputChange('valvulopathyCases', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 5.7 Reclassements professionnels */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Reclassements professionnels</h3>
          <DataTable
            headers={['', 'Temporaire', 'Définitif']}
            data={[
              ['Changement de poste', medicalData.jobChangeTemporary, medicalData.jobChangePermanent],
              ['Aménagement de poste', medicalData.workplaceAdjustmentTemporary, medicalData.workplaceAdjustmentPermanent],
            ]}
          />
        </div>

        {/* 5.8 Maladies de longue durée et invalidité */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Maladies de longue durée et invalidité</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField 
              label="Maladies de longue durée" 
              value={medicalData.longTermDiseases} 
              type="number"
              onChange={(e) => handleInputChange('longTermDiseases', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Invalidité" 
              value={medicalData.disabilityCases} 
              type="number"
              onChange={(e) => handleInputChange('disabilityCases', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Travailleurs fortement exposés aux risques professionnels */}
        <div>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Travailleurs fortement exposés aux risques professionnels</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <InfoField 
              label="Risque" 
              value={medicalData.exposedRisk}
              onChange={(e) => handleInputChange('exposedRisk', e.target.value)}
              placeholder="Ex: C-inorganique, Hydrocarbures"
            />
            <InfoField 
              label="Personnel exposé" 
              value={medicalData.exposedStaff} 
              type="number"
              onChange={(e) => handleInputChange('exposedStaff', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Personnel examiné" 
              value={medicalData.exposedExamined} 
              type="number"
              onChange={(e) => handleInputChange('exposedExamined', parseInt(e.target.value) || 0)}
            />
            <InfoField 
              label="Nombre visites" 
              value={medicalData.exposedVisits} 
              type="number"
              onChange={(e) => handleInputChange('exposedVisits', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField 
              label="Taux couverture (%)" 
              value={medicalData.exposedCoverage} 
              type="number"
              onChange={(e) => handleInputChange('exposedCoverage', parseInt(e.target.value) || 0)}
            />
            <InfoTextareaField 
              label="Notes" 
              value={medicalData.exposedNotes}
              onChange={(e) => handleInputChange('exposedNotes', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const RapportPage = () => {
  const [activeTab, setActiveTab] = useState('clinical-activities');

  const tabsConfig = [
    { value: 'clinical-activities', label: 'Activités Cliniques' },
    { value: 'training', label: 'Formation' },
    { value: 'medical-conclusions', label: 'Conclusions Médicales' },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Rapport médical sauvegardé avec succès!');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert

('Exportation du rapport médical!');
  };

  return (
    <AppLayout title="Rapport Médical">
      <div className="p-4 md:p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {tabsConfig.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="clinical-activities" className="mt-4">
            <ClinicalActivities />
          </TabsContent>

          <TabsContent value="training" className="mt-4">
            <Training />
          </TabsContent>

          <TabsContent value="medical-conclusions" className="mt-4">
            <MedicalConclusions />
          </TabsContent>
        </Tabs>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button onClick={handleSave}>Sauvegarder</Button>
            <Button variant="outline" onClick={handleExport}>Exporter</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RapportPage;