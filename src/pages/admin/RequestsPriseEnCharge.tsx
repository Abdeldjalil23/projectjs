import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  PlusIcon,
  SearchIcon,
  EditIcon,
  EyeIcon,
  DownloadIcon,
  ArrowUpDown,
} from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';

// Types (unchanged)
type CoverageRequest = {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  requestType: 'medical' | 'dental' | 'vision' | 'pharmacy' | 'other';
  description: string;
  amount: number;
  requestDate: string;
  status: 'nouvelles' | 'en_cours' | 'validees' | 'rejetees';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: string;
  documents?: string[];
  estimatedProcessingTime?: string;
  rejectionReason?: string;
  socialWorkerName?: string;
  socialWorkerDepartment?: string;
};

// Mock Data (unchanged)
const coverageRequestsData: CoverageRequest[] = [
  // ... (same as provided in the original code)
];

// Utility functions (unchanged)
const sortRequests = (requests: CoverageRequest[], key: keyof CoverageRequest, direction: 'asc' | 'desc') => {
  return [...requests].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return direction === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
};

// Main Component
const RequestsPriseEnChargePage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof CoverageRequest>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredRequests = useMemo(() => {
    let result = coverageRequestsData.filter(request => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    return sortRequests(result, sortKey, sortDirection);
  }, [searchQuery, sortKey, sortDirection, filterStatus]);

  const handleSort = (key: keyof CoverageRequest) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const downloadReport = () => {
    // Mock report download
    alert('Downloading report...');
  };

  return (
    <AppLayout title="Gestion des Demandes de Prise en Charge">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          

          {/* Requests Tab */}
          <TabsContent value="requests">
            {/* Statistics Cards (only validees and rejetees) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {['validees', 'rejetees'].map((status) => (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`border-0 shadow-md ${
                      status === 'validees' ? 'bg-gradient-to-br from-emerald-50 to-green-50' :
                      'bg-gradient-to-br from-red-50 to-rose-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {coverageRequestsData.filter(r => r.status === status).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                          <ClipboardCheck className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Removed "Liste des Demandes" */}
                  <div className="flex items-center gap-3">
                    <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
                      <DialogContent className="max-w-2xl bg-white rounded-2xl shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-gray-900">Créer une Nouvelle Demande</DialogTitle>
                          <DialogDescription className="text-gray-600 text-base">
                            Soumettre une nouvelle demande de prise en charge sanitaire pour un employé.
                          </DialogDescription>
                        </DialogHeader>
                        <form className="grid gap-6 py-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="employeeName" className="text-sm font-semibold text-gray-700">Nom de l'Employé</Label>
                              <Input
                                id="employeeName"
                                placeholder="Entrer le nom de l'employé"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="requestType" className="text-sm font-semibold text-gray-700">Type de Demande</Label>
                              <Select>
                                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Sélectionner le type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="medical">Médical</SelectItem>
                                  <SelectItem value="dental">Dentaire</SelectItem>
                                  <SelectItem value="vision">Vision</SelectItem>
                                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                                  <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <Input
                              id="description"
                              placeholder="Décrire la demande de prise en charge"
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Montant</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priorité</Label>
                              <Select>
                                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Sélectionner la priorité" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Faible</SelectItem>
                                  <SelectItem value="medium">Moyenne</SelectItem>
                                  <SelectItem value="high">Élevée</SelectItem>
                                  <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </form>
                        <DialogFooter className="gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowNewRequestDialog(false)}
                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Annuler
                          </Button>
                          <Button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                            Soumettre la Demande
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom, description ou ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      aria-label="Search requests"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="validees">Validées</SelectItem>
                      <SelectItem value="rejetees">Rejetées</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="px-3 py-1 text-sm self-center">
                    {filteredRequests.length} résultat{filteredRequests.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Requests Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700 py-4">
                            <button
                              className="flex items-center gap-1"
                              onClick={() => handleSort('employeeName')}
                              aria-label="Sort by employee name"
                            >
                              Nom de l'Employé
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4">
                            Type de Demande
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4">
                            Description
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4">
                            <button
                              className="flex items-center gap-1"
                              onClick={() => handleSort('requestDate')}
                              aria-label="Sort by request date"
                            >
                              Date de Demande
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4 text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredRequests.map((request, index) => (
                            <motion.tr
                              key={request.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`hover:bg-gray-50 transition-colors duration-150 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <TableCell className="py-4">
                                <div className="font-semibold text-gray-900">{request.employeeName}</div>
                                <div className="text-sm text-gray-500">{request.department}</div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  variant="outline"
                                  className={`px-3 py-1 text-xs font-medium ${
                                    request.requestType === 'medical' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                    request.requestType === 'dental' ? 'border-green-200 text-green-700 bg-green-50' :
                                    request.requestType === 'vision' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                                    request.requestType === 'pharmacy' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                    'border-gray-200 text-gray-700 bg-gray-50'
                                  }`}
                                >
                                  {request.requestType === 'medical' ? 'Médical' :
                                   request.requestType === 'dental' ? 'Dentaire' :
                                   request.requestType === 'vision' ? 'Vision' :
                                   request.requestType === 'pharmacy' ? 'Pharmacie' :
                                   'Autre'}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 max-w-xs truncate">
                                <div className="text-gray-900">{request.description}</div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-gray-900 font-medium">{request.requestDate}</div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Tooltip.Provider>
                                    <Tooltip.Root>
                                      <Tooltip.Trigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                          aria-label="View request details"
                                        >
                                          <EyeIcon className="h-4 w-4" />
                                        </Button>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Voir les détails
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                    <Tooltip.Root>
                                      <Tooltip.Trigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                          aria-label="Edit request"
                                        >
                                          <EditIcon className="h-4 w-4" />
                                        </Button>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        Modifier la demande
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RequestsPriseEnChargePage;