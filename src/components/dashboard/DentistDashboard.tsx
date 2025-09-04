import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppLayout from '@/components/layout/AppLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ToothCondition {
  id: number;
  name: string;
  color: string;
}

const toothConditions: ToothCondition[] = [
  { id: 1, name: 'Healthy', color: '#8BC34A' },
  { id: 2, name: 'Cavity', color: '#FFEB3B' },
  { id: 3, name: 'Filling', color: '#9E9E9E' },
  { id: 4, name: 'Root Canal', color: '#FF9800' },
  { id: 5, name: 'Extraction', color: '#F44336' },
  { id: 6, name: 'Implant', color: '#2196F3' },
  { id: 7, name: 'Crown', color: '#607D8B' },
];

interface PatientToothData {
  conditionId: number;
  diagnosis: string;
  treatmentPlan: string;
  history: string[];
}

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  contact: string;
  teeth: { [toothNumber: string]: PatientToothData };
}

const initializeTeethData = () => {
  const teeth: { [toothNumber: string]: PatientToothData } = {};
  for (let i = 11; i <= 18; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 21; i <= 28; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 31; i <= 38; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 41; i <= 48; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  return teeth;
};

const DentistPage: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientContact, setNewPatientContact] = useState('');

  // Load initial patient data or from a "database"
  useEffect(() => {
    // Simulate loading existing patients
    const defaultPatient: PatientData = {
      id: 'P001',
      name: 'John Doe',
      dateOfBirth: '1990-05-15',
      contact: 'john.doe@example.com',
      teeth: initializeTeethData(),
    };
    const defaultPatient2: PatientData = {
      id: 'P002',
      name: 'Jane Smith',
      dateOfBirth: '1985-11-20',
      contact: 'jane.smith@example.com',
      teeth: initializeTeethData(),
    };
    setPatients([defaultPatient, defaultPatient2]); // Set both patients
  }, []);

  const currentPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
  };

  const updatePatientTeethData = (toothNumber: string, data: Partial<PatientToothData>) => {
    if (!currentPatient) return;

    setPatients(prevPatients => prevPatients.map(p =>
      p.id === currentPatient.id
        ? {
            ...p,
            teeth: {
              ...p.teeth,
              [toothNumber]: {
                ...p.teeth[toothNumber],
                ...data,
              },
            },
          }
        : p
    ));
  };

  const handleConditionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedTooth) {
      updatePatientTeethData(selectedTooth.toString(), { conditionId: parseInt(event.target.value) });
    }
  };

  const handleDiagnosisChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedTooth) {
      updatePatientTeethData(selectedTooth.toString(), { diagnosis: event.target.value });
    }
  };

  const handleTreatmentPlanChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedTooth) {
      updatePatientTeethData(selectedTooth.toString(), { treatmentPlan: event.target.value });
    }
  };

  const addHistoryEntry = (toothNumber: number, entry: string) => {
    if (!currentPatient) return;
    const currentHistory = currentPatient.teeth[toothNumber.toString()]?.history || [];
    updatePatientTeethData(toothNumber.toString(), { history: [...currentHistory, entry] });
  };

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
    setSelectedPatientId(newPatientId);
    setShowAddPatientDialog(false);
    setNewPatientName('');
    setNewPatientDob('');
    setNewPatientContact('');
  };

  const handlePatientSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(event.target.value);
    setSelectedTooth(null); // Reset selected tooth when patient changes
  };

  const renderTooth = (toothNumber: number) => {
    const toothInfo = currentPatient?.teeth[toothNumber.toString()];
    const condition = toothConditions.find((c) => c.id === toothInfo?.conditionId);
    const fillColor = condition ? condition.color : '#FFFFFF';

    return (
      <div
        key={toothNumber}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 cursor-pointer transition-all duration-200 ease-in-out
          ${selectedTooth === toothNumber ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-300'}
        `}
        style={{ backgroundColor: fillColor }}
        onClick={() => handleToothSelect(toothNumber)}
        title={`Tooth ${toothNumber}: ${condition?.name || 'Unknown'}`}
      >
        {toothNumber}
      </div>
    );
  };

  const currentToothData = selectedTooth && currentPatient ? currentPatient.teeth[selectedTooth.toString()] : null;

  const getDiagnosisSummary = () => {
    if (!currentPatient) return [];
    const summary: { tooth: string; diagnosis: string; condition: string }[] = [];
    for (const toothNumber in currentPatient.teeth) {
      const toothData = currentPatient.teeth[toothNumber];
      if (toothData.diagnosis) {
        const condition = toothConditions.find(c => c.id === toothData.conditionId)?.name || 'N/A';
        summary.push({ tooth: toothNumber, diagnosis: toothData.diagnosis, condition: condition });
      }
    }
    return summary;
  };

  return (
    <AppLayout title="Dentist Dashboard">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-1 flex p-6 space-x-6">
          {/* Left Panel: Patient Details, Patient Selector & 2D Teeth Model */}
          <div className="w-2/3 bg-white rounded-lg shadow-lg p-6 flex flex-col">
            <section className="mb-6 border-b pb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Patient Management</h2>
              <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowAddPatientDialog(true)}>Add New Patient</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientName" className="text-right">Name</Label>
                      <Input id="patientName" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientDob" className="text-right">Date of Birth</Label>
                      <Input id="patientDob" type="date" value={newPatientDob} onChange={(e) => setNewPatientDob(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientContact" className="text-right">Contact</Label>
                      <Input id="patientContact" value={newPatientContact} onChange={(e) => setNewPatientContact(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddNewPatient}>Add Patient</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>

            <section className="mb-6 border-b pb-4">
              {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Patient Details</h2> */}
              <div className="mb-4">
                <label htmlFor="patient-select" className="block text-gray-700 text-sm font-bold mb-2">Select Patient</label>
                <select
                  id="patient-select"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedPatientId || ''}
                  onChange={handlePatientSelect}
                >
                  <option value="">-- Select a Patient --</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id})
                    </option>
                  ))}
                </select>
              </div>
              {currentPatient ? (
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p><strong>Patient ID:</strong> {currentPatient.id}</p>
                    <p><strong>Name:</strong> {currentPatient.name}</p>
                  </div>
                  <div>
                    <p><strong>Date of Birth:</strong> {currentPatient.dateOfBirth}</p>
                    <p><strong>Contact:</strong> {currentPatient.contact}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No patient selected.</p>
              )}
            </section>

            {currentPatient && getDiagnosisSummary().length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Diagnosis Information</CardTitle>
                  <CardDescription>Summary of diagnoses for the current patient.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tooth</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Diagnosis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDiagnosisSummary().map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.tooth}</TableCell>
                          <TableCell><Badge style={{ backgroundColor: toothConditions.find(c => c.name === entry.condition)?.color || '#ccc' }}>{entry.condition}</Badge></TableCell>
                          <TableCell>{entry.diagnosis}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <section className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dental Chart (2D Model)</h2>
              <div className="relative w-full h-96 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-8 gap-2 p-4 max-w-lg">
                  <div className="col-span-8 text-center text-sm text-gray-500 mb-2">Upper Jaw</div>
                  {[18, 17, 16, 15, 14, 13, 12, 11].map(renderTooth)}
                  {[21, 22, 23, 24, 25, 26, 27, 28].map(renderTooth)}

                  <div className="col-span-8 text-center text-sm text-gray-500 mt-4 mb-2">Lower Jaw</div>
                  {[48, 47, 46, 45, 44, 43, 42, 41].map(renderTooth)}
                  {[31, 32, 33, 34, 35, 36, 37, 38].map(renderTooth)}
                </div>

                {selectedTooth && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full animate-bounce">
                    Tooth {selectedTooth} selected!
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {toothConditions.map((condition) => (
                  <span
                    key={condition.id}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: condition.color, color: '#333' }}
                  >
                    {condition.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Panel: Tooth Details & Records */}
          <div className="w-1/3 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tooth Details & Records</h2>
            {!selectedPatientId ? (
              <p className="text-gray-600">Please select a patient to view their dental records.</p>
            ) : !selectedTooth ? (
              <p className="text-gray-600">Select a tooth on the dental chart to view and edit its details.</p>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-blue-700 mb-4">Details for Tooth {selectedTooth}</h3>

                <div className="mb-4">
                  <label htmlFor="tooth-condition" className="block text-gray-700 text-sm font-bold mb-2">
                    Condition/Stage
                  </label>
                  <select
                    id="tooth-condition"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={currentToothData?.conditionId || ''}
                    onChange={handleConditionChange}
                  >
                    <option value="">Select a condition</option>
                    {toothConditions.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="diagnosis" className="block text-gray-700 text-sm font-bold mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    id="diagnosis"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                    placeholder="Enter diagnosis for this tooth..."
                    value={currentToothData?.diagnosis || ''}
                    onChange={handleDiagnosisChange}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="treatment-plan" className="block text-gray-700 text-sm font-bold mb-2">
                    Treatment Plan
                  </label>
                  <textarea
                    id="treatment-plan"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                    placeholder="Enter treatment plan for this tooth..."
                    value={currentToothData?.treatmentPlan || ''}
                    onChange={handleTreatmentPlanChange}
                  ></textarea>
                </div>

                <div>
                  <h4 className="text-md font-bold text-gray-700 mb-2">History</h4>
                  <ul className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
                    {currentToothData?.history.length === 0 ? (
                      <li className="text-gray-500 italic">No history recorded for this tooth.</li>
                    ) : (
                      currentToothData?.history.map((entry, index) => (
                        <li key={index} className="text-sm text-gray-700 mb-1">
                          - {entry}
                        </li>
                      ))
                    )}
                  </ul>
                  <button
                    className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                    onClick={() => addHistoryEntry(selectedTooth, `Treatment updated on ${new Date().toLocaleDateString()}`)}
                  >
                    Add History Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default DentistPage;