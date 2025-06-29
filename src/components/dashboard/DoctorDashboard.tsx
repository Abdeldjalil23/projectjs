import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, Users, MapPin, Plus, ArrowLeft, UserCheck } from 'lucide-react';
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
  const [selectedStat, setSelectedStat] = useState<string>('appointments');

  const totalAppointments = [
    { id: 1, matricule: 'EMP001', nom: 'Salah', nomFille: 'Ben Ali', prenom: 'Karim', structure: 'OP', dateNaissance: '1985-03-15', groupeSanguin: 'A+', patient: 'Karim Salah', avatar: 'KS' },
    { id: 2, matricule: 'EMP002', nom: 'Benkiran', nomFille: 'El Fassi', prenom: 'Leila', structure: 'DP', dateNaissance: '1978-07-22', groupeSanguin: 'B+', patient: 'Leila Benkiran', avatar: 'LB' },
    { id: 3, matricule: 'EMP003', nom: 'Farid', nomFille: 'Tazi', prenom: 'Omar', structure: 'URG', dateNaissance: '1990-11-08', groupeSanguin: 'O+', patient: 'Omar Farid', avatar: 'OF' },
    { id: 4, matricule: 'EMP004', nom: 'El Fassi', nomFille: 'Cherkaoui', prenom: 'Amina', structure: 'CHIR', dateNaissance: '1982-04-12', groupeSanguin: 'AB+', patient: 'Amina El Fassi', avatar: 'AE' },
    { id: 5, matricule: 'EMP005', nom: 'Alami', nomFille: 'Benjelloun', prenom: 'Hassan', structure: 'CARD', dateNaissance: '1975-09-30', groupeSanguin: 'A-', patient: 'Hassan Alami', avatar: 'HA' },
    { id: 6, matricule: 'EMP006', nom: 'Zahra', nomFille: 'Mansouri', prenom: 'Fatima', structure: 'DERM', dateNaissance: '1988-12-05', groupeSanguin: 'B-', patient: 'Fatima Zahra', avatar: 'FZ' },
    { id: 7, matricule: 'EMP007', nom: 'Benali', nomFille: 'El Idrissi', prenom: 'Youssef', structure: 'ORTH', dateNaissance: '1983-06-18', groupeSanguin: 'O-', patient: 'Youssef Benali', avatar: 'YB' },
    { id: 8, matricule: 'EMP008', nom: 'Tazi', nomFille: 'Alami', prenom: 'Nadia', structure: 'NEURO', dateNaissance: '1979-01-25', groupeSanguin: 'AB-', patient: 'Nadia Tazi', avatar: 'NT' },
    { id: 9, matricule: 'EMP009', nom: 'Mansouri', nomFille: 'Farid', prenom: 'Ahmed', structure: 'ENDOC', dateNaissance: '1987-08-14', groupeSanguin: 'A+', patient: 'Ahmed Mansouri', avatar: 'AM' },
    { id: 10, matricule: 'EMP010', nom: 'El Idrissi', nomFille: 'Benkiran', prenom: 'Sara', structure: 'GASTRO', dateNaissance: '1992-02-28', groupeSanguin: 'B+', patient: 'Sara El Idrissi', avatar: 'SE' },
  ];

  const todaysPatients = [
    { id: 1, matricule: 'EMP001', nom: 'Salah', nomFille: 'Ben Ali', prenom: 'Karim', structure: 'OP', dateNaissance: '1985-03-15', groupeSanguin: 'A+', name: 'Karim Salah', time: '09:00', condition: 'Hypertension', status: 'In Progress', avatar: 'KS' },
    { id: 2, matricule: 'EMP002', nom: 'Benkiran', nomFille: 'El Fassi', prenom: 'Leila', structure: 'DP', dateNaissance: '1978-07-22', groupeSanguin: 'B+', name: 'Leila Benkiran', time: '10:30', condition: 'Diabetes Type 2', status: 'Waiting', avatar: 'LB' },
    { id: 3, matricule: 'EMP003', nom: 'Farid', nomFille: 'Tazi', prenom: 'Omar', structure: 'URG', dateNaissance: '1990-11-08', groupeSanguin: 'O+', name: 'Omar Farid', time: '14:00', condition: 'Post-surgery', status: 'Scheduled', avatar: 'OF' },
    { id: 4, matricule: 'EMP004', nom: 'El Fassi', nomFille: 'Cherkaoui', prenom: 'Amina', structure: 'CHIR', dateNaissance: '1982-04-12', groupeSanguin: 'AB+', name: 'Amina El Fassi', time: '11:15', condition: 'General Check-up', status: 'Completed', avatar: 'AE' },
    { id: 5, matricule: 'EMP005', nom: 'Alami', nomFille: 'Benjelloun', prenom: 'Hassan', structure: 'CARD', dateNaissance: '1975-09-30', groupeSanguin: 'A-', name: 'Hassan Alami', time: '15:30', condition: 'Cardiology', status: 'Waiting', avatar: 'HA' },
  ];

  const completedAppointments = [
    { id: 1, matricule: 'EMP001', nom: 'Salah', nomFille: 'Ben Ali', prenom: 'Karim', structure: 'OP', dateNaissance: '1985-03-15', groupeSanguin: 'A+', patient: 'Karim Salah', date: '2025-06-22', diagnosis: 'Hypertension', treatment: 'Medication prescribed', avatar: 'KS' },
    { id: 2, matricule: 'EMP002', nom: 'Benkiran', nomFille: 'El Fassi', prenom: 'Leila', structure: 'DP', dateNaissance: '1978-07-22', groupeSanguin: 'B+', patient: 'Leila Benkiran', date: '2025-06-21', diagnosis: 'Diabetes Type 2', treatment: 'Insulin adjustment', avatar: 'LB' },
    { id: 3, matricule: 'EMP003', nom: 'Farid', nomFille: 'Tazi', prenom: 'Omar', structure: 'URG', dateNaissance: '1990-11-08', groupeSanguin: 'O+', patient: 'Omar Farid', date: '2025-06-20', diagnosis: 'Post-surgery recovery', treatment: 'Wound care', avatar: 'OF' },
  ];

  const pendingAppointments = [
    { id: 1, matricule: 'EMP004', nom: 'El Fassi', nomFille: 'Cherkaoui', prenom: 'Amina', structure: 'CHIR', dateNaissance: '1982-04-12', groupeSanguin: 'AB+', patient: 'Amina El Fassi', date: '2025-06-26', time: '11:15', type: 'Consultation', avatar: 'AE' },
    { id: 2, matricule: 'EMP005', nom: 'Alami', nomFille: 'Benjelloun', prenom: 'Hassan', structure: 'CARD', dateNaissance: '1975-09-30', groupeSanguin: 'A-', patient: 'Hassan Alami', date: '2025-06-27', time: '15:30', type: 'Check-up', avatar: 'HA' },
  ];

  const handleStatClick = (statType: string) => {
    setSelectedStat(statType);
  };

  const getData = () => {
    switch (selectedStat) {
      case 'appointments':
        return totalAppointments;
      case 'patients':
        return todaysPatients;
      case 'completed':
        return completedAppointments;
      case 'pending':
        return pendingAppointments;
      default:
        return totalAppointments;
    }
  };

  const getTitle = () => {
    switch (selectedStat) {
      case 'appointments':
        return 'Employés Totaux';
      case 'patients':
        return 'Patients du Jour';
      case 'completed':
        return 'Terminés';
      case 'pending':
        return 'En Attente';
      default:
        return 'Employés Totaux';
    }
  };

  const getCount = () => {
    switch (selectedStat) {
      case 'appointments':
        return totalAppointments.length;
      case 'patients':
        return todaysPatients.length;
      case 'completed':
        return completedAppointments.length;
      case 'pending':
        return pendingAppointments.length;
      default:
        return totalAppointments.length;
    }
  };

  const renderTable = () => {
    const data = getData();
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Nom de fille</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Groupe sanguin</TableHead>
              {selectedStat === 'completed' && (
                <>
                  <TableHead>Date</TableHead>
                  <TableHead>Traitement</TableHead>
                </>
              )}
              {(selectedStat === 'appointments' || selectedStat === 'patients') && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.matricule}</TableCell>
                <TableCell>{item.nom}</TableCell>
                <TableCell>{item.nomFille}</TableCell>
                <TableCell>{item.prenom}</TableCell>
                <TableCell>{item.structure}</TableCell>
                <TableCell>{new Date(item.dateNaissance).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.groupeSanguin}</Badge>
                </TableCell>
                {selectedStat === 'completed' && (
                  <>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.treatment}</TableCell>
                  </>
                )}
                {(selectedStat === 'appointments' || selectedStat === 'patients') && (
                  <TableCell>
                    <Button variant="secondary" size="sm">
                      Détails
                    </Button>
                  </TableCell>
                )}
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Employés Totaux",
            value: totalAppointments.length,
            icon: <UserCheck className="h-5 w-5 text-medsuite-primary" />,
            type: 'appointments'
          },
          {
            title: "Patients du Jour",
            value: todaysPatients.length,
            icon: <Users className="h-5 w-5 text-medsuite-primary" />,
            type: 'patients'
          },
          {
            title: "Terminés",
            value: completedAppointments.length,
            icon: <CheckCircle className="h-5 w-5 text-medsuite-primary" />,
            type: 'completed'
          },
          {
            title: "En Attente",
            value: pendingAppointments.length,
            icon: <Clock className="h-5 w-5 text-medsuite-primary" />,
            type: 'pending'
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