import type { ReactNode } from 'react';

export interface OrdonnanceData {
  nom: string;
  prenoms: string;
  age: string;
  date: string;
  medicaments: string;
}

export interface OrientationData {
  nom: string;
  prenom: string;
  age: string;
  nature: string[];
  avis: string;
  destinataire: string;
  date: string;
}

export interface SoinsData {
  emisLe: string;
  docteur: string;
  nom: string;
  dateAccident: string;
  service: string;
  compagnie: string;
  choix: string;
  arretJours: string;
  arretDu: string;
  arretAu: string;
  prolongationJours: string;
  prolongationDu: string;
  prolongationAu: string;
  repriseDate: string;
  admissionLieu: string;
  exemplaires: string;
  signature: string;
}

export interface EvacData {
  date: string;
  nom: string;
  prenom: string;
  fonction: string;
  structure: string;
  domicile: string;
  hopital: string;
  specialiste: string;
  delai: string;
  maladie: boolean;
  accident: boolean;
  autres: string;
  transport: {
    avion: boolean;
    ambulance: boolean;
    sh: boolean;
    propres: boolean;
  };
  inf: string;
  assistant: string;
}

export interface ExplorationData {
  nom: string;
  prenom: string;
  age: string;
  date: string;
  analyseType: 'interne' | 'externe' | '';
  tests: string[];
  commentaires: string;
}

export interface ImagerieData {
  nom: string;
  prenom: string;
  age: string;
  date: string;
  imagerieType: 'radiographie' | 'echographie' | 'scanner' | 'irm' | 'autres' | '';
  examens: string[];
  region: string;
  indication: string;
  commentaires: string;
}

export interface ServiceType {
  icon: ReactNode;
  title: string;
  desc: string;
  action: string;
}

export interface ConsultationData {
  consultationNumber: string;
  visitNumber: string;
  date: string;
  doctor: string;
  specialty: string;
  natureConsultation: string;
  diagnostic: string;
  workStoppageDays: string;
}
