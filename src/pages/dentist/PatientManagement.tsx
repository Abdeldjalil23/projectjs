import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/layout/AppLayout';

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  contact: string;
  teeth: { [toothNumber: string]: PatientToothData };
}

interface PatientToothData {
  conditionId: number;
  diagnosis: string;
  treatmentPlan: string;
  history: string[];
}

const initializeTeethData = () => {
  const teeth: { [toothNumber: string]: PatientToothData } = {};
  for (let i = 11; i <= 18; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 21; i <= 28; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 31; i <= 38; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 41; i <= 48; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  return teeth;
};

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([
    {
      id: '1234I',
      name: 'Ahmed ben ali',
      dateOfBirth: '2000-10-10',
      contact: 'ahmed@gmail.com',
      teeth: initializeTeethData(),
    },
    {
      id: '1234F',
      name: 'Ali haroze',
      dateOfBirth: '2001-10-31',
      contact: 'ali@gmail.com',
      teeth: initializeTeethData(),
    },
  ]);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientContact, setNewPatientContact] = useState('');

  const handleAddNewPatient = () => {
    if (!newPatientName || !newPatientDob || !newPatientContact) {
      alert('Please fill in all patient details.');
      return;
    }
    const newPatientId = `P${(patients.length + 1).toString().padStart(3, '0')}`;
    const newPatient: PatientData = {
      id: newPatientId,
      name: newPatientName,
      dateOfBirth: newPatientDob,
      contact: newPatientContact,
      teeth: initializeTeethData(),
    };
    setPatients(prev => [...prev, newPatient]);
    setShowAddPatientDialog(false);
    setNewPatientName('');
    setNewPatientDob('');
    setNewPatientContact('');
  };

  return (
    <AppLayout title="Patient Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Patient Management</CardTitle>
            <CardDescription>Manage patient records and add new patients to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-700 text-white">Add New Patient</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dob" className="text-right">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={newPatientDob}
                        onChange={(e) => setNewPatientDob(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contact" className="text-right">Contact</Label>
                      <Input
                        id="contact"
                        value={newPatientContact}
                        onChange={(e) => setNewPatientContact(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter contact email or phone"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddPatientDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddNewPatient}
                      className="bg-blue-500 hover:bg-blue-700 text-white"
                    >
                      Save Patient
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      {/* No patients found. */}
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.dateOfBirth}</TableCell>
                      <TableCell>{patient.contact}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PatientManagement;