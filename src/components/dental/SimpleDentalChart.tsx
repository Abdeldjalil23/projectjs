import React, { useState } from 'react';

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

interface SimpleDentalChartProps {
  teeth: { [toothNumber: string]: ToothData };
  onToothSelect: (toothNumber: number) => void;
  selectedTooth: number | null;
  toothConditions: ToothCondition[];
}

const SimpleDentalChart: React.FC<SimpleDentalChartProps> = ({
  teeth,
  onToothSelect,
  selectedTooth,
  toothConditions
}) => {
  const renderTooth = (toothNumber: number) => {
    const toothInfo = teeth[toothNumber.toString()];
    const condition = toothConditions.find((c) => c.id === toothInfo?.conditionId);
    const fillColor = condition ? condition.color : '#FFFFFF';

    return (
      <div
        key={toothNumber}
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold border-2 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110
          ${selectedTooth === toothNumber ? 'border-blue-500 shadow-lg scale-110 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'}
        `}
        style={{ backgroundColor: fillColor }}
        onClick={() => onToothSelect(toothNumber)}
        title={`Tooth ${toothNumber}: ${condition?.name || 'Unknown'}`}
      >
        {toothNumber}
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Dental Chart - Enhanced 2D View</h3>
        <p className="text-sm text-gray-600">Click on any tooth to view details</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Upper Jaw */}
        <div className="mb-8">
          <div className="text-center text-sm text-gray-500 mb-4 font-medium">Upper Jaw (Maxilla)</div>
          <div className="grid grid-cols-8 gap-3 justify-center">
            {/* Right side upper teeth */}
            {[18, 17, 16, 15, 14, 13, 12, 11].map(renderTooth)}
          </div>
          <div className="grid grid-cols-8 gap-3 justify-center mt-2">
            {/* Left side upper teeth */}
            {[21, 22, 23, 24, 25, 26, 27, 28].map(renderTooth)}
          </div>
        </div>

        {/* Lower Jaw */}
        <div>
          <div className="text-center text-sm text-gray-500 mb-4 font-medium">Lower Jaw (Mandible)</div>
          <div className="grid grid-cols-8 gap-3 justify-center">
            {/* Right side lower teeth */}
            {[48, 47, 46, 45, 44, 43, 42, 41].map(renderTooth)}
          </div>
          <div className="grid grid-cols-8 gap-3 justify-center mt-2">
            {/* Left side lower teeth */}
            {[31, 32, 33, 34, 35, 36, 37, 38].map(renderTooth)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {toothConditions.map((condition) => (
          <span
            key={condition.id}
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={{ backgroundColor: condition.color, color: '#333' }}
          >
            {condition.name}
          </span>
        ))}
      </div>

      {/* Selected tooth indicator */}
      {selectedTooth && (
        <div className="mt-4 text-center">
          <div className="inline-block bg-blue-500 text-white text-sm px-4 py-2 rounded-full animate-pulse">
            🦷 Tooth {selectedTooth} Selected
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDentalChart;
