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
    width: 13.8cm;
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
  // { icon: <Stethoscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Consultation générale', desc: 'مقابلة مع الطبيب العام', action: 'Demander' },
  { icon: <Pill className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Ordonnance', desc: 'Demande ou renouvellement d\'ordonnance médicale', action: 'Demander' },
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
      setImagerieData((prev) => ({ ...prev, imagerieType: value as any, examens: [] }));
    } else {
      setImagerieData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePrint = () => {
    window.print();
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
                {patientData.chronique && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Chronique
                  </span>
                )}
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
          <DialogContent className="dialog-print-hide">
            <DialogHeader>
              <DialogTitle>{selectedType?.title === 'Ordonnance' ? 'Ordonnance Médicale' : 'Demande de service'}</DialogTitle>
              <DialogDescription>
                {selectedType && (
                  <div className="flex flex-col items-center mb-4">
                    {selectedType.icon}
                    <div className="font-bold text-lg mt-2">{selectedType.title}</div>
                    <div className="text-center text-muted-foreground mb-2">{selectedType.desc}</div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedType?.title === 'Ordonnance' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <input className="border p-2" name="nom" placeholder="Nom du patient" value={formData.nom} onChange={handleInputChange} />
                  <input className="border p-2" name="prenoms" placeholder="Prénoms" value={formData.prenoms} onChange={handleInputChange} />
                  <input className="border p-2" name="age" placeholder="Âge" value={formData.age} onChange={handleInputChange} />
                  <input className="border p-2" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                </div>
                <textarea className="border mt-4 w-full p-2" name="medicaments" rows={6} placeholder="Médicament - Quantité - Durée..." value={formData.medicaments} onChange={handleInputChange} />
                <div className="mt-4 text-end">
                  <Button onClick={handlePrint}>Imprimer</Button>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button variant="outline">Fermer</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

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
                <div className="font-bold text-base mb-2 underline underline-offset-2">FEUILLE DE MALADIE</div>
                <div className="flex flex-col gap-2 w-full text-xs">
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Nom :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{formData.nom}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Prénoms :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{formData.prenoms}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Age :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{formData.age}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Date :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{formData.date}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center my-12 w-full">
              <div className="tracking-[0.4em] font-bold text-lg mb-1">ORDONNANCE</div>
              <div className="w-40 border-b-2 border-black mb-2"></div>
            </div>
            <div className="w-full mt-8">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1">Médicament</th>
                    <th className="border p-1">Quantité</th>
                    <th className="border p-1">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.medicaments.split('\n').map((line, idx) => {
                    const [nom, quantite, periode] = line.split('-').map(s => s.trim());
                    if (!nom) return null;
                    return (
                      <tr key={idx}>
                        <td className="border p-1">{nom}</td>
                        <td className="border p-1">{quantite || ''}</td>
                        <td className="border p-1">{periode || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Dialog open={orientationOpen} onOpenChange={setOrientationOpen}>
          <DialogContent className="dialog-print-hide max-w-lg">
            <DialogHeader>
              <DialogTitle>LETTRE D'ORIENTATION</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
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
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input className="border-b border-black px-1 col-span-1" name="nom" placeholder="Nom" value={orientationData.nom} onChange={handleOrientationInput} />
                <input className="border-b border-black px-1 col-span-1" name="prenom" placeholder="Prénom" value={orientationData.prenom} onChange={handleOrientationInput} />
                <input className="border-b border-black px-1 col-span-1" name="age" placeholder="Age" value={orientationData.age} onChange={handleOrientationInput} />
              </div>
              <div className="font-bold text-center my-2">LETTRE D'ORIENTATION</div>
              <div className="mb-2">
                <div className="font-semibold mb-1">Nature de visite :</div>
                <div className="flex flex-col gap-1">
                  {natureOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="nature" value={opt} checked={orientationData.nature.includes(opt)} onChange={handleOrientationInput} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <span>Le/La susnommé(e) nécessite un avis / consultation en </span>
                <input className="border-b border-black px-1 w-40" name="avis" value={orientationData.avis} onChange={handleOrientationInput} placeholder="spécialité" />
              </div>
              <div className="mb-2">
                <span>Le docteur destinataire : </span>
                <input className="border-b border-black px-1 w-40" name="destinataire" value={orientationData.destinataire} onChange={handleOrientationInput} placeholder="Nom du docteur" />
              </div>
              <div className="mb-2">
                <span>Date : </span>
                <input type="date" className="border-b border-black px-1 w-40" name="date" value={orientationData.date} onChange={handleOrientationInput} />
              </div>
              <div className="flex justify-between mt-4">
                <span className="font-bold">LE MEDECIN</span>
                <Button onClick={handlePrint}>Imprimer</Button>
              </div>
              <div className="flex justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
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
          <DialogContent className="dialog-print-hide max-w-2xl">
            <DialogHeader>
              <DialogTitle>CERTIFICAT MEDICAL DE SOINS</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center mb-2">
                <div className="font-bold text-lg">CERTIFICAT MEDICAL DE</div>
                <div className="flex flex-col text-xs border border-black p-2">
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="1" checked={soinsData.choix === '1'} onChange={handleSoinsInput} /> 1 Arrêt de travail</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="2" checked={soinsData.choix === '2'} onChange={handleSoinsInput} /> 2 Prolongation</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="3" checked={soinsData.choix === '3'} onChange={handleSoinsInput} /> 3 Reprise de travail</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="4" checked={soinsData.choix === '4'} onChange={handleSoinsInput} /> 4 Hospitalisation</label>
                </div>
                <div className="text-red-600 font-bold text-lg ml-4">N° <input className="border-b border-black w-20" name="signature" value={soinsData.signature} onChange={handleSoinsInput} placeholder="Numéro" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div>Emis le : <input type="date" className="border-b border-black" name="emisLe" value={soinsData.emisLe} onChange={handleSoinsInput} /></div>
                  <div>Par le docteur : <input className="border-b border-black" name="docteur" value={soinsData.docteur} onChange={handleSoinsInput} /></div>
                </div>
                <div>
                  <div>Nom : <input className="border-b border-black" name="nom" value={soinsData.nom} onChange={handleSoinsInput} /></div>
                  <div>Date accident ou maladie : <input className="border-b border-black" name="dateAccident" value={soinsData.dateAccident} onChange={handleSoinsInput} /></div>
                </div>
                <div>
                  <div>Service Employeur : <input className="border-b border-black" name="service" value={soinsData.service} onChange={handleSoinsInput} /></div>
                  <div>Compagnie : <input className="border-b border-black" name="compagnie" value={soinsData.compagnie} onChange={handleSoinsInput} /></div>
                </div>
              </div>
              <div className="font-bold my-2">Je soussigné, Docteur en Médecine, Certifie que l'état de santé du susnommé justifie :</div>
              <div className="border border-black p-4 mb-2 flex flex-col gap-3">
                {soinsData.choix === '1' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">1</span> Traitement avec arrêt de travail de <input className="border-b border-black w-12" name="arretJours" value={soinsData.arretJours} onChange={handleSoinsInput} /> jours, sauf complications, du <input className="border-b border-black w-24" name="arretDu" value={soinsData.arretDu} onChange={handleSoinsInput} /> au <input className="border-b border-black w-24" name="arretAu" value={soinsData.arretAu} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix === '2' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">2</span> Prolongation d'arrêt de travail de <input className="border-b border-black w-12" name="prolongationJours" value={soinsData.prolongationJours} onChange={handleSoinsInput} /> jours, sauf complications, du <input className="border-b border-black w-24" name="prolongationDu" value={soinsData.prolongationDu} onChange={handleSoinsInput} /> au <input className="border-b border-black w-24" name="prolongationAu" value={soinsData.prolongationAu} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix === '3' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">3</span> Reprise de travail à dater du <input className="border-b border-black w-24" name="repriseDate" value={soinsData.repriseDate} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix === '4' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">4</span> Admission ou transport d'urgence à l'hôpital ou à la clinique de <input className="border-b border-black w-40" name="admissionLieu" value={soinsData.admissionLieu} onChange={handleSoinsInput} /></div>
                )}
              </div>
              <div className="flex flex-row justify-between mt-4 text-xs">
                <div>Cachet du Médecin</div>
                <div>Ces exemplaires doivent être remis à : <input className="border-b border-black w-40" name="exemplaires" value={soinsData.exemplaires} onChange={handleSoinsInput} /></div>
                <div>Signature du Médecin</div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button onClick={handlePrint}>Imprimer</Button>
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
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
          <DialogContent className="dialog-print-hide max-w-2xl">
            <DialogHeader>
              <DialogTitle>EVACUATION SANITAIRE</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-xs">sonatrach</div>
                  <div className="text-xs">EXPLORATION – PRODUCTION</div>
                  <div className="text-xs">DIRECTION REGIONAL</div>
                  <div className="text-xs">HAOUD BERKAOUI</div>
                  <div className="text-xs">DIVISION PERSONNEL</div>
                  <div className="text-xs">SERVICE SANTE/CMT</div>
                </div>
                <div className="text-xs">Haoud Berkaoui Le : <input type="date" className="border-b border-black" name="date" value={evacData.date} onChange={handleEvacInput} /></div>
              </div>
              <div className="text-center font-bold text-lg my-2 border-b border-black">EVACUATION SANITAIRE</div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>Nom : <input className="border-b border-black" name="nom" value={evacData.nom} onChange={handleEvacInput} /></div>
                <div>Prénom : <input className="border-b border-black" name="prenom" value={evacData.prenom} onChange={handleEvacInput} /></div>
                <div>Fonction : <input className="border-b border-black" name="fonction" value={evacData.fonction} onChange={handleEvacInput} /></div>
                <div>Structure : <input className="border-b border-black" name="structure" value={evacData.structure} onChange={handleEvacInput} /></div>
              </div>
              <div className="font-bold">Doit être évacué :</div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>Son domicile : <input className="border-b border-black" name="domicile" value={evacData.domicile} onChange={handleEvacInput} /></div>
                <div>vers l'hôpital de : <input className="border-b border-black" name="hopital" value={evacData.hopital} onChange={handleEvacInput} /></div>
                <div>Un spécialiste en : <input className="border-b border-black" name="specialiste" value={evacData.specialiste} onChange={handleEvacInput} /></div>
                <div>Délai : <input className="border-b border-black" name="delai" value={evacData.delai} onChange={handleEvacInput} /></div>
              </div>
              <div className="flex gap-4 items-center mb-2">
                <label className="flex items-center gap-1"><input type="checkbox" name="maladie" checked={evacData.maladie} onChange={handleEvacInput} /> Maladie</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="accident" checked={evacData.accident} onChange={handleEvacInput} /> Accident du Travail</label>
                <div>Autres à préciser : <input className="border-b border-black" name="autres" value={evacData.autres} onChange={handleEvacInput} /></div>
              </div>
              <div className="font-bold">Moyens de transport à utiliser :</div>
              <div className="flex gap-4 items-center mb-2">
                <label className="flex items-center gap-1"><input type="checkbox" name="transport.avion" checked={evacData.transport.avion} onChange={handleEvacInput} /> Avion</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="transport.ambulance" checked={evacData.transport.ambulance} onChange={handleEvacInput} /> Ambulance</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="transport.sh" checked={evacData.transport.sh} onChange={handleEvacInput} /> Véhicule SH</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="transport.propres" checked={evacData.transport.propres} onChange={handleEvacInput} /> Propres Moyens</label>
              </div>
              <div className="font-bold">Accompagné par :</div>
              <div className="flex gap-8 items-center mb-2">
                <div>L'infirmier :
                  <label className="ml-2"><input type="radio" name="inf" value="oui" checked={evacData.inf === 'oui'} onChange={handleEvacInput} /> Oui</label>
                  <label className="ml-2"><input type="radio" name="inf" value="non" checked={evacData.inf === 'non'} onChange={handleEvacInput} /> Non</label>
                </div>
                <div>L'assistant(e) :
                  <label className="ml-2"><input type="radio" name="assistant" value="oui" checked={evacData.assistant === 'oui'} onChange={handleEvacInput} /> Oui</label>
                  <label className="ml-2"><input type="radio" name="assistant" value="non" checked={evacData.assistant === 'non'} onChange={handleEvacInput} /> Non</label>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button onClick={handlePrint}>Imprimer</Button>
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              </div>
              <div className="text-end font-bold mt-4">Le Médecin</div>
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
          <DialogContent className="dialog-print-hide max-w-2xl">
            <DialogHeader>
              <DialogTitle>DEMANDE D'ANALYSE MÉDICALE</DialogTitle>
              <DialogDescription>طلب تحاليل أو فحوصات مخبرية</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["nom", "prenom", "age"].map((field) => (
                  <input
                    key={field}
                    name={field}
                    className="border-b border-black px-2 py-1 text-sm"
                    placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} / ${field === "nom" ? "الاسم" : field === "prenom" ? "اللقب" : "العمر"}`}
                    value={explorationData[field]}
                    onChange={handleExplorationInput}
                  />
                ))}
                <input
                  type="date"
                  className="border-b border-black px-2 py-1 text-sm"
                  name="date"
                  value={explorationData.date}
                  onChange={handleExplorationInput}
                />
              </div>

              <div>
                <div className="font-semibold mb-2">Type d'analyse / نوع التحليل :</div>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="analyseType"
                      value="interne"
                      checked={explorationData.analyseType === 'interne'}
                      onChange={handleExplorationInput}
                    />
                    Analyse Interne / تحليل داخلي
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="analyseType"
                      value="externe"
                      checked={explorationData.analyseType === 'externe'}
                      onChange={handleExplorationInput}
                    />
                    Analyse Externe / تحليل خارجي
                  </label>
                </div>

                {explorationData.analyseType && (
                  <div>
                    <div className="font-semibold mb-2">
                      {explorationData.analyseType === 'interne' ? 'Analyses Internes' : 'Analyses Externes'} / 
                      {explorationData.analyseType === 'interne' ? 'التحاليل الداخلية' : 'التحاليل الخارجية'} :
                    </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
                      {testOptions[explorationData.analyseType].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="tests"
                        value={opt}
                        checked={explorationData.tests.includes(opt)}
                        onChange={handleExplorationInput}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                  </div>
                )}
              </div>

              <textarea
                name="commentaires"
                className="border w-full p-2 text-sm"
                rows={4}
                placeholder="Commentaires supplémentaires / تعليقات إضافية"
                value={explorationData.commentaires}
                onChange={handleExplorationInput}
              />

              <div className="flex justify-between mt-4">
                <span className="font-bold">LE MÉDECIN / الطبيب</span>
                <Button onClick={handlePrint}>Imprimer</Button>
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
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
          <DialogContent className="dialog-print-hide max-w-2xl">
            <DialogHeader>
              <DialogTitle>DEMANDE D'IMAGERIE</DialogTitle>
              <DialogDescription>طلب تصوير (أشعة، IRM…)</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["nom", "prenom", "age"].map((field) => (
                  <input
                    key={field}
                    name={field}
                    className="border-b border-black px-2 py-1 text-sm"
                    placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} / ${field === "nom" ? "الاسم" : field === "prenom" ? "اللقب" : "العمر"}`}
                    value={imagerieData[field]}
                    onChange={handleImagerieInput}
                  />
                ))}
                <input
                  type="date"
                  className="border-b border-black px-2 py-1 text-sm"
                  name="date"
                  value={imagerieData.date}
                  onChange={handleImagerieInput}
                />
              </div>

              <div>
                <div className="font-semibold mb-2">Type d'imagerie / نوع التصوير :</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {Object.entries(imagerieOptions).map(([type, options]) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="imagerieType"
                        value={type}
                        checked={imagerieData.imagerieType === type}
                        onChange={handleImagerieInput}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>

                {imagerieData.imagerieType && (
                  <div>
                    <div className="font-semibold mb-2">
                      {imagerieData.imagerieType.charAt(0).toUpperCase() + imagerieData.imagerieType.slice(1)} :
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
                      {imagerieOptions[imagerieData.imagerieType].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="examens"
                            value={opt}
                            checked={imagerieData.examens.includes(opt)}
                            onChange={handleImagerieInput}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <textarea
                name="commentaires"
                className="border w-full p-2 text-sm"
                rows={4}
                placeholder="Commentaires supplémentaires / تعليقات إضافية"
                value={imagerieData.commentaires}
                onChange={handleImagerieInput}
              />

              <div className="flex justify-between mt-4">
                <span className="font-bold">LE MÉDECIN / الطبيب</span>
                <Button onClick={handlePrint}>Imprimer</Button>
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
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