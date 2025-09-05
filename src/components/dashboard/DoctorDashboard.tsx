import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pill,
  Navigation,
  Microscope,
  Image as ImageIcon,
  Ambulance,
  HeartPulse,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Info,
} from 'lucide-react';

// --- Type Definitions ---
type ServiceType = 'ordonnance' | 'orientation' | 'analyse' | 'imagerie' | 'evacuation' | 'soins';

interface Service {
  id: number;
  patient: string;
  date: string;
  status: string;
  medicaments?: string;
  specialite?: string;
  motif?: string;
  type?: string;
  tests?: string;
  region?: string;
  destination?: string;
  transport?: string;
  description?: string;
}

interface NewService {
  patient: string;
  date: string;
  status: string;
  medicaments?: string;
  specialite?: string;
  motif?: string;
  type?: string;
  tests?: string;
  region?: string;
  destination?: string;
  transport?: string;
  description?: string;
}

// --- Mock Data ---
const initialServices: Record<ServiceType, Service[]> = {
  ordonnance: [
    { id: 1, patient: 'Karim Salah', date: '2025-01-27', medicaments: 'Paracétamol 500mg', status: 'Prescrit' },
    { id: 2, patient: 'Leila Benkiran', date: '2025-01-27', medicaments: 'Insuline NPH', status: 'Prescrit' },
    { id: 3, patient: 'Omar Farid', date: '2025-01-27', medicaments: 'Amoxicilline 1g', status: 'Prescrit' },
  ],
  orientation: [
    { id: 1, patient: 'Amina El Fassi', date: '2025-01-27', specialite: 'Cardiologie', motif: 'Douleur thoracique', status: 'Référé' },
    { id: 2, patient: 'Hassan Alami', date: '2025-01-27', specialite: 'Dermatologie', motif: 'Lésion cutanée', status: 'Référé' },
  ],
  analyse: [
    { id: 1, patient: 'Sara El Idrissi', date: '2025-01-27', type: 'Sang', tests: 'Hémogramme, Glycémie', status: 'Demandé' },
    { id: 2, patient: 'Ahmed Mansouri', date: '2025-01-27', type: 'Urine', tests: 'ECBU, Créatinine', status: 'Demandé' },
    { id: 3, patient: 'Nadia Tazi', date: '2025-01-27', type: 'Sang', tests: 'Bilan lipidique, TSH', status: 'Demandé' },
  ],
  imagerie: [
    { id: 1, patient: 'Youssef Benali', date: '2025-01-27', type: 'Radiographie', region: 'Thorax', motif: 'Toux persistante', status: 'Demandé' },
    { id: 2, patient: 'Fatima Zahra', date: '2025-01-27', type: 'Échographie', region: 'Abdomen', motif: 'Douleur abdominale', status: 'Demandé' },
  ],
  evacuation: [
    { id: 1, patient: 'Karim Salah', date: '2025-01-27', destination: 'CHU Ibn Sina', motif: 'Appendicite aiguë', transport: 'Ambulance', status: 'Évacué' },
  ],
  soins: [
    { id: 1, patient: 'Leila Benkiran', date: '2025-01-27', type: 'Pansement', region: 'Pied droit', description: 'Pansement quotidien', status: 'Effectué' },
    { id: 2, patient: 'Omar Farid', date: '2025-01-27', type: 'Injection', description: 'Vitamine B12', status: 'Effectué' },
  ],
};

