import { useState, useMemo, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ToothInfoPanel from "@/components/dental/ToothInfoPanel";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ToothCondition {
  id: number;
  name: string;
  color: string;
}

interface PatientToothData {
  conditionId: number;
  diagnosis: string;
  treatmentPlan: string;
  history: string[]; // e.g. "2025-03-12 – Initial checkup"
}

interface PatientData {
  id: string;
  name: string;
  dateOfBirth: string;
  contact: string;
  teeth: Record<string, PatientToothData>;
}

interface ToothPosition {
  number: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const TOOTH_CONDITIONS: ToothCondition[] = [
  { id: 1, name: "Healthy", color: "#8BC34A" },
  { id: 2, name: "Cavity", color: "#FFEB3B" },
  { id: 3, name: "Filling", color: "#9E9E9E" },
  { id: 4, name: "Root Canal", color: "#FF9800" },
  { id: 5, name: "Extraction", color: "#F44336" },
  { id: 6, name: "Implant", color: "#2196F3" },
  { id: 7, name: "Crown", color: "#607D8B" },
];

const TOOTH_POSITIONS: ToothPosition[] = [
  // Upper Right (11-18)
  { number: 11, top: "17.5%", left: "48%" },
  { number: 12, top: "18.5%", left: "44%" },
  { number: 13, top: "21%", left: "40.5%" },
  { number: 14, top: "24.5%", left: "38.5%" },
  { number: 15, top: "29%", left: "36.5%" },
  { number: 16, top: "34%", left: "34.5%" },
  { number: 17, top: "39%", left: "34%" },
  { number: 18, top: "44.5%", left: "34.5%" },

  // Upper Left (21-28) – adjust these % to match your image
  { number: 21, top: "17.5%", right: "48%" },
  { number: 22, top: "18.5%", right: "44%" },
  { number: 23, top: "21%", right: "40.5%" },
  { number: 24, top: "24.5%", right: "38.5%" },
  { number: 25, top: "29%", right: "36.5%" },
  { number: 26, top: "34%", right: "34.5%" },
  { number: 27, top: "39%", right: "34%" },
  { number: 28, top: "44.5%", right: "34.5%" },

  // Lower Right (41-48)
  { number: 41, bottom: "17.5%", left: "48%" },
  { number: 42, bottom: "18.5%", left: "44%" },
  { number: 43, bottom: "21%", left: "40.5%" },
  { number: 44, bottom: "24.5%", left: "38.5%" },
  { number: 45, bottom: "29%", left: "36.5%" },
  { number: 46, bottom: "34%", left: "34.5%" },
  { number: 47, bottom: "39%", left: "34%" },
  { number: 48, bottom: "44.5%", left: "34.5%" },

  // Lower Left (31-38)
  { number: 31, bottom: "17.5%", right: "48%" },
  { number: 32, bottom: "18.5%", right: "44%" },
  { number: 33, bottom: "21%", right: "40.5%" },
  { number: 34, bottom: "24.5%", right: "38.5%" },
  { number: 35, bottom: "29%", right: "36.5%" },
  { number: 36, bottom: "34%", right: "34.5%" },
  { number: 37, bottom: "39%", right: "34%" },
  { number: 38, bottom: "44.5%", right: "34.5%" },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const createEmptyTooth = (): PatientToothData => ({
  conditionId: 1,
  diagnosis: "",
  treatmentPlan: "",
  history: [`${new Date().toISOString().slice(0, 10)} – Initial checkup`],
});

const initializeTeethData = (): Record<string, PatientToothData> => {
  const teeth: Record<string, PatientToothData> = {};
  const ranges = [
    [11, 18],
    [21, 28],
    [31, 38],
    [41, 48],
  ];
  ranges.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) {
      teeth[i.toString()] = createEmptyTooth();
    }
  });
  return teeth;
};

const getConditionColor = (conditionId: number) =>
  TOOTH_CONDITIONS.find((c) => c.id === conditionId)?.color ?? "#E0E0E0";

