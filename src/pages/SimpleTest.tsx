import React, { useState } from 'react';
import SimpleDentalChart from '@/components/dental/SimpleDentalChart';
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

const SimpleTest: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teeth, setTeeth] = useState<{ [toothNumber: string]: ToothData }>(initializeTeethData());

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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🦷 Enhanced Dental Chart</h1>
          <p className="text-gray-600">Click on any tooth to view and edit its details</p>
        </div>
        
        <div className="flex gap-6">
          {/* Left Panel: Dental Chart */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <SimpleDentalChart
                teeth={teeth}
                onToothSelect={handleToothSelect}
                selectedTooth={selectedTooth}
                toothConditions={toothConditions}
              />
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

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Instructions</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Click on any tooth to select it</li>
            <li>• Change the tooth condition using the dropdown</li>
            <li>• Add diagnosis and treatment plan</li>
            <li>• Use quick action buttons for common conditions</li>
            <li>• View treatment history for each tooth</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
