import { Stethoscope, Pill, Navigation, Microscope, Image, Ambulance, HeartPulse } from 'lucide-react';
import type { ServiceType } from './types';

export const printStyles = `
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

export const SERVICE_TYPES: ServiceType[] = [
  { icon: <Stethoscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Diagnostic', desc: 'مقابلة مع الطبيب العام', action: 'Demander' },
  { icon: <Pill className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Ordonnance', desc: 'طلب وصفة طبية', action: 'Demander' },
  { icon: <Navigation className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Orientation', desc: 'إحالة أو توجيه لطبيب مختص', action: 'Demander' },
  { icon: <Microscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'ANALYSE', desc: 'طلب تحاليل أو فحوصات مخبرية', action: 'Demander' },
  { icon: <Image className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Imagerie', desc: 'طلب تصوير (أشعة، IRM…)', action: 'Demander' },
  { icon: <Ambulance className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Evacuation', desc: 'إخلاء أو نقل طبي', action: 'Demander' },
  { icon: <HeartPulse className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Soins', desc: 'رعاية تمريضية أو متابعة', action: 'Demander' }
];

export const testOptions = {
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

export const imagerieOptions = {
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

export const natureOptions: string[] = [
  'Visite périodique',
  'Urgence médicochirurgicale',
  'Visite spécifique',
  'Visite d\'embauche',
  'Visite de soins'
];
