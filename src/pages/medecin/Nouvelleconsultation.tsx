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
  const today = new Date().toISOString().slice(0, 10);
  const [orientationData, setOrientationData] = useState({ nom: '', prenom: '', age: '', nature: [], avis: '', destinataire: '', date: today });
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [soinsData, setSoinsData] = useState({
    emisLe: new Date().toISOString().slice(0, 10),
    docteur: '',
    nom: '',
    dateAccident: '',
    service: '',
    compagnie: '',
    choix: '1', // 1: Arret, 2: Prolongation, 3: Reprise, 4: Admission
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
  const [evacData, setEvacData] = useState({
    date: new Date().toISOString().slice(0, 10),
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
    inf: '', // 'oui' | 'non'
    assistant: '', // 'oui' | 'non'
  });
  const [evacOpen, setEvacOpen] = useState(false);

  const natureOptions = [
    'Visite périodique',
    'Urgence médicochirurgicale',
    'Visite spécifique',
    'Visite d\'embauche',
    'Visite de soins'
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleDemander = (type) => {
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
    setSelectedType(type);
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrientationInput = (e) => {
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

  const handleSoinsInput = (e) => {
    const { name, value, type } = e.target;
    setSoinsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvacInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('transport.')) {
      const key = name.split('.')[1];
      setEvacData((prev) => ({ ...prev, transport: { ...prev.transport, [key]: checked } }));
    } else if (type === 'checkbox') {
      setEvacData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEvacData((prev) => ({ ...prev, [name]: value }));
    }
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
                <Button onClick={() => window.print()}>طباعة</Button>
              </div>
              <div className="flex justify-end mt-2">
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* منطقة الطباعة لنموذج Orientation */}
        {orientationOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{width: '14.8cm', height: '21cm'}}>
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
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="1" checked={soinsData.choix==='1'} onChange={handleSoinsInput}/> 1 Arrêt de travail</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="2" checked={soinsData.choix==='2'} onChange={handleSoinsInput}/> 2 Prolongation</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="3" checked={soinsData.choix==='3'} onChange={handleSoinsInput}/> 3 Reprise de travail</label>
                  <label className="flex items-center gap-1"><input type="radio" name="choix" value="4" checked={soinsData.choix==='4'} onChange={handleSoinsInput}/> 4 Hospitalisation</label>
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
                {soinsData.choix==='1' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">1</span> Traitement avec arrêt de travail de <input className="border-b border-black w-12" name="arretJours" value={soinsData.arretJours} onChange={handleSoinsInput} /> jours, sauf complications, du <input className="border-b border-black w-24" name="arretDu" value={soinsData.arretDu} onChange={handleSoinsInput} /> au <input className="border-b border-black w-24" name="arretAu" value={soinsData.arretAu} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix==='2' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">2</span> Prolongation d'arrêt de travail de <input className="border-b border-black w-12" name="prolongationJours" value={soinsData.prolongationJours} onChange={handleSoinsInput} /> jours, sauf complications, du <input className="border-b border-black w-24" name="prolongationDu" value={soinsData.prolongationDu} onChange={handleSoinsInput} /> au <input className="border-b border-black w-24" name="prolongationAu" value={soinsData.prolongationAu} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix==='3' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">3</span> Reprise de travail à dater du <input className="border-b border-black w-24" name="repriseDate" value={soinsData.repriseDate} onChange={handleSoinsInput} /></div>
                )}
                {soinsData.choix==='4' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">4</span> Admission ou transport d'urgence à l'hôpital ou à la clinique de <input className="border-b border-black w-40" name="admissionLieu" value={soinsData.admissionLieu} onChange={handleSoinsInput} /></div>
                )}
              </div>
              <div className="flex flex-row justify-between mt-4 text-xs">
                <div>Cachet du Médecin</div>
                <div>Ces exemplaires doivent être remis à : <input className="border-b border-black w-40" name="exemplaires" value={soinsData.exemplaires} onChange={handleSoinsInput} /></div>
                <div>Signature du Médecin</div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button onClick={() => window.print()}>طباعة</Button>
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* منطقة الطباعة لنموذج Soins */}
        {soinsOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{width: '18cm', height: '21cm'}}>
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
                {soinsData.choix==='1' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">1</span> Traitement avec arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.arretJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretAu}</span></div>
                )}
                {soinsData.choix==='2' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">2</span> Prolongation d'arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.prolongationJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationAu}</span></div>
                )}
                {soinsData.choix==='3' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">3</span> Reprise de travail à dater du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.repriseDate}</span></div>
                )}
                {soinsData.choix==='4' && (
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">4</span> Admission ou transport d'urgence à l'hôpital ou à la clinique de <span className="border-b border-black px-1 min-w-[120px] inline-block">{soinsData.admissionLieu}</span></div>
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
                  <div className="text-xs">DIRECTION REGIONALE</div>
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
                  <label className="ml-2"><input type="radio" name="inf" value="oui" checked={evacData.inf==='oui'} onChange={handleEvacInput} /> Oui</label>
                  <label className="ml-2"><input type="radio" name="inf" value="non" checked={evacData.inf==='non'} onChange={handleEvacInput} /> Non</label>
                </div>
                <div>L'assistant(e) :
                  <label className="ml-2"><input type="radio" name="assistant" value="oui" checked={evacData.assistant==='oui'} onChange={handleEvacInput} /> Oui</label>
                  <label className="ml-2"><input type="radio" name="assistant" value="non" checked={evacData.assistant==='non'} onChange={handleEvacInput} /> Non</label>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button onClick={() => window.print()}>طباعة</Button>
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              </div>
              <div className="text-end font-bold mt-4">Le Médecin</div>
            </div>
          </DialogContent>
        </Dialog>
        {/* منطقة الطباعة لنموذج Evacuation */}
        {evacOpen && (
          <div className="print-area hidden">
            <div className="font-sans text-black bg-white mx-auto p-8" style={{width: '18cm', height: '21cm'}}>
              <div className="flex flex-row justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-xs">sonatrach</div>
                  <div className="text-xs">EXPLORATION – PRODUCTION</div>
                  <div className="text-xs">DIRECTION REGIONALE</div>
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
                <span>L'infirmier : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf==='oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf==='non' ? '✔' : ''}</span></span>
                <span>L'assistant(e) : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant==='oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant==='non' ? '✔' : ''}</span></span>
              </div>
              <div className="text-end font-bold mt-4">Le Médecin</div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;
