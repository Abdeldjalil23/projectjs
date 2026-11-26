// Tabs of the patient file and who sees them. Later parts of the file (visits, consultations,
// documents) add their tab here.
import type { ReactNode } from 'react';
import type { BeneficiaryDetails } from '@/lib/beneficiaries';
import MedicalRecordTab from './MedicalRecordTab';
import VisitsTab from './VisitsTab';

export interface PatientTab {
  value: string;
  visible: (can: (permission: string) => boolean) => boolean;
  render: (beneficiary: BeneficiaryDetails) => ReactNode;
}

export const PATIENT_TABS: PatientTab[] = [
  { value: 'info', visible: () => true, render: () => null },
  {
    value: 'record',
    visible: (can) => can('medical_records.read'),
    render: (b) => <MedicalRecordTab beneficiaryId={b.id} />,
  },
  {
    value: 'visits',
    visible: (can) => can('visits.read'),
    render: (b) => <VisitsTab beneficiaryId={b.id} />,
  },
];
