// src/pages/NouvelleConsultation.tsx
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Stethoscope, Pill, Navigation, Microscope, Image, Ambulance, HeartPulse, ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Printer } from "lucide-react"

// TypeScript interfaces for state
interface FormData {
  nom: string;
  prenoms: string;
  age: string;
  date: string;
  medicaments: string;
}

interface OrientationData {
  nom: string;
  prenom: string;
  age: string;
  nature: string[];
  avis: string;
  destinataire: string;
  date: string;
}

interface SoinsData {
  emisLe: string;
  docteur: string;
  nom: string;
  dateAccident: string;
  service: string;
  compagnie: string;
  choix: string;
  arretJours: string;
  arretDu: string;
  arretAu: string;
  prolongationJours: string;
  prolongationDu: string;
  prolongationAu: string;
  repriseDate: string;
  admissionLieu: string;
  exemplaires: string;
  signature: string;
}

interface EvacData {
  date: string;
  nom: string;
  prenom: string;
  fonction: string;
  structure: string;
  domicile: string;
  hopital: string;
  specialiste: string;
  delai: string;
  maladie: boolean;
  accident: boolean;
  autres: string;
  transport: {
    avion: boolean;
    ambulance: boolean;
    sh: boolean;
    propres: boolean;
  };
  inf: string;
  assistant: string;
}

interface ExplorationData {
  nom: string;
  prenom: string;
  age: string;
  date: string;
  analyseType: 'interne' | 'externe' | '';
  tests: string[];
  commentaires: string;
}

interface ImagerieData {
  nom: string;
  prenom: string;
  age: string;
  date: string;
  imagerieType: 'radiographie' | 'echographie' | 'scanner' | 'irm' | 'autres' | '';
  examens: string[];
  region: string;
  indication: string;
  commentaires: string;
}

interface ServiceType {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
}

interface ConsultationData {
  consultationNumber: string;
  visitNumber: string;
  date: string;
  doctor: string;
  specialty: string;
  natureConsultation: string;
  diagnostic: string;
  workStoppageDays: string;
}

const printStyles = `
@media print {
  @page {
    size: A5 portrait;
    margin: 0.5cm;
  }

  body * {
    visibility: hidden;
  }

  .print-area, .print-area * {
    visibility: visible;
  }

  .print-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 9999;
    display: flex !important;
    justify-content: center;
    align-items: flex-start;
    padding: 0;
  }

  .print-area > div {
    width: 14.8cm;
    height: 20cm;
    box-shadow: none;
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  .dialog-print-hide {
    display: none !important;
  }
}
`;

