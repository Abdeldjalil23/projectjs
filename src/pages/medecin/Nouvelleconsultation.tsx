// src/pages/medecin/Nouvelleconsultation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import type { OrdonnanceData, OrientationData, SoinsData, EvacData, ExplorationData, ImagerieData, ServiceType, ConsultationData } from './consultation/types';
import { SERVICE_TYPES, printStyles } from './consultation/constants';
import OrdonnanceSection from './consultation/OrdonnanceSection';
import ConsultationSection from './consultation/ConsultationSection';
import OrientationSection from './consultation/OrientationSection';
import SoinsSection from './consultation/SoinsSection';
import EvacuationSection from './consultation/EvacuationSection';
import AnalyseSection from './consultation/AnalyseSection';
import ImagerieSection from './consultation/ImagerieSection';

const NouvelleConsultation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState<OrdonnanceData>({ nom: '', prenoms: '', age: '', date: '', medicaments: '' });
  const today = new Date().toISOString().slice(0, 10);
  const [orientationData, setOrientationData] = useState<OrientationData>({ nom: '', prenom: '', age: '', nature: [], avis: '', destinataire: '', date: today });
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [soinsData, setSoinsData] = useState<SoinsData>({
    emisLe: today,
    docteur: '',
    nom: '',
    dateAccident: '',
    service: '',
    compagnie: '',
    choix: '1',
    arretJours: '',
    arretDu: '',
    arretAu: '',
    prolongationJours: '',
    prolongationDu: '',
    prolongationAu: '',
    repriseDate: '',
    admissionLieu: '',
    exemplaires: '',
    signature: ''
  });
  const [soinsOpen, setSoinsOpen] = useState(false);
  const [evacData, setEvacData] = useState<EvacData>({
    date: today,
    nom: '',
    prenom: '',
    fonction: '',
    structure: '',
    domicile: '',
    hopital: '',
    specialiste: '',
    delai: '',
    maladie: false,
    accident: false,
    autres: '',
    transport: { avion: false, ambulance: false, sh: false, propres: false },
    inf: '',
    assistant: ''
  });
  const [evacOpen, setEvacOpen] = useState(false);
  const [explorationData, setExplorationData] = useState<ExplorationData>({
    nom: '',
    prenom: '',
    age: '',
    date: today,
    analyseType: '',
    tests: [],
    commentaires: ''
  });
  const [explorationOpen, setExplorationOpen] = useState(false);
  const [imagerieData, setImagerieData] = useState<ImagerieData>({
    nom: '',
    prenom: '',
    age: '',
    date: today,
    imagerieType: '',
    examens: [],
    region: '',
    indication: '',
    commentaires: ''
  });
  const [imagerieOpen, setImagerieOpen] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    consultationNumber: '',
    visitNumber: '',
    date: today,
    doctor: '',
    specialty: '',
    natureConsultation: '',
    diagnostic: '',
    workStoppageDays: ''
  });
  const [consultationOpen, setConsultationOpen] = useState(false);

  // Patient data - similar to DossierDetailsPage
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

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDemander = (type: ServiceType) => {
    if (type.title === 'Diagnostic') {
      setConsultationOpen(true);
      setSelectedType(type);
      return;
    }
    if (type.title === 'Orientation') {
      setOrientationOpen(true);
      setSelectedType(type);
      return;
    }
    if (type.title === 'Soins') {
      setSoinsOpen(true);
      setSelectedType(type);
      return;
    }
    if (type.title === 'Evacuation') {
      setEvacOpen(true);
      setSelectedType(type);
      return;
    }
    if (type.title === 'ANALYSE') {
      setExplorationOpen(true);
      setSelectedType(type);
      return;
    }
    if (type.title === 'Imagerie') {
      setImagerieOpen(true);
      setSelectedType(type);
      return;
    }
    setSelectedType(type);
    setOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrientationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setOrientationData((prev) => {
        const newNature = checked
          ? [...prev.nature, value]
          : prev.nature.filter((n) => n !== value);
        return { ...prev, nature: newNature };
      });
    } else {
      setOrientationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSoinsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSoinsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvacInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('transport.')) {
      const key = name.split('.')[1] as keyof EvacData['transport'];
      setEvacData((prev) => ({ ...prev, transport: { ...prev.transport, [key]: checked } }));
    } else if (type === 'checkbox') {
      setEvacData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEvacData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleExplorationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setExplorationData((prev) => {
        const newTests = checked
          ? [...prev.tests, value]
          : prev.tests.filter((t) => t !== value);
        return { ...prev, tests: newTests };
      });
    } else if (name === 'analyseType') {
      setExplorationData((prev) => ({ ...prev, analyseType: value as 'interne' | 'externe', tests: [] }));
    } else {
      setExplorationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImagerieInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setImagerieData((prev) => {
        const newExamens = checked
          ? [...prev.examens, value]
          : prev.examens.filter((e) => e !== value);
        return { ...prev, examens: newExamens };
      });
    } else if (name === 'imagerieType') {
      setImagerieData((prev) => ({
        ...prev,
        imagerieType: value as ImagerieData['imagerieType'],
        examens: [],
      }));
    } else {
      setImagerieData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConsultationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!consultationData.date || !consultationData.doctor) {
      toast.error("يرجى ملء التاريخ واسم الطبيب على الأقل");
      return;
    }

    setConsultationOpen(false);
  };

  return (
    <AppLayout title="Nouvelle Consultation">
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
                {/* {patientData.chronique && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Chronique
                  </span>
                )} */}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="lg" className="gap-2 px-8 py-3 rounded-full shadow" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" /> Retour
          </Button>
        </div>

        {/* Service Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Choisissez le type de service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1">
          {SERVICE_TYPES.map((type) => (
            <Card key={type.title} className="flex flex-col items-center p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              {type.icon}
              <div className="font-bold text-lg mb-1">{type.title}</div>
              <div className="text-muted-foreground mb-4 text-sm">{type.desc}</div>
              <Button variant="outline" onClick={() => handleDemander(type)}>{type.action}</Button>
            </Card>
          ))}
        </div>
        </div>

        <OrdonnanceSection open={open} setOpen={setOpen} selectedType={selectedType} formData={formData} handleInputChange={handleInputChange} />
        <ConsultationSection consultationOpen={consultationOpen} setConsultationOpen={setConsultationOpen} consultationData={consultationData} handleConsultationInput={handleConsultationInput} handleSave={handleSave} />
        <OrientationSection orientationOpen={orientationOpen} setOrientationOpen={setOrientationOpen} orientationData={orientationData} handleOrientationInput={handleOrientationInput} />
        <SoinsSection soinsOpen={soinsOpen} setSoinsOpen={setSoinsOpen} soinsData={soinsData} handleSoinsInput={handleSoinsInput} />
        <EvacuationSection evacOpen={evacOpen} setEvacOpen={setEvacOpen} evacData={evacData} handleEvacInput={handleEvacInput} />
        <AnalyseSection explorationOpen={explorationOpen} setExplorationOpen={setExplorationOpen} explorationData={explorationData} handleExplorationInput={handleExplorationInput} />
        <ImagerieSection imagerieOpen={imagerieOpen} setImagerieOpen={setImagerieOpen} imagerieData={imagerieData} handleImagerieInput={handleImagerieInput} />
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;