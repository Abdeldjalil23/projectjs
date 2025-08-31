import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    width: 14.8cm;
    height: 21cm;
    background: white;
    z-index: 9999;
    display: flex !important;
    justify-content: center;
    align-items: flex-start;
    padding: 0;
    overflow: hidden;
  }
  .print-area > div {
    width: 100%;
    height: 100%;
    box-shadow: none;
  }
  .dialog-print-hide {
    display: none !important;
  }
}
`;

const OrdonnancePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', prenoms: '', age: '', date: '', medicaments: '' });

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => {document.head.removeChild(style);}
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout title="Ordonnance">
      <div className="p-4 max-w-2xl mx-auto flex flex-col min-h-[80vh]">
        <h2 className="text-2xl font-bold mb-8 text-center">وصفة طبية جديدة</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="border p-2" name="nom" placeholder="اسم المريض" onChange={handleInputChange} />
          <input className="border p-2" name="prenoms" placeholder="اللقب" onChange={handleInputChange} />
          <input className="border p-2" name="age" placeholder="العمر" onChange={handleInputChange} />
          <input className="border p-2" name="date" type="date" onChange={handleInputChange} />
        </div>
        <textarea className="border mb-4 w-full p-2" name="medicaments" rows={6} placeholder="دواء - كمية - مدة..." onChange={handleInputChange} />
        <div className="flex gap-2 justify-end mb-8">
          <Button onClick={handlePrint}>طباعة</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>رجوع</Button>
        </div>
        {/* منطقة الطباعة */}
        <div className="print-area hidden">
          <div className="font-sans text-black bg-white mx-auto p-8" style={{width: '14.8cm', height: '21cm'}}>
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
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '1.5px solid #000', minHeight: '1.8em'}}>{formData.nom}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Prénoms :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '1.5px solid #000', minHeight: '1.8em'}}>{formData.prenoms}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Age :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '1.5px solid #000', minHeight: '1.8em'}}>{formData.age}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[70px]">Date :</div>
                    <div className="w-full text-base font-normal px-1" style={{borderBottom: '1.5px solid #000', minHeight: '1.8em'}}>{formData.date}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center my-8 w-full">
              <div className="text-lg font-bold tracking-[0.6em] underline underline-offset-4">ORDONNANCE</div>
            </div>
            <div className="w-full mt-4">
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

export default OrdonnancePage; 