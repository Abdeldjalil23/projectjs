import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChroniqueData {
  patientId: number;
  maladies: Array<{
    id: number;
    typeMaladie: string;
    sousType: string;
    dateDiagnostic: string;
    traitementActuel: string;
    medecinSuivi: string;
    dateDerniereSuivi: string;
    restrictionsTravail: boolean;
    notes: string;
  }>;
  observationsGenerales: string;
}

interface ChroniqueContextType {
  chroniqueData: Record<number, ChroniqueData>;
  hasChronique: (patientId: number) => boolean;
  saveChroniqueData: (patientId: number, data: ChroniqueData) => void;
  getChroniqueData: (patientId: number) => ChroniqueData | null;
}

const ChroniqueContext = createContext<ChroniqueContextType | undefined>(undefined);

export const useChronique = () => {
  const context = useContext(ChroniqueContext);
  if (context === undefined) {
    throw new Error('useChronique must be used within a ChroniqueProvider');
  }
  return context;
};

interface ChroniqueProviderProps {
  children: ReactNode;
}

export const ChroniqueProvider: React.FC<ChroniqueProviderProps> = ({ children }) => {
  const [chroniqueData, setChroniqueData] = useState<Record<number, ChroniqueData>>({});

  const hasChronique = (patientId: number): boolean => {
    const data = chroniqueData[patientId];
    return data ? data.maladies.length > 0 : false;
  };

  const saveChroniqueData = (patientId: number, data: ChroniqueData) => {
    setChroniqueData(prev => ({
      ...prev,
      [patientId]: data
    }));
    
    // Save to localStorage for persistence
    localStorage.setItem(`chronique_${patientId}`, JSON.stringify(data));
  };

  const getChroniqueData = (patientId: number): ChroniqueData | null => {
    // First try to get from state
    if (chroniqueData[patientId]) {
      return chroniqueData[patientId];
    }
    
    // Then try to get from localStorage
    const stored = localStorage.getItem(`chronique_${patientId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setChroniqueData(prev => ({
        ...prev,
        [patientId]: data
      }));
      return data;
    }
    
    return null;
  };

  const value: ChroniqueContextType = {
    chroniqueData,
    hasChronique,
    saveChroniqueData,
    getChroniqueData,
  };

  return (
    <ChroniqueContext.Provider value={value}>
      {children}
    </ChroniqueContext.Provider>
  );
}; 