// --- Stats Widgets ---
const StatsWidgets = ({ services, selectedStat, handleStatClick }: { 
  services: Record<ServiceType, Service[]>, 
  selectedStat: ServiceType, 
  handleStatClick: (type: ServiceType) => void 
}) => {
  const stats = [
    { title: 'Ordonnances', value: services.ordonnance.length, icon: Pill, type: 'ordonnance' as ServiceType },
    { title: 'Orientations', value: services.orientation.length, icon: Navigation, type: 'orientation' as ServiceType },
    { title: 'Analyses', value: services.analyse.length, icon: Microscope, type: 'analyse' as ServiceType },
    { title: 'Imagerie', value: services.imagerie.length, icon: ImageIcon, type: 'imagerie' as ServiceType },
    { title: 'Évacuations', value: services.evacuation.length, icon: Ambulance, type: 'evacuation' as ServiceType },
    { title: 'Soins', value: services.soins.length, icon: HeartPulse, type: 'soins' as ServiceType },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.type}
          className={`stats-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-gray-50 to-gray-100 ${selectedStat === stat.type ? 'ring-2 ring-medsuite-primary' : ''}`}
          onClick={() => handleStatClick(stat.type)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
            <stat.icon className="h-5 w-5 text-medsuite-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Main Dashboard Component ---
export const DoctorDashboard = () => {
  const { userRole } = useAuth();
  const [selectedStat, setSelectedStat] = useState<ServiceType>('ordonnance');
  const [services, setServices] = useState<Record<ServiceType, Service[]>>(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<Service | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Service | null>(null);
  const [newService, setNewService] = useState<NewService>({
    patient: '',
    date: new Date().toISOString().split('T')[0],
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const statuses = [...new Set(services[selectedStat].map(s => s.status)), 'all'];

  const filteredServices = useMemo(() => {
    return services[selectedStat].filter(service => {
      const matchesSearch = service.patient.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, selectedStat, searchQuery, statusFilter]);

  const handleStatClick = (statType: ServiceType) => {
    setSelectedStat(statType);
    setSearchQuery('');
    setStatusFilter('all');
  };

  const getTitle = () => {
    const titles: Record<ServiceType, string> = {
      ordonnance: 'Ordonnances du Jour',
      orientation: 'Orientations du Jour',
      analyse: 'Analyses du Jour',
      imagerie: 'Imagerie du Jour',
      evacuation: 'Évacuations du Jour',
      soins: 'Soins du Jour',
    };
    return titles[selectedStat] || 'Services du Jour';
  };

  const handleAddService = () => {
    if (newService.patient && newService.status) {
      const newId = services[selectedStat].length + 1;
      setServices({
        ...services,
        [selectedStat]: [
          ...services[selectedStat],
          { id: newId, ...newService },
        ],
      });
      setNewService({ patient: '', date: new Date().toISOString().split('T')[0], status: '' });
      setShowAddDialog(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleEditService = () => {
    if (editingService && newService.patient && newService.status) {
      setServices({
        ...services,
        [selectedStat]: services[selectedStat].map((service) =>
          service.id === editingService.id ? { ...newService, id: service.id } : service
        ),
      });
      setNewService({ patient: '', date: new Date().toISOString().split('T')[0], status: '' });
      setEditingService(null);
      setShowAddDialog(false);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteService = (id: number) => {
    setServices({
      ...services,
      [selectedStat]: services[selectedStat].filter((service) => service.id !== id),
    });
    setShowDeleteDialog(null);
  };

  const renderTable = () => {
    if (filteredServices.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Aucun service de ce type aujourd'hui
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 text-sm py-2">Patient</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm py-2">Date</TableHead>
              {selectedStat === 'ordonnance' && <TableHead className="font-semibold text-gray-700 text-sm py-2">Médicaments</TableHead>}
              {selectedStat === 'orientation' && (
                <>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Spécialité</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Motif</TableHead>
                </>
              )}
              {selectedStat === 'analyse' && (
                <>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Tests</TableHead>
                </>
              )}
              {selectedStat === 'imagerie' && (
                <>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Région</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Motif</TableHead>
                </>
              )}
              {selectedStat === 'evacuation' && (
                <>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Destination</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Motif</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Transport</TableHead>
                </>
              )}
              {selectedStat === 'soins' && (
                <>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm py-2">Détails</TableHead>
                </>
              )}
              <TableHead className="font-semibold text-gray-700 text-sm py-2 w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900 text-sm py-2">{item.patient}</TableCell>
                <TableCell className="text-sm py-2">{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                {selectedStat === 'ordonnance' && <TableCell className="text-sm py-2">{item.medicaments}</TableCell>}
                {selectedStat === 'orientation' && (
                  <>
                    <TableCell className="text-sm py-2">{item.specialite}</TableCell>
                    <TableCell className="text-sm py-2">{item.motif}</TableCell>
                  </>
                )}
                {selectedStat === 'analyse' && (
                  <>
                    <TableCell className="text-sm py-2">{item.type}</TableCell>
                    <TableCell className="text-sm py-2">{item.tests}</TableCell>
                  </>
                )}
                {selectedStat === 'imagerie' && (
                  <>
                    <TableCell className="text-sm py-2">{item.type}</TableCell>
                    <TableCell className="text-sm py-2">{item.region}</TableCell>
                    <TableCell className="text-sm py-2">{item.motif}</TableCell>
                  </>
                )}
                {selectedStat === 'evacuation' && (
                  <>
                    <TableCell className="text-sm py-2">{item.destination}</TableCell>
                    <TableCell className="text-sm py-2">{item.motif}</TableCell>
                    <TableCell className="text-sm py-2">{item.transport}</TableCell>
                  </>
                )}
                {selectedStat === 'soins' && (
                  <>
                    <TableCell className="text-sm py-2">{item.type}</TableCell>
                    <TableCell className="text-sm py-2">
                      {item.region && `${item.region} - `}
                      {item.description}
                    </TableCell>
                  </>
                )}
                <TableCell className="py-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" title="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setShowDetailsDialog(item)}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingService(item);
                                setNewService({ ...item });
                                setShowAddDialog(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setShowDeleteDialog(item)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>More Actions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Details Dialog */}
                  <Dialog open={showDetailsDialog?.id === item.id} onOpenChange={(open) => setShowDetailsDialog(open ? item : null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.patient} - {getTitle()}</DialogTitle>
                        <DialogDescription>Service Details</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Patient:</strong> {item.patient}</div>
                          <div><strong>Date:</strong> {new Date(item.date).toLocaleDateString('fr-FR')}</div>
                          <div><strong>Status:</strong> {item.status}</div>
                          {item.medicaments && <div><strong>Médicaments:</strong> {item.medicaments}</div>}
                          {item.specialite && <div><strong>Spécialité:</strong> {item.specialite}</div>}
                          {item.motif && <div><strong>Motif:</strong> {item.motif}</div>}
                          {item.type && <div><strong>Type:</strong> {item.type}</div>}
                          {item.tests && <div><strong>Tests:</strong> {item.tests}</div>}
                          {item.region && <div><strong>Région:</strong> {item.region}</div>}
                          {item.destination && <div><strong>Destination:</strong> {item.destination}</div>}
                          {item.transport && <div><strong>Transport:</strong> {item.transport}</div>}
                          {item.description && <div><strong>Description:</strong> {item.description}</div>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsDialog(null)}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <AlertDialog open={showDeleteDialog?.id === item.id} onOpenChange={(open) => setShowDeleteDialog(open ? item : null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the service for {item.patient}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <DialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteService(item.id)}>Delete</AlertDialogAction>
                      </DialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <AppLayout title="Doctor Dashboard">
      <div className="min-h-screen w-full bg-gray-50">
        <main className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
          <StatsWidgets services={services} selectedStat={selectedStat} handleStatClick={handleStatClick} />
          <Card className="shadow-md border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">{getTitle()}</CardTitle>
                  <CardDescription>Manage today's medical services</CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                      <DialogDescription>
                        {editingService ? 'Modify the service details below.' : 'Enter the details for the new service.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="patient" className="text-right">Patient</label>
                        <Input
                          id="patient"
                          value={newService.patient}
                          onChange={(e) => setNewService({ ...newService, patient: e.target.value })}
                          placeholder="Enter patient name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="date" className="text-right">Date</label>
                        <Input
                          id="date"
                          type="date"
                          value={newService.date}
                          onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right">Status</label>
                        <Select
                          value={newService.status}
                          onValueChange={(value) => setNewService({ ...newService, status: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.filter(s => s !== 'all').map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedStat === 'ordonnance' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="medicaments" className="text-right">Médicaments</label>
                          <Input
                            id="medicaments"
                            value={newService.medicaments || ''}
                            onChange={(e) => setNewService({ ...newService, medicaments: e.target.value })}
                            placeholder="Enter medicaments"
                            className="col-span-3"
                          />
                        </div>
                      )}
                      {selectedStat === 'orientation' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="specialite" className="text-right">Spécialité</label>
                            <Input
                              id="specialite"
                              value={newService.specialite || ''}
                              onChange={(e) => setNewService({ ...newService, specialite: e.target.value })}
                              placeholder="Enter specialty"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="motif" className="text-right">Motif</label>
                            <Input
                              id="motif"
                              value={newService.motif || ''}
                              onChange={(e) => setNewService({ ...newService, motif: e.target.value })}
                              placeholder="Enter reason"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      {selectedStat === 'analyse' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="type" className="text-right">Type</label>
                            <Input
                              id="type"
                              value={newService.type || ''}
                              onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                              placeholder="Enter analysis type"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="tests" className="text-right">Tests</label>
                            <Input
                              id="tests"
                              value={newService.tests || ''}
                              onChange={(e) => setNewService({ ...newService, tests: e.target.value })}
                              placeholder="Enter tests"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      {selectedStat === 'imagerie' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="type" className="text-right">Type</label>
                            <Input
                              id="type"
                              value={newService.type || ''}
                              onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                              placeholder="Enter imaging type"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="region" className="text-right">Région</label>
                            <Input
                              id="region"
                              value={newService.region || ''}
                              onChange={(e) => setNewService({ ...newService, region: e.target.value })}
                              placeholder="Enter region"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="motif" className="text-right">Motif</label>
                            <Input
                              id="motif"
                              value={newService.motif || ''}
                              onChange={(e) => setNewService({ ...newService, motif: e.target.value })}
                              placeholder="Enter reason"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      {selectedStat === 'evacuation' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="destination" className="text-right">Destination</label>
                            <Input
                              id="destination"
                              value={newService.destination || ''}
                              onChange={(e) => setNewService({ ...newService, destination: e.target.value })}
                              placeholder="Enter destination"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="motif" className="text-right">Motif</label>
                            <Input
                              id="motif"
                              value={newService.motif || ''}
                              onChange={(e) => setNewService({ ...newService, motif: e.target.value })}
                              placeholder="Enter reason"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="transport" className="text-right">Transport</label>
                            <Input
                              id="transport"
                              value={newService.transport || ''}
                              onChange={(e) => setNewService({ ...newService, transport: e.target.value })}
                              placeholder="Enter transport"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      {selectedStat === 'soins' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="type" className="text-right">Type</label>
                            <Input
                              id="type"
                              value={newService.type || ''}
                              onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                              placeholder="Enter care type"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="region" className="text-right">Région</label>
                            <Input
                              id="region"
                              value={newService.region || ''}
                              onChange={(e) => setNewService({ ...newService, region: e.target.value })}
                              placeholder="Enter region (optional)"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="description" className="text-right">Description</label>
                            <Input
                              id="description"
                              value={newService.description || ''}
                              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                              placeholder="Enter description"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewService({ patient: '', date: new Date().toISOString().split('T')[0], status: '' });
                          setEditingService(null);
                          setShowAddDialog(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={editingService ? handleEditService : handleAddService}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {editingService ? 'Save Changes' : 'Save Service'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search services by patient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Search services"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.filter(s => s !== 'all').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                renderTable()
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AppLayout>
  );
};

export default DoctorDashboard;