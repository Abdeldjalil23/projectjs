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
import SimpleDentalChart from '@/components/dental/SimpleDentalChart';
import DentalChart3D from '@/components/dental/DentalChart3D';
import ToothInfoPanel from '@/components/dental/ToothInfoPanel';

// حالات الأسنان
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

// بيانات الأسنان
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

// تهيئة بيانات الأسنان
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
  const [is3DView, setIs3DView] = useState(true);

  // Load initial patient data or from a "database"
  useEffect(() => {
    // Simulate loading existing patients
    const defaultPatient: PatientData = {
      id: '1234I',
      name: 'Ahmed ben ali',
      dateOfBirth: '2000-10-10',
      contact: 'ahmed@gmail.com',
      teeth: initializeTeethData(),
    };
    const defaultPatient2: PatientData = {
      id: '1234F',
      name: 'Ali haroze',
      dateOfBirth: '2001-20-31',
      contact: 'ali@gmail.com',
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
            <section className="mb-6 border-b pb-4">
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Dental Chart {is3DView ? '(3D Model)' : '(2D Model)'}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={is3DView ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIs3DView(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    3D View
                  </Button>
                  <Button
                    variant={!is3DView ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIs3DView(false)}
                  >
                    2D View
                  </Button>
                </div>
              </div>
              
              {is3DView ? (
                <DentalChart3D
                  teeth={currentPatient?.teeth || {}}
                  onToothSelect={handleToothSelect}
                  selectedTooth={selectedTooth}
                  toothConditions={toothConditions}
                />
              ) : (
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
              )}
              
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
          <div className="w-1/3">
            <ToothInfoPanel
              toothNumber={selectedTooth}
              toothData={currentToothData}
              toothConditions={toothConditions}
              onConditionChange={(conditionId) => {
                if (selectedTooth) {
                  updatePatientTeethData(selectedTooth.toString(), { conditionId });
                }
              }}
              onDiagnosisChange={(diagnosis) => {
                if (selectedTooth) {
                  updatePatientTeethData(selectedTooth.toString(), { diagnosis });
                }
              }}
              onTreatmentPlanChange={(treatmentPlan) => {
                if (selectedTooth) {
                  updatePatientTeethData(selectedTooth.toString(), { treatmentPlan });
                }
              }}
              onAddHistoryEntry={(entry) => {
                if (selectedTooth) {
                  addHistoryEntry(selectedTooth, entry);
                }
              }}
            />
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default DentistPage;
