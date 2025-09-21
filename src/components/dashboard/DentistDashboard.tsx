import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ToothInfoPanel from "@/components/dental/ToothInfoPanel";

// حالات الأسنان
interface ToothCondition {
  id: number;
  name: string;
  color: string;
}

const toothConditions: ToothCondition[] = [
  { id: 1, name: "Healthy", color: "transparent" },
  { id: 2, name: "Cavity", color: "#FFEB3B" },
  { id: 3, name: "Filling", color: "#9E9E9E" },
  { id: 4, name: "Root Canal", color: "#FF9800" },
  { id: 5, name: "Extraction", color: "#F44336" },
  { id: 6, name: "Implant", color: "#2196F3" },
  { id: 7, name: "Crown", color: "#607D8B" },
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
  for (let i = 11; i <= 18; i++)
    teeth[i.toString()] = { conditionId: 1, diagnosis: "", treatmentPlan: "", history: ["Initial checkup"] };
  for (let i = 21; i <= 28; i++)
    teeth[i.toString()] = { conditionId: 1, diagnosis: "", treatmentPlan: "", history: ["Initial checkup"] };
  for (let i = 31; i <= 38; i++)
    teeth[i.toString()] = { conditionId: 1, diagnosis: "", treatmentPlan: "", history: ["Initial checkup"] };
  for (let i = 41; i <= 48; i++)
    teeth[i.toString()] = { conditionId: 1, diagnosis: "", treatmentPlan: "", history: ["Initial checkup"] };
  return teeth;
};

// إحداثيات الأسنان (يمكن استخدام top/bottom و left/right)
const toothPositions: {
  number: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}[] = [
  { number: 18, top: "44.5%", left: "34.5%" },
  { number: 17, top: "39%", left: "34%" },
  { number: 16, top: "33.5%", left: "35%" },
  { number: 15, top: "28%", left: "36.5%" },
  { number: 14, top: "23.5%", left: "38%" },
  { number: 13, top: "19.5%", left: "40%" },
  { number: 12, top: "17%", left: "43%" },
  { number: 11, top: "15.5%", left: "46.5%" },

  // Upper Left (استخدم right)
  { number: 21, top: "15.5%", right: "46.5%" },
  { number: 22, top: "17%", right: "43%" },
  { number: 23, top: "20%", right: "40%" },
  { number: 24, top: "24.5%", right: "38.5%" },
  { number: 25, top: "28.5%", right: "37%" },
  { number: 26, top: "33.75%", right: "36%" },
  { number: 27, top: "39.5%", right: "35.5%" },
  { number: 28, top: "44.5%", right: "35.5%" },

  // Lower Right
  { number: 41, bottom: "42%", left: "34.25%" },
  { number: 42, bottom: "36%", left: "34.5%" },
  { number: 43, bottom: "30%", left: "35.5%" },
  { number: 44, bottom: "25%", left: "37%" },
  { number: 45, bottom: "20.5%", left: "39%" },
  { number: 46, bottom: "18%", left: "42%" },
  { number: 47, bottom: "16.5%", left: "44.5%" },
  { number: 48, bottom: "15.5%", left: "47%" },

  // Lower Left
  { number: 31, bottom: "42.5%", right: "35.5%" },
  { number: 32, bottom: "36%", right: "35.75%" },
  { number: 33, bottom: "30%", right: "36.75%" },
  { number: 34, bottom: "25%", right: "38.5%" },
  { number: 35, bottom: "20.5%", right: "40%" },
  { number: 36, bottom: "18%", right: "43%" },
  { number: 37, bottom: "16.5%", right: "45.5%" },
  { number: 38, bottom: "15.5%", right: "47.5%" },
];

const DentistPage: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    const defaultPatient1: PatientData = {
      id: "P001",
      name: "Ahmed ben ali",
      dateOfBirth: "2000-10-10",
      contact: "ahmed@gmail.com",
      teeth: initializeTeethData(),
    };
    const defaultPatient2: PatientData = {
      id: "P002",
      name: "Ali haroze",
      dateOfBirth: "2001-12-31",
      contact: "ali@gmail.com",
      teeth: initializeTeethData(),
    };
    setPatients([defaultPatient1, defaultPatient2]);
  }, []);

  const currentPatient = useMemo(() => patients.find((p) => p.id === selectedPatientId), [patients, selectedPatientId]);

  const handleToothSelect = (toothNumber: number) => setSelectedTooth(toothNumber);

  const updatePatientTeethData = (toothNumber: string, data: Partial<PatientToothData>) => {
    if (!currentPatient) return;
    setPatients(prev =>
      prev.map(p =>
        p.id === currentPatient.id
          ? { ...p, teeth: { ...p.teeth, [toothNumber]: { ...p.teeth[toothNumber], ...data } } }
          : p
      )
    );
  };

  const currentToothData = selectedTooth && currentPatient ? currentPatient.teeth[selectedTooth.toString()] : null;

  return (
    <AppLayout title="Dentist Dashboard">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-1 flex p-6 space-x-6">
          {/* Left Panel */}
          <div className="w-2/3 bg-white rounded-lg shadow-lg p-6 flex flex-col">
            {/* Patient Selector */}
            <section className="mb-6 border-b pb-4">
              <div className="mb-4">
                <label htmlFor="patient-select" className="block text-gray-700 text-sm font-bold mb-2">Select Patient</label>
                <select
                  id="patient-select"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedPatientId || ""}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Select a Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name} ({patient.id})</option>
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
              ) : <p className="text-gray-600">No patient selected.</p>}
            </section>

            {/* Dental Chart */}
            <section className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dental Chart</h2>
              <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] border border-gray-200 rounded-md overflow-hidden">
                <img src="/teeth-model.png" alt="Teeth reference" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0" />
                {toothPositions.map((tooth) => {
                  const condition = currentPatient?.teeth[tooth.number.toString()]?.conditionId || 1;
                  const fillColor = toothConditions.find(c => c.id === condition)?.color || "#fff";

                  return (
                    <div
                      key={tooth.number}
                      className={`flex items-center justify-center rounded-full font-semibold border-2 cursor-pointer transition-all duration-200
                        ${selectedTooth === tooth.number ? "border-blue-500 shadow-lg scale-110" : "border-gray-300"}`}
                      style={{
                        position: "absolute",
                        top: tooth.top,
                        bottom: tooth.bottom,
                        left: tooth.left,
                        right: tooth.right,
                        width: "3%",
                        height: "3%",
                        fontSize: "0.9vw",
                        backgroundColor: fillColor,
                        zIndex: 10,
                      }}
                      onClick={() => handleToothSelect(tooth.number)}
                    >
                      {tooth.number}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {toothConditions.map((condition) => (
                  <span key={condition.id} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: condition.color, color: "#333" }}>{condition.name}</span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Panel */}
          <div className="w-1/3">
            <ToothInfoPanel
              toothNumber={selectedTooth}
              toothData={currentToothData}
              toothConditions={toothConditions}
              onConditionChange={(conditionId) => selectedTooth && updatePatientTeethData(selectedTooth.toString(), { conditionId })}
              onDiagnosisChange={(diagnosis) => selectedTooth && updatePatientTeethData(selectedTooth.toString(), { diagnosis })}
              onTreatmentPlanChange={(treatmentPlan) => selectedTooth && updatePatientTeethData(selectedTooth.toString(), { treatmentPlan })}
              onAddHistoryEntry={(entry) => {
                if (selectedTooth) {
                  const history = currentPatient?.teeth[selectedTooth.toString()]?.history || [];
                  updatePatientTeethData(selectedTooth.toString(), { history: [...history, entry] });
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
