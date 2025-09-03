import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, Users, MapPin, Plus, ArrowLeft, UserCheck, Pill, Navigation, Microscope, Image, Ambulance, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const DoctorDashboard = () => {
  const { userRole } = useAuth();
  const [selectedStat, setSelectedStat] = useState<string>('ordonnance');

  // بيانات وهمية لأنواع الخدمات الطبية التي قام بها الطبيب اليوم
  const todayServices = {
    ordonnance: [
      { id: 1, patient: 'Karim Salah', date: '2025-01-27', medicaments: 'Paracétamol 500mg', status: 'Prescrit' },
      { id: 2, patient: 'Leila Benkiran', date: '2025-01-27', medicaments: 'Insuline NPH', status: 'Prescrit' },
      { id: 3, patient: 'Omar Farid', date: '2025-01-27', medicaments: 'Amoxicilline 1g', status: 'Prescrit' }
    ],
    orientation: [
      { id: 1, patient: 'Amina El Fassi', date: '2025-01-27', specialite: 'Cardiologie', motif: 'Douleur thoracique', status: 'Référé' },
      { id: 2, patient: 'Hassan Alami', date: '2025-01-27', specialite: 'Dermatologie', motif: 'Lésion cutanée', status: 'Référé' }
    ],
    analyse: [
      { id: 1, patient: 'Sara El Idrissi', date: '2025-01-27', type: 'Sang', tests: 'Hémogramme, Glycémie', status: 'Demandé' },
      { id: 2, patient: 'Ahmed Mansouri', date: '2025-01-27', type: 'Urine', tests: 'ECBU, Créatinine', status: 'Demandé' },
      { id: 3, patient: 'Nadia Tazi', date: '2025-01-27', type: 'Sang', tests: 'Bilan lipidique, TSH', status: 'Demandé' }
    ],
    imagerie: [
      { id: 1, patient: 'Youssef Benali', date: '2025-01-27', type: 'Radiographie', region: 'Thorax', motif: 'Toux persistante', status: 'Demandé' },
      { id: 2, patient: 'Fatima Zahra', date: '2025-01-27', type: 'Échographie', region: 'Abdomen', motif: 'Douleur abdominale', status: 'Demandé' }
    ],
    evacuation: [
      { id: 1, patient: 'Karim Salah', date: '2025-01-27', destination: 'CHU Ibn Sina', motif: 'Appendicite aiguë', transport: 'Ambulance', status: 'Évacué' }
    ],
    soins: [
      { id: 1, patient: 'Leila Benkiran', date: '2025-01-27', type: 'Pansement', region: 'Pied droit', description: 'Pansement quotidien', status: 'Effectué' },
      { id: 2, patient: 'Omar Farid', date: '2025-01-27', type: 'Injection', medicament: 'Vitamine B12', status: 'Effectué' }
    ]
  };

  const handleStatClick = (statType: string) => {
    setSelectedStat(statType);
  };

  const getData = () => {
    return todayServices[selectedStat as keyof typeof todayServices] || [];
  };

  const getTitle = () => {
    const titles = {
      ordonnance: 'Ordonnances du Jour',
      orientation: 'Orientations du Jour',
      analyse: 'Analyses du Jour',
      imagerie: 'Imagerie du Jour',
      evacuation: 'Évacuations du Jour',
      soins: 'Soins du Jour'
    };
    return titles[selectedStat as keyof typeof titles] || 'Services du Jour';
  };

  const getCount = () => {
    return todayServices[selectedStat as keyof typeof todayServices]?.length || 0;
  };

  const renderTable = () => {
    const data = getData();
    
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Aucun service de ce type aujourd'hui
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
                             {selectedStat === 'ordonnance' && (
                 <>
                   <TableHead>Médicaments</TableHead>
                 </>
               )}
               {selectedStat === 'orientation' && (
                 <>
                   <TableHead>Spécialité</TableHead>
                   <TableHead>Motif</TableHead>
                 </>
               )}
               {selectedStat === 'analyse' && (
                 <>
                   <TableHead>Type</TableHead>
                   <TableHead>Tests</TableHead>
                 </>
               )}
               {selectedStat === 'imagerie' && (
                 <>
                   <TableHead>Type</TableHead>
                   <TableHead>Région</TableHead>
                   <TableHead>Motif</TableHead>
                 </>
               )}
               {selectedStat === 'evacuation' && (
                 <>
                   <TableHead>Destination</TableHead>
                   <TableHead>Motif</TableHead>
                   <TableHead>Transport</TableHead>
                 </>
               )}
               {selectedStat === 'soins' && (
                 <>
                   <TableHead>Type</TableHead>
                   <TableHead>Détails</TableHead>
                 </>
               )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.patient}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                
                                 {selectedStat === 'ordonnance' && (
                   <>
                     <TableCell>{item.medicaments}</TableCell>
                   </>
                 )}
                 
                 {selectedStat === 'orientation' && (
                   <>
                     <TableCell>{item.specialite}</TableCell>
                     <TableCell>{item.motif}</TableCell>
                   </>
                 )}
                 
                 {selectedStat === 'analyse' && (
                   <>
                     <TableCell>{item.type}</TableCell>
                     <TableCell>{item.tests}</TableCell>
                   </>
                 )}
                 
                 {selectedStat === 'imagerie' && (
                   <>
                     <TableCell>{item.type}</TableCell>
                     <TableCell>{item.region}</TableCell>
                     <TableCell>{item.motif}</TableCell>
                   </>
                 )}
                 
                 {selectedStat === 'evacuation' && (
                   <>
                     <TableCell>{item.destination}</TableCell>
                     <TableCell>{item.motif}</TableCell>
                     <TableCell>{item.transport}</TableCell>
                   </>
                 )}
                 
                 {selectedStat === 'soins' && (
                   <>
                     <TableCell>{item.type}</TableCell>
                     <TableCell>
                       {item.region && `${item.region} - `}
                       {item.medicament || item.description}
                     </TableCell>
                   </>
                 )}
                
                <TableCell>
                  <Button variant="secondary" size="sm">
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Ordonnances",
            value: todayServices.ordonnance.length,
            icon: <Pill className="h-5 w-5 text-medsuite-primary" />,
            type: 'ordonnance'
          },
          {
            title: "Orientations",
            value: todayServices.orientation.length,
            icon: <Navigation className="h-5 w-5 text-medsuite-primary" />,
            type: 'orientation'
          },
          {
            title: "Analyses",
            value: todayServices.analyse.length,
            icon: <Microscope className="h-5 w-5 text-medsuite-primary" />,
            type: 'analyse'
          },
          {
            title: "Imagerie",
            value: todayServices.imagerie.length,
            icon: <Image className="h-5 w-5 text-medsuite-primary" />,
            type: 'imagerie'
          },
          {
            title: "Évacuations",
            value: todayServices.evacuation.length,
            icon: <Ambulance className="h-5 w-5 text-medsuite-primary" />,
            type: 'evacuation'
          },
          {
            title: "Soins",
            value: todayServices.soins.length,
            icon: <HeartPulse className="h-5 w-5 text-medsuite-primary" />,
            type: 'soins'
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className={`stats-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${selectedStat === stat.type ? 'ring-2 ring-medsuite-primary' : ''}`}
            onClick={() => handleStatClick(stat.type)}
          >
            <div className="flex justify-between items-center p-4">
                              <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
              <div className="p-3 bg-medsuite-secondary rounded-full shadow-sm">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{getTitle()}</h3>
            {renderTable()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;