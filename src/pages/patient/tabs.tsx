// Tabs of the patient file and who sees them. Later parts of the file (visits, consultations,
// documents) add their tab here.
import type { ReactNode } from 'react';
import type { BeneficiaryDetails } from '@/lib/beneficiaries';
import MedicalRecordTab from './MedicalRecordTab';
import VisitsTab from './VisitsTab';
import ConsultationsTab from './ConsultationsTab';
import DocumentsTab from './DocumentsTab';

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
  {
    value: 'consultations',
    visible: (can) => ['consultations', 'nursing', 'dental', 'psychology'].some((s) => can(`${s}.read`)),
    render: (b) => <ConsultationsTab beneficiary={b} />,
  },
  {
    value: 'documents',
    visible: (can) => can('documents.read'),
    render: (b) => <DocumentsTab beneficiary={b} />,
  },
];
