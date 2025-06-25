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

const NouvelleConsultation = () => {
  const navigate = useNavigate();
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
              <Button variant="outline">{type.action}</Button>
            </Card>
          ))}
        </div>
        <div className="flex justify-start mt-10">
          <Button variant="secondary" size="lg" className="gap-2 px-8 py-3 rounded-full shadow" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NouvelleConsultation;
