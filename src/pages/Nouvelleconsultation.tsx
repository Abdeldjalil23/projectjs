// src/pages/NouvelleConsultation.tsx
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Stethoscope, Pill, Navigation, Microscope, Image, Ambulance, HeartPulse, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from '@/components/ui/dialog';

const printStyles = `
@media print {
  @page {
    size: A5 portrait;
    margin: 0cm;
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
    height: 21cm;
    box-shadow: none;
  }

  .dialog-print-hide {
    display: none !important;
  }
}
`;

const types = [
  { icon: <Stethoscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Consultation générale', desc: 'مقابلة مع الطبيب العام', action: 'Demander' },
  { icon: <Pill className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Ordonnance', desc: 'طلب أو تجديد وصفة طبية', action: 'Demander' },
  { icon: <Navigation className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Orientation', desc: 'إحالة أو توجيه لطبيب مختص', action: 'Demander' },
  { icon: <Microscope className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Exploration', desc: 'طلب تحاليل أو فحوصات مخبرية', action: 'Demander' },
  { icon: <Image className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Imagerie', desc: 'طلب تصوير (أشعة، IRM…)', action: 'Demander' },
  { icon: <Ambulance className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Evacuation', desc: 'إخلاء أو نقل طبي', action: 'Demander' },
  { icon: <HeartPulse className="w-12 h-12 text-medsuite-primary mb-2" />, title: 'Soins', desc: 'رعاية تمريضية أو متابعة', action: 'Demander' }
];

const NouvelleConsultation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({ nom: '', prenoms: '', age: '', date: '', medicaments: '' });

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleDemander = (type) => {
    setSelectedType(type);
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
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
            <ArrowLeft className="w-5 h-5" /> Retour
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="dialog-print-hide">
            <DialogHeader>
              <DialogTitle>{selectedType?.title === 'Ordonnance' ? 'وصفة طبية جديدة' : 'Demande de service'}</DialogTitle>
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
                  <input className="border p-2" name="nom" placeholder="اسم المريض" onChange={handleInputChange} />
                  <input className="border p-2" name="prenoms" placeholder="اللقب" onChange={handleInputChange} />
                  <input className="border p-2" name="age" placeholder="العمر" onChange={handleInputChange} />
                  <input className="border p-2" name="date" type="date" onChange={handleInputChange} />
                </div>
                <textarea className="border mt-4 w-full p-2" name="medicaments" rows={6} placeholder="دواء - كمية - مدة..." onChange={handleInputChange} />
                <div className="mt-4 text-end">
                  <Button onClick={handlePrint}>طباعة</Button>
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
          <div className="font-sans text-black bg-white mx-auto p-8" style={{width: '14.8cm', height: '21cm'}}>
            {/* Header */}
            <div className="flex flex-row justify-between items-start mb-8 w-full">
              {/* Left: شعار ومعلومات */}
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
              {/* Right: FEUILLE DE MALADIE والحقول */}
              <div className="flex flex-col items-end gap-1 w-[340px]">
                <div className="font-bold text-base mb-2 underline underline-offset-2">FEUILLE DE MALADIE</div>
                <div className="flex flex-col gap-2 w-full text-xs">
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Nom :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '2px solid #000', minHeight: '2em'}}>{formData.nom}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Prénoms :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '2px solid #000', minHeight: '2em'}}>{formData.prenoms}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px] line-through">Malade (AEC) :</div>
                    <div className="w-full h-7"></div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Age :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '2px solid #000', minHeight: '2em'}}>{formData.age}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Date :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '2px solid #000', minHeight: '2em'}}>{formData.date}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* العنوان ORDONNANCE */}
            <div className="flex flex-col items-center my-12 w-full">
              <div className="tracking-[0.4em] font-bold text-lg mb-1">ORDONNANCE</div>
              <div className="w-40 border-b-2 border-black mb-2"></div>
            </div>
            {/* جدول الأدوية */}
            <div className="w-full mt-8">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1">اسم الدواء</th>
                    <th className="border p-1">الكمية</th>
                    <th className="border p-1">الفترة</th>
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
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;
