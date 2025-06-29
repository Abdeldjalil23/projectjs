import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

// Helper to determine if the first column should be editable for a given section
const editableFirstColSections = [
  'maladies_carac', // 5.2.2 Risque / Agent causal
  'maladies_oblig', // 5.4 Maladies
  'reclassements',  // 5.7 Changement de poste
  'maladies_prof',  // 5.2.1 N° du tableau
];

const makeTableInputs = (rows, cols, state, setState, section) => (
  <table className="min-w-full border text-xs mb-4">
    <thead>
      <tr>
        {cols.map((col, idx) => (
          <th key={idx} className="border px-2 py-1 bg-gray-100">{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, rIdx) => (
        <tr key={rIdx}>
          {cols.map((col, cIdx) => (
            cIdx === 0 && editableFirstColSections.includes(section) ? (
              <td key={cIdx} className="border px-2 py-1">
                <Input
                  type="text"
                  value={state[section]?.[rIdx]?.[col] || ''}
                  onChange={e => setState(s => ({
                    ...s,
                    [section]: {
                      ...s[section],
                      [rIdx]: {
                        ...((s[section] && s[section][rIdx]) || {}),
                        [col]: e.target.value
                      }
                    }
                  }))}
                  className="text-xs"
                />
              </td>
            ) : cIdx === 0 ? (
              <td key={cIdx} className="border px-2 py-1 font-semibold">{row}</td>
            ) : (
              <td key={cIdx} className="border px-2 py-1">
                <Input
                  type="text"
                  value={state[section]?.[rIdx]?.[col] || ''}
                  onChange={e => setState(s => ({
                    ...s,
                    [section]: {
                      ...s[section],
                      [rIdx]: {
                        ...((s[section] && s[section][rIdx]) || {}),
                        [col]: e.target.value
                      }
                    }
                  }))}
                  className="text-xs"
                />
              </td>
            )
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const ConclusionMed5 = () => {
  const [form, setForm] = useState({});

  // 5.1 Décisions d'aptitudes
  const aptCols = [' ', 'Embauche', 'Périodique', 'Reprise', 'Autres', 'Total'];
  const aptRows = ['Apte', 'Apte avec réserve', 'Inapte'];

  // 5.2.1 Maladies professionnelles
  const malProfCols = ['N° du tableau', 'Maladie', 'Nombre'];
  const malProfRows = ['', '', ''];

  // 5.2.2 Maladies à caractère professionnel
  const malCaracCols = ['Risque / Agent causal', 'Poste occupé', 'Nombre'];
  const malCaracRows = ['', '', ''];

  // 5.3 Déclarations d'accidents de travail
  const accTravCols = ['Désignation', 'Nombre', 'Observations'];
  const accTravRows = [
    'Accidents sans arrêt travail',
    'Ayant entraîné un arrêt travail',
    'Ayant entraîné un décès'
  ];

  // 5.4 Maladies à déclarations obligatoires
  const malOblCols = ['Maladies', 'Nombre', 'Observations'];
  const malOblRows = ['', '', ''];

  // 5.5 Orientations spécialisées
  const orientCols = ['Orientations', 'Nombre'];
  const orientRows = [
    'Autres (Bilans Sanguins)', 'Cardiologie', 'Dermatologie', 'Endocrinologie/Médecine Interne',
    'Gastrologie', 'Gynécologie', 'Hématologie', 'Néphrologie / urologie', 'Neurologie',
    'Oncologie', 'Ophtalmologie', 'ORL', 'Orthopédie', 'Pneumologie', 'Psychiatrie',
    'Radiologie', 'Rééducation Fonctionnelle', 'Pédiatrie'
  ];

  // 5.6 Affections chroniques dépistées
  const affecCols = ['Pathologies', 'Nombre'];
  const affecRows = [
    'HTA', 'IDM', 'Valvulopathies', 'Diabète type I', 'Diabète type II (Glycémie à jeun >1,26 g/l)',
    'Insuffisance rénale chronique', 'Troubles musculo-squelettiques', 'Cancer de la prostate',
    'Cancer du sein', 'Cancer du col', 'Autres cancers', 'Maladies psychiatriques', 'Epilepsie',
    'Asthme', 'Maladies pulmonaires', 'Maladies gastro-intestinales', 'Dermatoses',
    'Maladies endocriniennes', 'Autres', 'Surdité'
  ];

  // 5.7 Reclassements professionnels
  const reclCols = ['Changement de poste', 'Aménagement de poste (Temporaire)', 'Aménagement de poste (Définitif)'];
  const reclRows = ['', '', ''];

  // 5.8 Maladies de longue durée et invalidité
  const mldCols = ['Désignation', 'Nombre'];
  const mldRows = ['Maladies de longue durée', 'Invalidité'];

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>5. Conclusions médicales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        <Accordion type="multiple" className="w-full space-y-2">
          {/* 5.1 Décisions d'aptitudes */}
          <AccordionItem value="aptitudes">
            <AccordionTrigger>5.1 Décisions d'aptitudes</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(aptRows, aptCols, form, setForm, 'aptitudes')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.2 Déclarations de maladies professionnelles et maladies à caractère professionnel */}
          <AccordionItem value="maladies">
            <AccordionTrigger>5.2 Déclarations de maladies professionnelles et maladies à caractère professionnel</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 font-medium">5.2.1 Maladies professionnelles</div>
              {makeTableInputs(malProfRows, malProfCols, form, setForm, 'maladies_prof')}
              <div className="mb-2 font-medium">5.2.2 Maladies à caractère professionnel</div>
              {makeTableInputs(malCaracRows, malCaracCols, form, setForm, 'maladies_carac')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.3 Déclarations d'accidents de travail */}
          <AccordionItem value="accidents">
            <AccordionTrigger>5.3 Déclarations d'accidents de travail</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(accTravRows, accTravCols, form, setForm, 'accidents_travail')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.4 Maladies à déclarations obligatoires */}
          <AccordionItem value="obligatoires">
            <AccordionTrigger>5.4 Maladies à déclarations obligatoires</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(malOblRows, malOblCols, form, setForm, 'maladies_oblig')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.5 Orientations spécialisées */}
          <AccordionItem value="orientations">
            <AccordionTrigger>5.5 Orientations spécialisées</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(orientRows, orientCols, form, setForm, 'orientations')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.6 Affections chroniques dépistées */}
          <AccordionItem value="affections">
            <AccordionTrigger>5.6 Affections chroniques dépistées</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(affecRows, affecCols, form, setForm, 'affections_chroniques')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.7 Reclassements professionnels */}
          <AccordionItem value="reclassements">
            <AccordionTrigger>5.7 Reclassements professionnels</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(reclRows, reclCols, form, setForm, 'reclassements')}
            </AccordionContent>
          </AccordionItem>

          {/* 5.8 Maladies de longue durée et invalidité */}
          <AccordionItem value="longue_duree">
            <AccordionTrigger>5.8 Maladies de longue durée et invalidité</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(mldRows, mldCols, form, setForm, 'maladies_longue_duree')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ConclusionMed5;
