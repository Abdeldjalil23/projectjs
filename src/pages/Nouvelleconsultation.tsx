// src/pages/NouvelleConsultation.tsx
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Stethoscope,
  Pill,
  Navigation,
  Microscope,
  Image,
  Ambulance,
  HeartPulse,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';

// كود CSS للطباعة مضبوط بدقة على حجم A5، مع إزالة الهوامش والحشو الزائد وتوسيط النموذج
const printStyles = `
@media print {
  html, body {
    width: 148mm !important;
    height: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    box-sizing: border-box !important;
  }
  .printable-ordonnance {
    width: 148mm !important;
    height: 210mm !important;
    min-width: 148mm !important;
    min-height: 210mm !important;
    max-width: 148mm !important;
    max-height: 210mm !important;
    margin: 0 auto !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    position: static !important;
    direction: ltr !important;
    text-align: left !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
  }
  .no-print {
    display: none !important;
  }
  @page {
    size: A5 portrait;
    margin: 0;
  }
}
`;

const types = [
  {
    icon: <Stethoscope className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Consultation générale',
    desc: 'مقابلة مع الطبيب العام',
    action: 'Demander',
  },
  {
    icon: <Pill className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Ordonnance',
    desc: 'طلب أو تجديد وصفة طبية',
    action: 'Demander',
  },
  {
    icon: <Navigation className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Orientation',
    desc: 'إحالة أو توجيه لطبيب مختص',
    action: 'Demander',
  },
  {
    icon: <Microscope className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Exploration',
    desc: 'طلب تحاليل أو فحوصات مخبرية',
    action: 'Demander',
  },
  {
    icon: <Image className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Imagerie',
    desc: 'طلب تصوير (أشعة، IRM…)',
    action: 'Demander',
  },
  {
    icon: <Ambulance className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Evacuation',
    desc: 'إخلاء أو نقل طبي',
    action: 'Demander',
  },
  {
    icon: <HeartPulse className="w-12 h-12 text-medsuite-primary mb-2" />,
    title: 'Soins',
    desc: 'رعاية تمريضية أو متابعة',
    action: 'Demander',
  },
];

const ordonnanceForm = (
  <form dir="ltr" className="printable-ordonnance bg-white rounded shadow p-2 max-w-none mx-auto border border-gray-300 font-sans text-left">
    {/* Header */}
    <div className="flex justify-between items-start mb-6 w-full">
      {/* Left: Logo & Center Info */}
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-black text-white font-bold text-xs px-2 py-1 rounded">S</div>
          <span className="font-bold text-xs tracking-tight">sonatrach</span>
        </div>
        <div className="text-xs font-semibold">Direction Régionale Haoud Berkaoui</div>
        <div className="text-xs">Centre de Médecine de Travail</div>
        <div className="text-xs mt-2">Nom du Médecin</div>
        <div className="text-xs text-muted-foreground">(Cachet)</div>
      </div>
      {/* Right: Feuille de Maladie & Patient Info */}
      <div className="flex flex-col items-end gap-1 w-1/2">
        <div className="font-bold text-sm underline mb-2">FEUILLE DE MALADIE</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-full text-xs">
          <div className="font-semibold">Nom :</div>
          <input type="text" className="border-b border-gray-400 focus:outline-none px-1 bg-transparent" />
          <div className="font-semibold">Prénoms :</div>
          <input type="text" className="border-b border-gray-400 focus:outline-none px-1 bg-transparent" />
          <div className="font-semibold line-through">Malade (AEC) :</div>
          <div></div>
          <div className="font-semibold">Âge :</div>
          <input type="text" className="border-b border-gray-400 focus:outline-none px-1 bg-transparent" />
          <div className="font-semibold">Date :</div>
          <input type="date" className="border-b border-gray-400 focus:outline-none px-1 bg-transparent" />
        </div>
      </div>
    </div>
    {/* ORDONNANCE Title */}
    <div className="flex flex-col items-center my-10 w-full">
      <div className="tracking-widest font-bold text-lg mb-1">ORDONNANCE</div>
      <div className="w-32 border-b-2 border-black mb-2"></div>
    </div>
    {/* Prescription Content Area */}
    <div className="min-h-[120px] mb-10 w-full">
      <textarea className="w-full h-32 bg-transparent border-none focus:outline-none resize-none text-base" placeholder="Ecrire l'ordonnance ici..."></textarea>
    </div>
    {/* Footer: empty for signature/stamp */}
    <div className="flex justify-between items-end mt-8 w-full">
      <div className="text-xs text-muted-foreground">&nbsp;</div>
      <Button type="button" variant="outline" onClick={() => window.print()} className="no-print">Imprimer</Button>
    </div>
  </form>
);

const NouvelleConsultation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // إضافة كود CSS للطباعة لمرة واحدة فقط
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDemander = (type) => {
    setSelectedType(type);
    setOpen(true);
  };

  return (
    <AppLayout title="Nouvelle Consultation">
      <div className="p-4 max-w-5xl mx-auto flex flex-col min-h-[80vh]">
        <h2 className="text-2xl font-bold mb-8 text-center">Choisissez le type de service</h2>
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
        <div className="flex justify-start mt-10">
          <Button variant="secondary" size="lg" className="gap-2 px-8 py-3 rounded-full shadow" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedType && selectedType.title === 'Ordonnance' ? 'وصفة طبية جديدة' : 'Demande de service'}
              </DialogTitle>
              <DialogDescription>
                {selectedType ? (
                  <div>
                    <div className="flex flex-col items-center mb-4">
                      {selectedType.icon}
                      <div className="font-bold text-lg mt-2">{selectedType.title}</div>
                    </div>
                    <div className="text-center text-muted-foreground mb-2">{selectedType.desc}</div>
                  </div>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            {selectedType && selectedType.title === 'Ordonnance' ? (
              <div className="mt-4">{ordonnanceForm}</div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;
