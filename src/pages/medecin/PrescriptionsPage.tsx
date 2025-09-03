
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, FilePlus, FileText, Calendar, User, Pill, Download, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const PrescriptionsPage = () => {
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const prescriptions = [
    {
      id: 1,
      patientName: 'Ahmed Boulmerka',
      doctor: 'Dr. Mohammed Ali',
      date: '12 Mar, 2025',
      expiryDate: '12 Jun, 2025',
      status: 'Active',
      medications: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours', duration: '5 days' },
        { name: 'Vitamin C 1000mg', dosage: '1 tablet daily', duration: '30 days' }
      ]
    },
    {
      id: 2,
      patientName: 'Samira Hamdani',
      doctor: 'Dr. Fatima Zahra',
      date: '10 Mar, 2025',
      expiryDate: '10 Apr, 2025',
      status: 'Active',
      medications: [
        { name: 'Amoxicillin 500mg', dosage: '1 capsule three times daily', duration: '7 days' },
        { name: 'Ibuprofen 400mg', dosage: '1 tablet when needed', duration: '7 days' }
      ]
    },
    {
      id: 3,
      patientName: 'Ibrahim Nacer',
      doctor: 'Dr. Karim Benzema',
      date: '05 Feb, 2025',
      expiryDate: '05 Mar, 2025',
      status: 'Expired',
      medications: [
        { name: 'Atorvastatin 20mg', dosage: '1 tablet daily at night', duration: '30 days' }
      ]
    }
  ];

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.medications.some(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pageTitle = userRole === 'patient' ? 'My Prescriptions' : 'Prescriptions';

  return (
    <AppLayout title={pageTitle}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>View and manage prescriptions</CardDescription>
          </div>
          {userRole === 'doctor' && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prescriptions or medications..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {userRole === 'doctor' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Sort</Button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="bg-card overflow-hidden">
                  <div className={`h-1 w-full ${prescription.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <CardContent className="p-4 mt-2">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-medium">
                            {userRole === 'patient' ? 'Prescribed by' : 'Patient'}: {' '}
                            <span className="text-medsuite-primary">
                              {userRole === 'patient' ? prescription.doctor : prescription.patientName}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-x-6 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Issued: {prescription.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              Expiry: {prescription.expiryDate}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${
                          prescription.status === 'Active' ? 'border-green-500 text-green-500' : 
                          'border-red-500 text-red-500'
                        }`}>
                          {prescription.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Pill className="mr-2 h-4 w-4" />
                        Medications
                      </h4>
                      <ul className="pl-6 list-disc space-y-1">
                        {prescription.medications.map((medication, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{medication.name}</span> - {medication.dosage}, for {medication.duration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No prescriptions found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default PrescriptionsPage;
