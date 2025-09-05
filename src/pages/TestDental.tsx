import React, { useState } from 'react';
import SimpleDentalChart from '@/components/dental/SimpleDentalChart';
import DentalChart3D from '@/components/dental/DentalChart3D';
import ToothInfoPanel from '@/components/dental/ToothInfoPanel';

interface ToothCondition {
  id: number;
  name: string;
  color: string;
}

interface ToothData {
  conditionId: number;
  diagnosis: string;
  treatmentPlan: string;
  history: string[];
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

const initializeTeethData = () => {
  const teeth: { [toothNumber: string]: ToothData } = {};
  for (let i = 11; i <= 18; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 21; i <= 28; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 31; i <= 38; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  for (let i = 41; i <= 48; i++) teeth[i.toString()] = { conditionId: 1, diagnosis: '', treatmentPlan: '', history: ['Initial checkup'] };
  return teeth;
};

const TestDental: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teeth, setTeeth] = useState<{ [toothNumber: string]: ToothData }>(initializeTeethData());
  const [is3DView, setIs3DView] = useState(true);

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
  };

  const updateToothData = (toothNumber: string, data: Partial<ToothData>) => {
    setTeeth(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        ...data,
      },
    }));
  };

  const addHistoryEntry = (toothNumber: number, entry: string) => {
    const currentHistory = teeth[toothNumber.toString()]?.history || [];
    updateToothData(toothNumber.toString(), { history: [...currentHistory, entry] });
  };

  const currentToothData = selectedTooth ? teeth[selectedTooth.toString()] : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">3D Dental Chart Test</h1>
        
        <div className="flex gap-6">
          {/* Left Panel: 3D Chart */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Dental Chart {is3DView ? '(3D Model)' : '(2D Model)'}
                </h2>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded ${is3DView ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setIs3DView(true)}
                  >
                    3D View
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${!is3DView ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setIs3DView(false)}
                  >
                    2D View
                  </button>
                </div>
              </div>
              
              {is3DView ? (
                <DentalChart3D
                  teeth={teeth}
                  onToothSelect={handleToothSelect}
                  selectedTooth={selectedTooth}
                  toothConditions={toothConditions}
                />
              ) : (
                <SimpleDentalChart
                  teeth={teeth}
                  onToothSelect={handleToothSelect}
                  selectedTooth={selectedTooth}
                  toothConditions={toothConditions}
                />
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
            </div>
          </div>

          {/* Right Panel: Tooth Info */}
          <div className="w-1/3">
            <ToothInfoPanel
              toothNumber={selectedTooth}
              toothData={currentToothData}
              toothConditions={toothConditions}
              onConditionChange={(conditionId) => {
                if (selectedTooth) {
                  updateToothData(selectedTooth.toString(), { conditionId });
                }
              }}
              onDiagnosisChange={(diagnosis) => {
                if (selectedTooth) {
                  updateToothData(selectedTooth.toString(), { diagnosis });
                }
              }}
              onTreatmentPlanChange={(treatmentPlan) => {
                if (selectedTooth) {
                  updateToothData(selectedTooth.toString(), { treatmentPlan });
                }
              }}
              onAddHistoryEntry={(entry) => {
                if (selectedTooth) {
                  addHistoryEntry(selectedTooth, entry);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDental;
