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

// كود CSS للطباعة فقط الوصفة
const printStyles = `
@media print {
  body * {
    visibility: hidden !important;
  }
  .printable-ordonnance, .printable-ordonnance * {
    visibility: visible !important;
  }
  .printable-ordonnance {
    position: absolute !important;
    left: 0; top: 0;
    width: 100vw !important;
    background: white !important;
    color: black !important;
    box-shadow: none !important;
    padding: 32px !important;
    margin: 0 !important;
  }
  .no-print {
    display: none !important;
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
  <form className="space-y-4 printable-ordonnance bg-white rounded shadow p-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold mb-2">وصفة طبية</h2>
      <p className="text-muted-foreground text-sm">Prescription médicale</p>
    </div>
    <div>
      <label className="block mb-1 font-medium">اسم المريض</label>
      <input type="text" className="input input-bordered w-full border p-2 rounded" placeholder="اسم المريض" />
    </div>
    <div>
      <label className="block mb-1 font-medium">اسم الطبيب</label>
      <input type="text" className="input input-bordered w-full border p-2 rounded" placeholder="اسم الطبيب" />
    </div>
    <div>
      <label className="block mb-1 font-medium">تاريخ الوصفة</label>
      <input type="date" className="input input-bordered w-full border p-2 rounded" />
    </div>
    <div>
      <label className="block mb-1 font-medium">الأدوية</label>
      <textarea className="input input-bordered w-full min-h-[80px] border p-2 rounded" placeholder="اسم الدواء - الجرعة - المدة..." />
    </div>
    <div className="flex gap-2 justify-end mt-6">
      <Button type="button" variant="outline" onClick={() => window.print()} className="ml-2">طباعة</Button>
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
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="no-print">Fermer</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;