const types: ServiceType[] = [
  { icon: <Stethoscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Diagnostic', desc: 'مقابلة مع الطبيب العام', action: 'Demander' },
  { icon: <Pill className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Ordonnance', desc: 'طلب وصفة طبية', action: 'Demander' },
  { icon: <Navigation className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Orientation', desc: 'إحالة أو توجيه لطبيب مختص', action: 'Demander' },
  { icon: <Microscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'ANALYSE', desc: 'طلب تحاليل أو فحوصات مخبرية', action: 'Demander' },
  { icon: <Image className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Imagerie', desc: 'طلب تصوير (أشعة، IRM…)', action: 'Demander' },
  { icon: <Ambulance className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Evacuation', desc: 'إخلاء أو نقل طبي', action: 'Demander' },
  { icon: <HeartPulse className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Soins', desc: 'رعاية تمريضية أو متابعة', action: 'Demander' }
];

const testOptions = {
  interne: [
  "Hémogramme complet", "Glycémie à jeun", "Cholestérol total", "HDL Cholestérol", "LDL Cholestérol", "Triglycérides",
  "Créatinine", "Urée", "Acide urique", "Bilan hépatique (ASAT, ALAT)", "Gamma GT", "Phosphatases alcalines",
  "Ionogramme sanguin", "Calcium total", "Phosphore", "Ferritine", "VS (Vitesse de sédimentation)", "CRP (Protéine C réactive)",
  "TP, TCA (Bilan de coagulation)", "Groupage sanguin", "Sérologie VIH", "Sérologie Hépatite B", "Sérologie Hépatite C",
  "Bilan lipidique complet", "TSH (Thyroïde)", "FT3 - FT4", "ECBU (Examen d'urines)", "Coproculture", "Bilan inflammatoire",
  "Test de grossesse (Beta HCG)", "Test rapide Covid-19", "Sérologie Covid-19", "Hémoculture", "Glycémie postprandiale",
  "Microalbuminurie", "Protéinurie"
  ],
  externe: [
    "IRM Cérébrale", "Scanner Thoracique", "Échographie Abdominale", "Échographie Cardiaque", "Échographie Doppler",
    "Radiographie Thorax", "Radiographie Rachis", "Radiographie Membres", "Mammographie", "Densitométrie Osseuse",
    "Fibroscopie Gastrique", "Coloscopie", "Bronchoscopie", "Cystoscopie", "Électrocardiogramme", "Électroencéphalogramme",
    "Électromyogramme", "Test d'effort", "Échographie Obstétricale", "Échographie Pelvienne", "Échographie Thyroïdienne",
    "Échographie Testiculaire", "Échographie Rénale", "Échographie Hépatique", "Échographie Vésiculaire",
    "Scanner Cérébral", "Scanner Abdominal", "Scanner Thoracique", "Scanner Rachidien", "Scanner Sinus",
    "IRM Rachidienne", "IRM Abdominale", "IRM Cardiaque", "IRM Articulaire", "Angiographie", "Coronarographie"
  ]
};

const imagerieOptions = {
  radiographie: [
    "Radiographie Thorax", "Radiographie Rachis Cervical", "Radiographie Rachis Dorsal", "Radiographie Rachis Lombaire",
    "Radiographie Bassin", "Radiographie Crâne", "Radiographie Sinus", "Radiographie Mâchoire", "Radiographie Dents",
    "Radiographie Membre Supérieur", "Radiographie Membre Inférieur", "Radiographie Épaules", "Radiographie Genoux",
    "Radiographie Cheville", "Radiographie Pied", "Radiographie Main", "Radiographie Poignet", "Radiographie Coude",
    "Radiographie Hanche", "Radiographie Colonne Vertébrale", "Radiographie Côtes", "Radiographie Sternum"
  ],
  echographie: [
    "Échographie Abdominale", "Échographie Pelvienne", "Échographie Obstétricale", "Échographie Cardiaque",
    "Échographie Thyroïdienne", "Échographie Mammaire", "Échographie Testiculaire", "Échographie Rénale",
    "Échographie Hépatique", "Échographie Vésiculaire", "Échographie Pancréatique", "Échographie Rate",
    "Échographie Doppler Artériel", "Échographie Doppler Veineux", "Échographie Doppler Cardiaque",
    "Échographie Articulaire", "Échographie Tendons", "Échographie Musculaire", "Échographie Ganglions",
    "Échographie Prostate", "Échographie Utérus", "Échographie Ovaire"
  ],
  scanner: [
    "Scanner Cérébral", "Scanner Thoracique", "Scanner Abdominal", "Scanner Pelvien", "Scanner Rachidien",
    "Scanner Sinus", "Scanner Orbite", "Scanner Mâchoire", "Scanner Cou", "Scanner Épaules", "Scanner Genoux",
    "Scanner Hanche", "Scanner Bassin", "Scanner Membres", "Scanner Angiographie", "Scanner Cardiaque",
    "Scanner Pulmonaire", "Scanner Hépatique", "Scanner Rénal", "Scanner Pancréatique", "Scanner Splénique"
  ],
  irm: [
    "IRM Cérébrale", "IRM Rachidienne", "IRM Thoracique", "IRM Abdominale", "IRM Pelvienne", "IRM Cardiaque",
    "IRM Articulaire", "IRM Membre Supérieur", "IRM Membre Inférieur", "IRM Épaules", "IRM Genoux", "IRM Hanche",
    "IRM Bassin", "IRM Crâne", "IRM Sinus", "IRM Orbite", "IRM Mâchoire", "IRM Cou", "IRM Colonne Vertébrale",
    "IRM Angiographie", "IRM Spectroscopie", "IRM Diffusion", "IRM Perfusion"
  ],
  autres: [
    "Mammographie", "Densitométrie Osseuse", "Scintigraphie", "Tomographie par Émission de Positons (TEP)",
    "Angiographie", "Coronarographie", "Arthrographie", "Myélographie", "Cystographie", "Urographie",
    "Cholangiographie", "Sialographie", "Hystérosalpingographie", "Électrocardiogramme", "Électroencéphalogramme",
    "Électromyogramme", "Test d'effort", "Holter ECG", "Holter Tension", "Échographie de Stress"
  ]
};

const natureOptions: string[] = [
  'Visite périodique',
  'Urgence médicochirurgicale',
  'Visite spécifique',
  'Visite d\'embauche',
  'Visite de soins'
];

const NouvelleConsultation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState<FormData>({ nom: '', prenoms: '', age: '', date: '', medicaments: '' });
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

  const handlePrint = () => {
    window.print();
  };

const handleSave = () => {
  if (!consultationData.date || !consultationData.doctor) {
    alert("يرجى ملء التاريخ واسم الطبيب على الأقل");
    return;
  }

  console.log("البيانات المحفوظة:", consultationData);

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
          {types.map((type) => (
            <Card key={type.title} className="flex flex-col items-center p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              {type.icon}
              <div className="font-bold text-lg mb-1">{type.title}</div>
              <div className="text-muted-foreground mb-4 text-sm">{type.desc}</div>
              <Button variant="outline" onClick={() => handleDemander(type)}>{type.action}</Button>
            </Card>
          ))}
        </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="dialog-print-hide sm:max-w-[520px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-3 border-b">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {selectedType?.title === 'Ordonnance' ? 'Ordonnance Médicale' : 'Demande de service'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Formulaire d'ordonnance médicale
              </DialogDescription>
            </DialogHeader>

            {selectedType?.title === 'Ordonnance' && (
              <div className="px-4 py-4 space-y-4">
                {/* Header with icon + title */}
                <div className="flex items-center gap-2.5 pb-3 border-b">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    {selectedType.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{selectedType.title}</h3>
                    <p className="text-xs text-muted-foreground">{selectedType.desc}</p>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Informations Patient
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="nom" className="text-xs">Nom</Label>
                      <Input
                        id="nom"
                        name="nom"
                        placeholder="Nom de famille"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="prenoms" className="text-xs">Prénom(s)</Label>
                      <Input
                        id="prenoms"
                        name="prenoms"
                        placeholder="Prénom(s)"
                        value={formData.prenoms}
                        onChange={handleInputChange}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="age" className="text-xs">Âge</Label>
                      <Input
                        id="age"
                        name="age"
                        placeholder="Ex: 34 ans"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="date" className="text-xs">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Médicaments */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Prescription
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      Médicament • Posologie • Durée
                    </span>
                  </div>

                  <Textarea
                    name="medicaments"
                    rows={6}
                    placeholder={`Exemple :
        1. Amoxicilline 500mg - 1 comprimé 3x/jour - 7 jours
        2. Paracétamol 1000mg - 1 comprimé si douleur - max 3/jour
        3. ...`}
                    value={formData.medicaments}
                    onChange={handleInputChange}
                    className="resize-none font-mono text-sm leading-relaxed min-h-[120px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <DialogClose asChild>
                    <Button variant="ghost" size="sm">Fermer</Button>
                  </DialogClose>

                  <Button onClick={handlePrint} size="sm" className="gap-2">
                    <Printer className="h-3.5 w-3.5" />
                    Imprimer l'ordonnance
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========== PRINT AREA FOR ORDONNANCE ========== */}
        {open && selectedType?.title === 'Ordonnance' && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-6" style={{ width: '13.8cm', height: '20cm' }}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-black text-white font-bold text-xs px-1.5 py-0.5 rounded">S</span>
                    <span className="font-bold tracking-tight">sonatrach</span>
                  </div>
                  <div className="font-semibold">Direction Régionale Haoud Berkaoui</div>
                  <div>Centre de Médecine de Travail</div>
                  <div className="mt-2">Nom du Médecin</div>
                  <div className="text-muted-foreground text-xs">(Cachet)</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-base underline underline-offset-2 mb-1">ORDONNANCE MÉDICALE</div>
                  <div className="text-xs text-gray-600">وصفة طبية</div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[60px]">Nom :</span>
                  <span className="border-b border-black flex-1 px-1">{formData.nom || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Prénom :</span>
                  <span className="border-b border-black flex-1 px-1">{formData.prenoms || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[60px]">Âge :</span>
                  <span className="border-b border-black flex-1 px-1">{formData.age || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Date :</span>
                  <span className="border-b border-black flex-1 px-1">{formData.date || '—'}</span>
                </div>
              </div>

              {/* Médicaments */}
              <div className="mb-2">
                <div className="font-semibold text-sm mb-1">Prescription :</div>
                <div className="border border-black rounded p-3 min-h-[280px] text-sm leading-relaxed whitespace-pre-wrap">
                  {formData.medicaments || 'Aucune prescription renseignée'}
                </div>
              </div>

              {/* Footer / Signature */}
              <div className="flex justify-end mt-10">
                <div className="text-center">
                  <div className="font-bold text-sm mb-8">LE MÉDECIN</div>
                  <div className="border-t border-black w-40 pt-1 text-xs">Cachet & Signature</div>
                </div>
              </div>

            </div>
          </div>
        )}

        <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
          <DialogContent className="dialog-print-hide max-w-lg p-0 gap-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 pt-4 pb-3 border-b">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 2v2" />
                      <path d="M5 2v2" />
                      <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V5a2 2 0 0 0-2-2h-1" />
                      <path d="M8 15a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6" />
                      <circle cx="20" cy="12" r="2" />
                    </svg>
                  </span>
                  CONSULTATION MÉDICALE
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  مقابلة مع الطبيب العام
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Section: Informations de base */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Informations de base
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">
                      Numéro de Consultation
                    </label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="consultationNumber"
                      placeholder="Ex: CONS-2024-001"
                      value={consultationData.consultationNumber}
                      onChange={handleConsultationInput}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">
                      Numéro de Visite
                    </label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="visitNumber"
                      placeholder="Ex: VIS-001"
                      value={consultationData.visitNumber}
                      onChange={handleConsultationInput}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">Date</label>
                    <input
                      type="date"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="date"
                      value={consultationData.date}
                      onChange={handleConsultationInput}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">Médecin</label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="doctor"
                      placeholder="Nom du médecin"
                      value={consultationData.doctor}
                      onChange={handleConsultationInput}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">Spécialité</label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="specialty"
                      placeholder="Médecine générale..."
                      value={consultationData.specialty}
                      onChange={handleConsultationInput}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium leading-none">
                      Nature de Consultation
                    </label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      name="natureConsultation"
                      placeholder="Première visite, Suivi..."
                      value={consultationData.natureConsultation}
                      onChange={handleConsultationInput}
                    />
                  </div>
                </div>
              </section>

              {/* Section: Diagnostic */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Diagnostic
                </h3>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
                  name="diagnostic"
                  rows={3}
                  placeholder="Décrivez le diagnostic médical..."
                  value={consultationData.diagnostic}
                  onChange={handleConsultationInput}
                />
              </section>

              {/* Section: Arrêt de travail */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Arrêt de travail
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    className="flex h-9 w-24 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="workStoppageDays"
                    placeholder="0"
                    value={consultationData.workStoppageDays}
                    onChange={handleConsultationInput}
                  />
                  <span className="text-xs text-muted-foreground">jours d’arrêt</span>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Signature
                </span>
                <span className="text-sm font-semibold">LE MÉDECIN</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConsultationOpen(false)}
                  className="min-w-[80px]"
                >
                  Fermer
                </Button>
                <Button size="sm" onClick={handleSave} className="min-w-[95px]">
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {consultationOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
              <div className="flex flex-row justify-between items-start mb-8 w-full">
                <div className="flex flex-col items-start gap-1 text-xs min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-black text-white font-bold text-xs px-2 py-1 rounded">S</span>
                    <span className="font-bold text-xs tracking-tight">sonatrach</span>
                  </div>
                  <div className="font-semibold">Direction Régionale Haoud Berkaoui</div>
                  <div>Centre de Médecine de Travail</div>
                  <div className="mt-2">Nom du Médecin</div>
                  <div className="text-muted-foreground">(Cachet)</div>
                </div>
                <div className="flex flex-col items-end gap-1 w-[340px]">
                  <div className="font-bold text-base mb-2 underline underline-offset-2">CONSULTATION MÉDICALE</div>
                  <div className="flex flex-col gap-2 w-full text-xs">
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Numéro Consultation :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.consultationNumber}</div>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Numéro Visite :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.visitNumber}</div>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Date :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.date}</div>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Médecin :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.doctor}</div>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Spécialité :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.specialty}</div>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      <div className="font-semibold min-w-[100px]">Nature Consultation :</div>
                      <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.natureConsultation}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center my-8 w-full">
                <div className="tracking-[0.4em] font-bold text-lg mb-1">DIAGNOSTIC</div>
                <div className="w-40 border-b-2 border-black mb-2"></div>
              </div>
              <div className="w-full mb-6">
                <div className="font-semibold mb-2">Diagnostic :</div>
                <div className="border border-black p-4 min-h-[100px] text-sm">
                  {consultationData.diagnostic}
                </div>
              </div>
              <div className="w-full mb-6">
                <div className="font-semibold mb-2">Nombre de Jours - Arrêt de Travail :</div>
                <div className="flex items-center gap-2">
                  <div className="border-b border-black px-2 py-1 min-w-[100px] text-center">{consultationData.workStoppageDays}</div>
                  <span className="text-sm">jours</span>
                </div>
              </div>
            </div>
          </div>
        )}

<Dialog open={orientationOpen} onOpenChange={setOrientationOpen}>
  <DialogContent className="dialog-print-hide max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-center text-xl font-bold tracking-wide">
        LETTRE D'ORIENTATION
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6 text-sm">
      {/* En-tête officiel */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="space-y-0.5 text-xs leading-tight">
          <div className="font-bold uppercase">Entreprise Nationale Sonatrach</div>
          <div>Exploration – Production</div>
          <div>Division Production</div>
          <div>Direction Régionale HBK</div>
          <div>C.M.S</div>
        </div>

        {/* Logo placeholder */}
        <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded flex items-center justify-center font-bold text-xl text-gray-500">
          S
        </div>
      </div>

      {/* Informations patient */}
      <div>
        <h3 className="font-semibold mb-3 text-base border-b pb-1">
          Informations du patient
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <label className="w-16 shrink-0 font-medium">Nom :</label>
            <input
              name="nom"
              value={orientationData.nom}
              onChange={handleOrientationInput}
              placeholder="Nom"
              className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-16 shrink-0 font-medium">Prénom :</label>
            <input
              name="prenom"
              value={orientationData.prenom}
              onChange={handleOrientationInput}
              placeholder="Prénom"
              className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-16 shrink-0 font-medium">Âge :</label>
            <input
              name="age"
              type="number"
              min={0}
              value={orientationData.age}
              onChange={handleOrientationInput}
              placeholder="Âge"
              className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Nature de visite */}
      <div>
        <h3 className="font-semibold mb-3 text-base border-b pb-1">
          Nature de visite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {natureOptions.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
            >
              <input
                type="checkbox"
                name="nature"
                value={opt}
                checked={orientationData.nature.includes(opt)}
                onChange={handleOrientationInput}
                className="w-4 h-4"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span>Le/La susnommé(e) nécessite un avis / consultation en</span>
          <input
            name="avis"
            value={orientationData.avis}
            onChange={handleOrientationInput}
            placeholder="spécialité"
            className="border-b border-gray-400 bg-transparent py-1 w-48 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Le docteur destinataire :</span>
          <input
            name="destinataire"
            value={orientationData.destinataire}
            onChange={handleOrientationInput}
            placeholder="Nom du docteur"
            className="border-b border-gray-400 bg-transparent py-1 w-48 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Date :</span>
          <input
            type="date"
            name="date"
            value={orientationData.date}
            onChange={handleOrientationInput}
            className="border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Signature + Actions */}
      <div className="flex items-center justify-between pt-5 border-t">
        <span className="font-bold text-base">LE MÉDECIN</span>

        <div className="flex gap-3">
          <Button onClick={handlePrint} className="min-w-[110px]">
            Imprimer
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="min-w-[110px]">
              Fermer
            </Button>
          </DialogClose>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
        {orientationOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
              <div className="flex flex-row justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-xs">ENTREPRISE NATIONALE SONATRACH</div>
                  <div className="text-xs">EXPLORATION - PRODUCTION</div>
                  <div className="text-xs">DIVISION PRODUCTION</div>
                  <div className="text-xs">DIRECTION REGIONAL HBK</div>
                  <div className="text-xs">C.M.S</div>
                </div>
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center font-bold text-lg">S</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2 mt-4">
                <div className="border-b border-black px-1 col-span-1 min-w-[120px]">{orientationData.nom}</div>
                <div className="border-b border-black px-1 col-span-1 min-w-[120px]">{orientationData.prenom}</div>
                <div className="border-b border-black px-1 col-span-1 min-w-[80px]">{orientationData.age}</div>
              </div>
              <div className="font-bold text-center my-4 text-lg">LETTRE D'ORIENTATION</div>
              <div className="mb-2">
                <div className="font-semibold mb-1">Nature de visite :</div>
                <div className="flex flex-col gap-1">
                  {natureOptions.map((opt) => (
                    <div key={opt} className="flex items-center gap-2 text-sm">
                      <span className="inline-block w-4 h-4 border border-black mr-2 align-middle">{orientationData.nature.includes(opt) ? '✔' : ''}</span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-2 mt-4">
                <span>Le/La susnommé(e) nécessite un avis / consultation en </span>
                <span className="border-b border-black px-1 min-w-[120px] inline-block">{orientationData.avis}</span>
              </div>
              <div className="mb-2 mt-2">
                <span>Le docteur destinataire : </span>
                <span className="border-b border-black px-1 min-w-[120px] inline-block">{orientationData.destinataire}</span>
              </div>
              <div className="flex justify-between mt-12">
                <span className="font-bold">LE MEDECIN</span>
                <span>HBK: Le <span className="border-b border-black px-1 min-w-[80px] inline-block">{orientationData.date}</span></span>
              </div>
            </div>
          </div>
        )}

        <Dialog open={soinsOpen} onOpenChange={setSoinsOpen}>
  <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-center text-xl font-bold tracking-wide">
        CERTIFICAT MÉDICAL DE SOINS
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6 text-sm">
      {/* En-tête + Type de certificat + Numéro */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-4">
        <div className="font-bold text-lg leading-tight">
          CERTIFICAT MÉDICAL DE
        </div>

        {/* Choix du type */}
        <div className="border border-black rounded-md p-3 space-y-1.5 min-w-[200px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="choix"
              value="1"
              checked={soinsData.choix === "1"}
              onChange={handleSoinsInput}
              className="w-4 h-4"
            />
            1 - Arrêt de travail
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="choix"
              value="2"
              checked={soinsData.choix === "2"}
              onChange={handleSoinsInput}
              className="w-4 h-4"
            />
            2 - Prolongation
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="choix"
              value="3"
              checked={soinsData.choix === "3"}
              onChange={handleSoinsInput}
              className="w-4 h-4"
            />
            3 - Reprise de travail
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="choix"
              value="4"
              checked={soinsData.choix === "4"}
              onChange={handleSoinsInput}
              className="w-4 h-4"
            />
            4 - Hospitalisation
          </label>
        </div>

        {/* Numéro */}
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
          <span>N°</span>
          <input
            name="signature"
            value={soinsData.signature}
            onChange={handleSoinsInput}
            placeholder="Numéro"
            className="border-b-2 border-red-600 bg-transparent w-24 text-center focus:outline-none"
          />
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Émis le :</label>
          <input
            type="date"
            name="emisLe"
            value={soinsData.emisLe}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Par le docteur :</label>
          <input
            name="docteur"
            value={soinsData.docteur}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Nom du patient :</label>
          <input
            name="nom"
            value={soinsData.nom}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Date accident / maladie :</label>
          <input
            type="date"
            name="dateAccident"
            value={soinsData.dateAccident}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Service Employeur :</label>
          <input
            name="service"
            value={soinsData.service}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 font-medium">Compagnie :</label>
          <input
            name="compagnie"
            value={soinsData.compagnie}
            onChange={handleSoinsInput}
            className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Texte de certification */}
      <div className="font-medium leading-relaxed border-t pt-4">
        Je soussigné, Docteur en Médecine, certifie que l'état de santé du
        susnommé justifie :
      </div>

      {/* Contenu dynamique selon le choix */}
      <div className="border border-black rounded-md p-5 bg-gray-50/50 min-h-[80px]">
        {soinsData.choix === "1" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="font-bold text-base">1.</span>
            <span>Traitement avec arrêt de travail de</span>
            <input
              name="arretJours"
              value={soinsData.arretJours}
              onChange={handleSoinsInput}
              className="border-b border-black w-14 text-center bg-transparent focus:outline-none"
              placeholder="__"
            />
            <span>jours, sauf complications, du</span>
            <input
              type="date"
              name="arretDu"
              value={soinsData.arretDu}
              onChange={handleSoinsInput}
              className="border-b border-black bg-transparent focus:outline-none"
            />
            <span>au</span>
            <input
              type="date"
              name="arretAu"
              value={soinsData.arretAu}
              onChange={handleSoinsInput}
              className="border-b border-black bg-transparent focus:outline-none"
            />
          </div>
        )}

        {soinsData.choix === "2" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="font-bold text-base">2.</span>
            <span>Prolongation d'arrêt de travail de</span>
            <input
              name="prolongationJours"
              value={soinsData.prolongationJours}
              onChange={handleSoinsInput}
              className="border-b border-black w-14 text-center bg-transparent focus:outline-none"
              placeholder="__"
            />
            <span>jours, sauf complications, du</span>
            <input
              type="date"
              name="prolongationDu"
              value={soinsData.prolongationDu}
              onChange={handleSoinsInput}
              className="border-b border-black bg-transparent focus:outline-none"
            />
            <span>au</span>
            <input
              type="date"
              name="prolongationAu"
              value={soinsData.prolongationAu}
              onChange={handleSoinsInput}
              className="border-b border-black bg-transparent focus:outline-none"
            />
          </div>
        )}

        {soinsData.choix === "3" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="font-bold text-base">3.</span>
            <span>Reprise de travail à dater du</span>
            <input
              type="date"
              name="repriseDate"
              value={soinsData.repriseDate}
              onChange={handleSoinsInput}
              className="border-b border-black bg-transparent focus:outline-none"
            />
          </div>
        )}

        {soinsData.choix === "4" && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="font-bold text-base">4.</span>
            <span>Admission ou transport d'urgence à l'hôpital ou à la clinique de</span>
            <input
              name="admissionLieu"
              value={soinsData.admissionLieu}
              onChange={handleSoinsInput}
              className="border-b border-black w-48 bg-transparent focus:outline-none"
              placeholder="Nom de l'établissement"
            />
          </div>
        )}

        {!soinsData.choix && (
          <div className="text-gray-400 italic text-center py-2">
            Veuillez sélectionner un type de certificat ci-dessus
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t">
        <div className="text-center">
          <div className="font-medium mb-8">Cachet du Médecin</div>
          <div className="border-t border-dashed border-gray-400 w-32 mx-auto"></div>
        </div>

        <div className="text-center">
          <div className="mb-2">Ces exemplaires doivent être remis à :</div>
          <input
            name="exemplaires"
            value={soinsData.exemplaires}
            onChange={handleSoinsInput}
            className="border-b border-gray-400 bg-transparent w-full text-center focus:outline-none"
            placeholder="..."
          />
        </div>

        <div className="text-center">
          <div className="font-medium mb-8">Signature du Médecin</div>
          <div className="border-t border-dashed border-gray-400 w-32 mx-auto"></div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={handlePrint} className="min-w-[110px]">
          Imprimer
        </Button>
        <DialogClose asChild>
          <Button variant="outline" className="min-w-[110px]">
            Fermer
          </Button>
        </DialogClose>
      </div>
    </div>
  </DialogContent>
</Dialog>
        {soinsOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
              <div className="flex flex-row justify-between items-center mb-2">
                <div className="font-bold text-lg">CERTIFICAT MEDICAL DE</div>
                <div className="flex flex-col text-xs border border-black p-2">
                  <div>1 Arrêt de travail</div>
                  <div>2 Prolongation</div>
                  <div>3 Reprise de travail</div>
                  <div>4 Hospitalisation</div>
                </div>
                <div className="text-red-600 font-bold text-lg ml-4">N° <span className="border-b border-black w-20 inline-block">{soinsData.signature}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>Emis le : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.emisLe}</span></div>
                <div>Par le docteur : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.docteur}</span></div>
                <div>Nom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.nom}</span></div>
                <div>Date accident ou maladie : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.dateAccident}</span></div>
                <div>Service Employeur : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.service}</span></div>
                <div>Compagnie : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.compagnie}</span></div>
              </div>
              <div className="font-bold my-2">Je soussigné, Docteur en Médecine, Certifie que l'état de santé du susnommé justifie :</div>
              <div className="border border-black p-4 mb-2 flex flex-col gap-3">
                {soinsData.choix === '1' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">1</span> Traitement avec arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.arretJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretAu}</span>
                  </div>
                )}
                {soinsData.choix === '2' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">2</span> Prolongation d'arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.prolongationJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationAu}</span>
                  </div>
                )}
                {soinsData.choix === '3' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">3</span> Reprise de travail à dater du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.repriseDate}</span>
                  </div>
                )}
                {soinsData.choix === '4' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">4</span> Admission ou transport d'urgence à l'hôpital ou à la clinique de <span className="border-b border-black px-1 min-w-[120px] inline-block">{soinsData.admissionLieu}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-row justify-between mt-4 text-xs">
                <div>Cachet du Médecin</div>
                <div>Ces exemplaires doivent être remis à : <span className="border-b border-black px-1 min-w-[120px] inline-block">{soinsData.exemplaires}</span></div>
                <div>Signature du Médecin</div>
              </div>
            </div>
          </div>
        )}

        <Dialog open={evacOpen} onOpenChange={setEvacOpen}>
          <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold tracking-wide">
                ÉVACUATION SANITAIRE
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-sm">
              {/* En-tête officiel */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="space-y-0.5 text-xs leading-tight">
                  <div className="font-bold uppercase">Sonatrach</div>
                  <div>Exploration – Production</div>
                  <div>Direction Régionale</div>
                  <div>Haoud Berkaoui</div>
                  <div>Division Personnel</div>
                  <div>Service Santé / CMT</div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span>Haoud Berkaoui, le :</span>
                  <input
                    type="date"
                    name="date"
                    value={evacData.date}
                    onChange={handleEvacInput}
                    className="border-b border-black bg-transparent px-1 focus:outline-none"
                  />
                </div>
              </div>

              {/* Informations du patient */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Informations du patient
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Nom :</label>
                    <input
                      name="nom"
                      value={evacData.nom}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Prénom :</label>
                    <input
                      name="prenom"
                      value={evacData.prenom}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Fonction :</label>
                    <input
                      name="fonction"
                      value={evacData.fonction}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Structure :</label>
                    <input
                      name="structure"
                      value={evacData.structure}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Doit être évacué
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <label className="w-36 shrink-0 font-medium">Son domicile :</label>
                    <input
                      name="domicile"
                      value={evacData.domicile}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-36 shrink-0 font-medium">Vers l'hôpital de :</label>
                    <input
                      name="hopital"
                      value={evacData.hopital}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-36 shrink-0 font-medium">Spécialiste en :</label>
                    <input
                      name="specialiste"
                      value={evacData.specialiste}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-36 shrink-0 font-medium">Délai :</label>
                    <input
                      name="delai"
                      value={evacData.delai}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Motif */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">Motif</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="maladie"
                      checked={evacData.maladie}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Maladie
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accident"
                      checked={evacData.accident}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Accident du Travail
                  </label>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="font-medium whitespace-nowrap">Autres à préciser :</span>
                    <input
                      name="autres"
                      value={evacData.autres}
                      onChange={handleEvacInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Moyens de transport */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Moyens de transport à utiliser
                </h3>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="transport.avion"
                      checked={evacData.transport?.avion}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Avion
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="transport.ambulance"
                      checked={evacData.transport?.ambulance}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Ambulance
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="transport.sh"
                      checked={evacData.transport?.sh}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Véhicule SH
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="transport.propres"
                      checked={evacData.transport?.propres}
                      onChange={handleEvacInput}
                      className="w-4 h-4"
                    />
                    Propres Moyens
                  </label>
                </div>
              </div>

              {/* Accompagnement */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Accompagné par
                </h3>
                <div className="flex flex-wrap gap-10">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">L'infirmier :</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="inf"
                        value="oui"
                        checked={evacData.inf === "oui"}
                        onChange={handleEvacInput}
                      />
                      Oui
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="inf"
                        value="non"
                        checked={evacData.inf === "non"}
                        onChange={handleEvacInput}
                      />
                      Non
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium">L'assistant(e) :</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assistant"
                        value="oui"
                        checked={evacData.assistant === "oui"}
                        onChange={handleEvacInput}
                      />
                      Oui
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assistant"
                        value="non"
                        checked={evacData.assistant === "non"}
                        onChange={handleEvacInput}
                      />
                      Non
                    </label>
                  </div>
                </div>
              </div>

              {/* Signature + Actions */}
              <div className="flex items-center justify-between pt-6 border-t mt-4">
                <div className="font-bold text-base">Le Médecin</div>

                <div className="flex gap-3">
                  <Button onClick={handlePrint} className="min-w-[110px]">
                    Imprimer
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="min-w-[110px]">
                      Fermer
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {evacOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
              <div className="flex flex-row justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-xs">sonatrach</div>
                  <div className="text-xs">EXPLORATION – PRODUCTION</div>
                  <div className="text-xs">DIRECTION REGIONAL</div>
                  <div className="text-xs">HAOUD BERKAOUI</div>
                  <div className="text-xs">DIVISION PERSONNEL</div>
                  <div className="text-xs">SERVICE SANTE/CMT</div>
                </div>
                <div className="text-xs">Haoud Berkaoui Le : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.date}</span></div>
              </div>
              <div className="text-center font-bold text-lg my-2 border-b border-black">EVACUATION SANITAIRE</div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>Nom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.nom}</span></div>
                <div>Prénom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.prenom}</span></div>
                <div>Fonction : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.fonction}</span></div>
                <div>Structure : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.structure}</span></div>
              </div>
              <div className="font-bold">Doit être évacué :</div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>Son domicile : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.domicile}</span></div>
                <div>vers l'hôpital de : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.hopital}</span></div>
                <div>Un spécialiste en : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.specialiste}</span></div>
                <div>Délai : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.delai}</span></div>
              </div>
              <div className="flex gap-4 items-center mb-2">
                <span className="flex items-center gap-1">Maladie <span className="border border-black w-4 h-4 inline-block text-center">{evacData.maladie ? '✔' : ''}</span></span>
                <span className="flex items-center gap-1">Accident du Travail <span className="border border-black w-4 h-4 inline-block text-center">{evacData.accident ? '✔' : ''}</span></span>
                <span>Autres à préciser : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.autres}</span></span>
              </div>
              <div className="font-bold">Moyens de transport à utiliser :</div>
              <div className="flex gap-4 items-center mb-2">
                <span className="flex items-center gap-1">Avion <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.avion ? '✔' : ''}</span></span>
                <span className="flex items-center gap-1">Ambulance <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.ambulance ? '✔' : ''}</span></span>
                <span className="flex items-center gap-1">Véhicule SH <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.sh ? '✔' : ''}</span></span>
                <span className="flex items-center gap-1">Propres Moyens <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.propres ? '✔' : ''}</span></span>
              </div>
              <div className="font-bold">Accompagné par :</div>
              <div className="flex gap-8 items-center mb-2">
                <span>L'infirmier : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf === 'oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf === 'non' ? '✔' : ''}</span></span>
                <span>L'assistant(e) : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant === 'oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant === 'non' ? '✔' : ''}</span></span>
              </div>
              <div className="text-end font-bold mt-4">Le Médecin</div>
            </div>
          </div>
        )}

        <Dialog open={explorationOpen} onOpenChange={setExplorationOpen}>
          <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold tracking-wide">
                DEMANDE D'ANALYSE MÉDICALE
              </DialogTitle>
              <DialogDescription className="text-center">
                طلب تحاليل أو فحوصات مخبرية
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 text-sm">
              {/* Informations patient */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Informations du patient / معلومات المريض
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Nom :</label>
                    <input
                      name="nom"
                      value={explorationData.nom}
                      onChange={handleExplorationInput}
                      placeholder="الاسم"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Prénom :</label>
                    <input
                      name="prenom"
                      value={explorationData.prenom}
                      onChange={handleExplorationInput}
                      placeholder="اللقب"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Âge :</label>
                    <input
                      name="age"
                      type="number"
                      min={0}
                      value={explorationData.age}
                      onChange={handleExplorationInput}
                      placeholder="العمر"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Date :</label>
                    <input
                      type="date"
                      name="date"
                      value={explorationData.date}
                      onChange={handleExplorationInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Type d'analyse */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Type d'analyse / نوع التحليل
                </h3>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="analyseType"
                      value="interne"
                      checked={explorationData.analyseType === "interne"}
                      onChange={handleExplorationInput}
                      className="w-4 h-4"
                    />
                    Analyse Interne / تحليل داخلي
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="analyseType"
                      value="externe"
                      checked={explorationData.analyseType === "externe"}
                      onChange={handleExplorationInput}
                      className="w-4 h-4"
                    />
                    Analyse Externe / تحليل خارجي
                  </label>
                </div>
              </div>

              {/* Liste des analyses */}
              {explorationData.analyseType && (
                <div>
                  <h3 className="font-semibold mb-3 text-base border-b pb-1">
                    {explorationData.analyseType === "interne"
                      ? "Analyses Internes / التحاليل الداخلية"
                      : "Analyses Externes / التحاليل الخارجية"}
                  </h3>

                  <div className="border rounded-md p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-[220px] overflow-y-auto pr-2">
                      {testOptions[explorationData.analyseType]?.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/60 rounded px-1 py-0.5"
                        >
                          <input
                            type="checkbox"
                            name="tests"
                            value={opt}
                            checked={explorationData.tests.includes(opt)}
                            onChange={handleExplorationInput}
                            className="w-4 h-4"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Commentaires */}
              <div>
                <h3 className="font-semibold mb-2 text-base border-b pb-1">
                  Commentaires / تعليقات
                </h3>
                <textarea
                  name="commentaires"
                  rows={4}
                  value={explorationData.commentaires}
                  onChange={handleExplorationInput}
                  placeholder="Commentaires supplémentaires / تعليقات إضافية..."
                  className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {/* Signature + Actions */}
              <div className="flex items-center justify-between pt-5 border-t">
                <span className="font-bold text-base">LE MÉDECIN / الطبيب</span>

                <div className="flex gap-3">
                  <Button onClick={handlePrint} className="min-w-[110px]">
                    Imprimer
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="min-w-[110px]">
                      Fermer
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {explorationOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-1" style={{ width: '13.8cm', height: '20cm', fontSize: '10px' }}>
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs min-w-[140px] space-y-0">
                  <div className="flex items-center gap-1 mb-0">
                    <span className="bg-black text-white font-bold text-xs px-1 py-0.5 rounded">S</span>
                    <span className="font-bold tracking-tight text-xs">sonatrach</span>
                  </div>
                  <div className="font-semibold text-xs">Direction Régionale Haoud Berkaoui</div>
                  <div className="text-xs">Centre de Médecine de Travail</div>
                  <div className="mt-0 text-xs">Nom du Médecin</div>
                  <div className="text-muted-foreground text-xs">(Cachet)</div>
                </div>

                <div className="text-xs w-[260px] space-y-0">
                  <div className="font-bold text-xs underline">DEMANDE D'ANALYSE MÉDICALE</div>
                  {["Nom", "Prénoms", "Age", "Date"].map((label) => (
                    <div key={label} className="flex items-center">
                      <div className="font-semibold min-w-[40px] text-xs">{label} :</div>
                      <div className="w-full text-xs font-normal px-1 border-b border-black min-h-[0.8em]">
                        {explorationData[label.toLowerCase()]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center my-2">
                <div className="tracking-[0.1em] font-bold text-xs mb-0">DEMANDE D'ANALYSE</div>
                <div className="w-20 border-b border-black mx-auto mb-0"></div>
              </div>

              <div className="text-xs">
                <div className="font-semibold mb-0">
                  Type d'analyse : {explorationData.analyseType === 'interne' ? 'Analyses Internes' : 'Analyses Externes'}
                </div>
                <div className="font-semibold mb-0">Analyses demandées :</div>
                <div className="grid grid-cols-2 gap-x-1 gap-y-0 text-xs leading-tight">
                  {explorationData.tests.map((test, i) => (
                    <div key={i} className="flex items-start">
                      <span className="mr-0.5 text-xs">•</span>
                      <span className="text-xs leading-tight">{test}</span>
                    </div>
                  ))}
                </div>

                {explorationData.commentaires && (
                  <div className="mt-0.5">
                    <div className="font-semibold text-xs">Commentaires :</div>
                    <div className="text-xs">{explorationData.commentaires}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <span className="font-bold text-xs">LE MÉDECIN</span>
              </div>
            </div>
          </div>
        )}

        <Dialog open={imagerieOpen} onOpenChange={setImagerieOpen}>
          <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold tracking-wide">
                DEMANDE D'IMAGERIE
              </DialogTitle>
              <DialogDescription className="text-center">
                طلب تصوير (أشعة، IRM…)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 text-sm">
              {/* Informations patient */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Informations du patient / معلومات المريض
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Nom :</label>
                    <input
                      name="nom"
                      value={imagerieData.nom}
                      onChange={handleImagerieInput}
                      placeholder="الاسم"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Prénom :</label>
                    <input
                      name="prenom"
                      value={imagerieData.prenom}
                      onChange={handleImagerieInput}
                      placeholder="اللقب"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Âge :</label>
                    <input
                      name="age"
                      type="number"
                      min={0}
                      value={imagerieData.age}
                      onChange={handleImagerieInput}
                      placeholder="العمر"
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-medium">Date :</label>
                    <input
                      type="date"
                      name="date"
                      value={imagerieData.date}
                      onChange={handleImagerieInput}
                      className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Type d'imagerie */}
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  Type d'imagerie / نوع التصوير
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {Object.keys(imagerieOptions).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="imagerieType"
                        value={type}
                        checked={imagerieData.imagerieType === type}
                        onChange={handleImagerieInput}
                        className="w-4 h-4"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Liste des examens */}
              {imagerieData.imagerieType && (
                <div>
                  <h3 className="font-semibold mb-3 text-base border-b pb-1">
                    {imagerieData.imagerieType.charAt(0).toUpperCase() +
                      imagerieData.imagerieType.slice(1)}{" "}
                    / الفحوصات
                  </h3>

                  <div className="border rounded-md p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-[220px] overflow-y-auto pr-2">
                      {imagerieOptions[imagerieData.imagerieType]?.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/60 rounded px-1 py-0.5"
                        >
                          <input
                            type="checkbox"
                            name="examens"
                            value={opt}
                            checked={imagerieData.examens.includes(opt)}
                            onChange={handleImagerieInput}
                            className="w-4 h-4"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Commentaires */}
              <div>
                <h3 className="font-semibold mb-2 text-base border-b pb-1">
                  Commentaires / تعليقات
                </h3>
                <textarea
                  name="commentaires"
                  rows={4}
                  value={imagerieData.commentaires}
                  onChange={handleImagerieInput}
                  placeholder="Commentaires supplémentaires / تعليقات إضافية..."
                  className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {/* Signature + Actions */}
              <div className="flex items-center justify-between pt-5 border-t">
                <span className="font-bold text-base">LE MÉDECIN / الطبيب</span>

                <div className="flex gap-3">
                  <Button onClick={handlePrint} className="min-w-[110px]">
                    Imprimer
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="min-w-[110px]">
                      Fermer
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {imagerieOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-1" style={{ width: '13.8cm', height: '20cm', fontSize: '10px' }}>
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs min-w-[140px] space-y-0">
                  <div className="flex items-center gap-1 mb-0">
                    <span className="bg-black text-white font-bold text-xs px-1 py-0.5 rounded">S</span>
                    <span className="font-bold tracking-tight text-xs">sonatrach</span>
                  </div>
                  <div className="font-semibold text-xs">Direction Régionale Haoud Berkaoui</div>
                  <div className="text-xs">Centre de Médecine de Travail</div>
                  <div className="mt-0 text-xs">Nom du Médecin</div>
                  <div className="text-muted-foreground text-xs">(Cachet)</div>
                </div>

                <div className="text-xs w-[260px] space-y-0">
                  <div className="font-bold text-xs underline">DEMANDE D'IMAGERIE</div>
                  {["Nom", "Prénoms", "Age", "Date"].map((label) => (
                    <div key={label} className="flex items-center">
                      <div className="font-semibold min-w-[40px] text-xs">{label} :</div>
                      <div className="w-full text-xs font-normal px-1 border-b border-black min-h-[0.8em]">
                        {imagerieData[label.toLowerCase()]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center my-2">
                <div className="tracking-[0.1em] font-bold text-xs mb-0">DEMANDE D'IMAGERIE</div>
                <div className="w-20 border-b border-black mx-auto mb-0"></div>
              </div>

              <div className="text-xs">
                <div className="font-semibold mb-0">
                  Type d'imagerie : {imagerieData.imagerieType.charAt(0).toUpperCase() + imagerieData.imagerieType.slice(1)}
                </div>
                <div className="font-semibold mb-0">Examens demandés :</div>
                <div className="grid grid-cols-2 gap-x-1 gap-y-0 text-xs leading-tight">
                  {imagerieData.examens.map((exam, i) => (
                    <div key={i} className="flex items-start">
                      <span className="mr-0.5 text-xs">•</span>
                      <span className="text-xs leading-tight">{exam}</span>
                    </div>
                  ))}
                </div>

                {imagerieData.commentaires && (
                  <div className="mt-0.5">
                    <div className="font-semibold text-xs">Commentaires :</div>
                    <div className="text-xs">{imagerieData.commentaires}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <span className="font-bold text-xs">LE MÉDECIN</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;