const getConditionName = (conditionId: number) =>
  TOOTH_CONDITIONS.find((c) => c.id === conditionId)?.name ?? "Unknown";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const DentistPage: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    name: "",
    dateOfBirth: "",
    contact: "",
  });

  // Seed demo data
  useEffect(() => {
    const demoPatients: PatientData[] = [
      {
        id: "P001",
        name: "Ahmed Ben Ali",
        dateOfBirth: "2000-10-10",
        contact: "ahmed@gmail.com",
        teeth: initializeTeethData(),
      },
      {
        id: "P002",
        name: "Ali Haroze",
        dateOfBirth: "2001-12-31",
        contact: "ali@gmail.com",
        teeth: initializeTeethData(),
      },
    ];
    setPatients(demoPatients);
    setSelectedPatientId(demoPatients[0].id); // auto-select first
  }, []);

  const currentPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const currentToothData = useMemo(() => {
    if (!selectedTooth || !currentPatient) return null;
    return currentPatient.teeth[selectedTooth.toString()] ?? null;
  }, [selectedTooth, currentPatient]);

  // ── Handlers ──────────────────────────────
  const handleToothSelect = useCallback((toothNumber: number) => {
    setSelectedTooth(toothNumber);
  }, []);

  const updatePatientTeethData = useCallback(
    (toothNumber: string, data: Partial<PatientToothData>) => {
      if (!selectedPatientId) return;

      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatientId
            ? {
                ...p,
                teeth: {
                  ...p.teeth,
                  [toothNumber]: { ...p.teeth[toothNumber], ...data },
                },
              }
            : p
        )
      );
    },
    [selectedPatientId]
  );

  const handleAddPatient = () => {
    if (!newPatient.name.trim()) return;

    const id = `P${String(patients.length + 1).padStart(3, "0")}`;
    const patient: PatientData = {
      id,
      name: newPatient.name.trim(),
      dateOfBirth: newPatient.dateOfBirth || "—",
      contact: newPatient.contact || "—",
      teeth: initializeTeethData(),
    };

    setPatients((prev) => [...prev, patient]);
    setSelectedPatientId(id);
    setSelectedTooth(null);
    setNewPatient({ name: "", dateOfBirth: "", contact: "" });
    setIsAddingPatient(false);
  };

  // ─────────────────────────────────────────────
  return (
    <AppLayout title="Dentist Dashboard">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6">
          {/* ── Left Panel ─────────────────────── */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
            {/* Patient Selector + Info */}
            <section className="mb-6 pb-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                <div className="flex-1">
                  <label
                    htmlFor="patient-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Patient
                  </label>
                  <select
                    id="patient-select"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedPatientId ?? ""}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value || null);
                      setSelectedTooth(null);
                    }}
                  >
                    <option value="">— Select a patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPatient((v) => !v)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isAddingPatient ? "Cancel" : "+ New Patient"}
                </button>
              </div>

              {/* Add Patient Form */}
              {isAddingPatient && (
                <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Full name *"
                      value={newPatient.name}
                      onChange={(e) =>
                        setNewPatient((s) => ({ ...s, name: e.target.value }))
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) =>
                        setNewPatient((s) => ({
                          ...s,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Email / Phone"
                      value={newPatient.contact}
                      onChange={(e) =>
                        setNewPatient((s) => ({ ...s, contact: e.target.value }))
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPatient}
                    disabled={!newPatient.name.trim()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700"
                  >
                    Create Patient
                  </button>
                </div>
              )}

              {/* Patient Info Card */}
              {currentPatient ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-gray-500">ID:</span>{" "}
                    {currentPatient.id}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Name:</span>{" "}
                    {currentPatient.name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">DOB:</span>{" "}
                    {currentPatient.dateOfBirth}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Contact:</span>{" "}
                    {currentPatient.contact}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Select a patient to view the dental chart.
                </p>
              )}
            </section>

            {/* Dental Chart */}
            <section className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Dental Chart
                </h2>
                {selectedTooth && (
                  <span className="text-sm text-gray-500">
                    Selected: <strong>#{selectedTooth}</strong>
                  </span>
                )}
              </div>

              <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                <img
                  src="/teeth-model.png"
                  alt="Dental arch reference"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {currentPatient &&
                  TOOTH_POSITIONS.map((tooth) => {
                    const conditionId =
                      currentPatient.teeth[tooth.number.toString()]
                        ?.conditionId ?? 1;
                    const isSelected = selectedTooth === tooth.number;
                    const fill = getConditionColor(conditionId);
                    const name = getConditionName(conditionId);

                    return (
                      <button
                        key={tooth.number}
                        type="button"
                        title={`Tooth ${tooth.number} – ${name}`}
                        aria-label={`Tooth ${tooth.number}, ${name}${
                          isSelected ? ", selected" : ""
                        }`}
                        onClick={() => handleToothSelect(tooth.number)}
                        className={`
                          absolute flex items-center justify-center rounded-full
                          font-semibold border-2 transition-all duration-150
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                          ${
                            isSelected
                              ? "border-blue-600 shadow-lg scale-125 z-20"
                              : "border-white/80 hover:scale-110 hover:z-10 shadow-sm"
                          }
                        `}
                        style={{
                          top: tooth.top,
                          bottom: tooth.bottom,
                          left: tooth.left,
                          right: tooth.right,
                          width: "3.2%",
                          height: "3.2%",
                          fontSize: "clamp(9px, 0.85vw, 13px)",
                          backgroundColor: fill,
                          color: "#1f2937",
                        }}
                      >
                        {tooth.number}
                      </button>
                    );
                  })}

                {!currentPatient && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <p className="text-gray-500 text-sm">
                      Select a patient to interact with the chart
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {TOOTH_CONDITIONS.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-gray-800 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    <span
                      className="w-2 h-2 rounded-full bg-black/20"
                      aria-hidden
                    />
                    {c.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right Panel ────────────────────── */}
          <div className="w-full lg:w-1/3">
            <ToothInfoPanel
              toothNumber={selectedTooth}
              toothData={currentToothData}
              toothConditions={TOOTH_CONDITIONS}
              onConditionChange={(conditionId) =>
                selectedTooth &&
                updatePatientTeethData(selectedTooth.toString(), {
                  conditionId,
                })
              }
              onDiagnosisChange={(diagnosis) =>
                selectedTooth &&
                updatePatientTeethData(selectedTooth.toString(), { diagnosis })
              }
              onTreatmentPlanChange={(treatmentPlan) =>
                selectedTooth &&
                updatePatientTeethData(selectedTooth.toString(), {
                  treatmentPlan,
                })
              }
              onAddHistoryEntry={(entry) => {
                if (!selectedTooth || !currentPatient) return;
                const toothKey = selectedTooth.toString();
                const existing =
                  currentPatient.teeth[toothKey]?.history ?? [];
                const stamped = `${new Date()
                  .toISOString()
                  .slice(0, 10)} – ${entry}`;
                updatePatientTeethData(toothKey, {
                  history: [...existing, stamped],
                });
              }}
            />
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default DentistPage;