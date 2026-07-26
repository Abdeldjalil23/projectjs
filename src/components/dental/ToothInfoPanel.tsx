import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

interface ToothInfoPanelProps {
  toothNumber: number | null;
  toothData: ToothData | null;
  toothConditions: ToothCondition[];
  onConditionChange: (conditionId: number) => void;
  onDiagnosisChange: (diagnosis: string) => void;
  onTreatmentPlanChange: (treatmentPlan: string) => void;
  onAddHistoryEntry: (entry: string) => void;
}

const ToothInfoPanel: React.FC<ToothInfoPanelProps> = ({
  toothNumber,
  toothData,
  toothConditions,
  onConditionChange,
  onDiagnosisChange,
  onTreatmentPlanChange,
  onAddHistoryEntry,
}) => {
  if (!toothNumber || !toothData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tooth Information</CardTitle>
          <CardDescription>Select a tooth to view detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🦷</div>
              <p>Click on a tooth in the 3D model to view its details</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCondition = toothConditions.find(c => c.id === toothData.conditionId);

  const getToothType = (toothNumber: number) => {
    if (toothNumber >= 11 && toothNumber <= 12 || toothNumber >= 21 && toothNumber <= 22 ||
        toothNumber >= 31 && toothNumber <= 32 || toothNumber >= 41 && toothNumber <= 42) {
      return { type: 'Incisor', description: 'Front cutting teeth' };
    } else if (toothNumber === 13 || toothNumber === 23 || toothNumber === 33 || toothNumber === 43) {
      return { type: 'Canine', description: 'Sharp pointed teeth' };
    } else if (toothNumber >= 14 && toothNumber <= 15 || toothNumber >= 24 && toothNumber <= 25 ||
               toothNumber >= 34 && toothNumber <= 35 || toothNumber >= 44 && toothNumber <= 45) {
      return { type: 'Premolar', description: 'Grinding teeth' };
    } else {
      return { type: 'Molar', description: 'Main chewing teeth' };
    }
  };

  const toothType = getToothType(toothNumber);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          Tooth {toothNumber}
        </CardTitle>
        <CardDescription>
          {toothType.type} - {toothType.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Condition */}
        <div>
          <Label className="text-sm font-semibold">Current Condition</Label>
          <div className="mt-2">
            <Badge 
              style={{ 
                backgroundColor: currentCondition?.color || '#ccc',
                color: '#333'
              }}
              className="text-sm px-3 py-1"
            >
              {currentCondition?.name || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Condition Selector */}
        <div>
          <Label htmlFor="condition-select" className="text-sm font-semibold">
            Change Condition
          </Label>
          <select
            id="condition-select"
            className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={toothData.conditionId}
            onChange={(e) => onConditionChange(parseInt(e.target.value))}
          >
            {toothConditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.name}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis */}
        <div>
          <Label htmlFor="diagnosis" className="text-sm font-semibold">
            Diagnosis
          </Label>
          <Textarea
            id="diagnosis"
            className="mt-2"
            placeholder="Enter diagnosis for this tooth..."
            value={toothData.diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Treatment Plan */}
        <div>
          <Label htmlFor="treatment-plan" className="text-sm font-semibold">
            Treatment Plan
          </Label>
          <Textarea
            id="treatment-plan"
            className="mt-2"
            placeholder="Enter treatment plan for this tooth..."
            value={toothData.treatmentPlan}
            onChange={(e) => onTreatmentPlanChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* History */}
        <div>
          <Label className="text-sm font-semibold">Treatment History</Label>
          <div className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 max-h-32 overflow-y-auto">
            {toothData.history.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No history recorded</p>
            ) : (
              <ul className="space-y-1">
                {toothData.history.map((entry, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-2 w-full"
            size="sm"
            onClick={() => onAddHistoryEntry(`Treatment updated on ${new Date().toLocaleDateString()}`)}
          >
            Add History Entry
          </Button>
        </div>

        {/* Quick Actions */}
        <div>
          <Label className="text-sm font-semibold">Quick Actions</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConditionChange(2)} // Cavity
            >
              Mark Cavity
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConditionChange(3)} // Filling
            >
              Mark Filled
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConditionChange(1)} // Healthy
            >
              Mark Healthy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConditionChange(5)} // Extraction
            >
              Mark Extracted
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToothInfoPanel;
