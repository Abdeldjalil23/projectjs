import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, ClipboardList, User, Stethoscope } from 'lucide-react';

const SyntheseActivitesPage = () => {
  const { userRole } = useAuth();

  if (userRole !== 'doctor') {
    return (
      <AppLayout title="Accès refusé">
        <div className="p-6 text-center text-muted-foreground">
          Cette page est réservée aux médecins.
        </div>
      </AppLayout>
    );
  }

  // Mock stats data
  const stats = [
    { title: 'Consultations totales', value: 128, icon: <Stethoscope className="h-5 w-5" />, color: 'bg-green-100' },
    { title: 'Patients uniques', value: 85, icon: <User className="h-5 w-5" />, color: 'bg-blue-100' },
    { title: 'Suivis réalisés', value: 42, icon: <ClipboardList className="h-5 w-5" />, color: 'bg-yellow-100' },
    { title: 'Rapports médicaux', value: 30, icon: <BarChart2 className="h-5 w-5" />, color: 'bg-gray-100' },
  ];

  // Mock recent activities
  const recent = [
    { date: '2025-06-20', patient: 'Amine Boukhelfa', type: 'Consultation', note: 'Fièvre persistante' },
    { date: '2025-06-19', patient: 'Lina Mebarki', type: 'Suivi', note: 'Post-opératoire contrôle' },
    { date: '2025-06-18', patient: 'Yacine Bensaid', type: 'Rapport', note: 'Analyse complète envoyée' },
  ];

  return (
    <AppLayout title="Synthèse des Activités">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center gap-4 p-4">
            <div className={`p-2 rounded-md ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activités Récentes</CardTitle>
          <CardDescription>Liste des dernières actions médicales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.map((act, i) => (
            <div key={i} className="p-3 border rounded-lg flex justify-between items-start">
              <div>
                <p className="font-medium">{act.patient}</p>
                <p className="text-sm text-muted-foreground">{act.note}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{act.date}</p>
                <Badge variant="outline">{act.type}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SyntheseActivitesPage;
