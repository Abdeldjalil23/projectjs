import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const editableFirstColSections = [
  'maladies_carac', 
  'maladies_oblig', 
  'reclassements',  
  'maladies_prof',  
];

const makeTableInputs = (rows: string[], cols: string[], state: any, setState: any, section: string, searchTerm: string) => {
  const filteredIndexes = rows.map((r, i) => i).filter(i => !searchTerm || rows[i].toLowerCase().includes(searchTerm.toLowerCase()));
  if (searchTerm && filteredIndexes.length === 0) return null;

  return (
    <table className="min-w-full border text-xs mb-4">
      <thead>
        <tr>
          {cols.map((col, idx) => (
            <th key={idx} className="border px-2 py-1 bg-gray-100">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredIndexes.map((rIdx) => {
          const row = rows[rIdx];
          return (
            <tr key={rIdx}>
              {cols.map((col, cIdx) => (
                cIdx === 0 && editableFirstColSections.includes(section) ? (
                  <td key={cIdx} className="border px-2 py-1">
                    <Input
                      type="text"
                      value={state[section]?.[rIdx]?.[col] || ''}
                      onChange={e => setState((s: any) => ({
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
                      onChange={e => setState((s: any) => ({
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
          );
        })}
      </tbody>
    </table>
  );
};

const ConclusionMed5 = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const [form, setForm] = useState({});

  // Definitions
  const aptCols = [' ', 'Embauche', 'Périodique', 'Reprise', 'Autres', 'Total'];
  const aptRows = ['Apte', 'Apte avec réserve', 'Inapte'];

  const malProfCols = ['N° du tableau', 'Maladie', 'Nombre'];
  const malProfRows = ['', '', ''];

  const malCaracCols = ['Risque / Agent causal', 'Poste occupé', 'Nombre'];
  const malCaracRows = ['', '', ''];

  const accTravCols = ['Désignation', 'Nombre', 'Observations'];
  const accTravRows = ['Accidents sans arrêt travail', 'Ayant entraîné un arrêt travail', 'Ayant entraîné un décès'];

  const malOblCols = ['Maladies', 'Nombre', 'Observations'];
  const malOblRows = ['', '', ''];

  const orientCols = ['Orientations', 'Nombre'];
  const orientRows = [
    'Autres (Bilans Sanguins)', 'Cardiologie', 'Dermatologie', 'Endocrinologie/Médecine Interne',
    'Gastrologie', 'Gynécologie', 'Hématologie', 'Néphrologie / urologie', 'Neurologie',
    'Oncologie', 'Ophtalmologie', 'ORL', 'Orthopédie', 'Pneumologie', 'Psychiatrie',
    'Radiologie', 'Rééducation Fonctionnelle', 'Pédiatrie'
  ];

  const affecCols = ['Pathologies', 'Nombre'];
  const affecRows = [
    'HTA', 'IDM', 'Valvulopathies', 'Diabète type I', 'Diabète type II (Glycémie à jeun >1,26 g/l)',
    'Insuffisance rénale chronique', 'Troubles musculo-squelettiques', 'Cancer de la prostate',
    'Cancer du sein', 'Cancer du col', 'Autres cancers', 'Maladies psychiatriques', 'Epilepsie',
    'Asthme', 'Maladies pulmonaires', 'Maladies gastro-intestinales', 'Dermatoses',
    'Maladies endocriniennes', 'Autres', 'Surdité'
  ];

  const reclCols = ['Changement de poste', 'Aménagement de poste (Temporaire)', 'Aménagement de poste (Définitif)'];
  const reclRows = ['', '', ''];

  const mldCols = ['Désignation', 'Nombre'];
  const mldRows = ['Maladies de longue durée', 'Invalidité'];

  const checkMatch = (title: string, rowsGroup: string[][]) => {
    if (!searchTerm) return true;
    if (title.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    for (const rows of rowsGroup) {
      if (rows.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))) return true;
    }
    return false;
  };

  const matches = {
    aptitudes: checkMatch("5.1 Décisions d'aptitudes", [aptRows]),
    maladies: checkMatch("5.2 Déclarations de maladies professionnelles", [malProfRows, malCaracRows]),
    accidents: checkMatch("5.3 Déclarations d'accidents de travail", [accTravRows]),
    obligatoires: checkMatch("5.4 Maladies à déclarations obligatoires", [malOblRows]),
    orientations: checkMatch("5.5 Orientations spécialisées", [orientRows]),
    affections: checkMatch("5.6 Affections chroniques dépistées", [affecRows]),
    reclassements: checkMatch("5.7 Reclassements professionnels", [reclRows]),
    longue_duree: checkMatch("5.8 Maladies de longue durée et invalidité", [mldRows]),
  };

  const defaultValues = Object.entries(matches).filter(([_, v]) => v).map(([k]) => k);

  if (searchTerm && defaultValues.length === 0) return null;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>5. Conclusions médicales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        <Accordion type="multiple" value={searchTerm ? defaultValues : undefined} className="w-full space-y-2">
          {matches.aptitudes && (
            <AccordionItem value="aptitudes">
              <AccordionTrigger>5.1 Décisions d'aptitudes</AccordionTrigger>
              <AccordionContent>{makeTableInputs(aptRows, aptCols, form, setForm, 'aptitudes', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.maladies && (
            <AccordionItem value="maladies">
              <AccordionTrigger>5.2 Déclarations de maladies professionnelles et maladies à caractère professionnel</AccordionTrigger>
              <AccordionContent>
                {matches.maladies && makeTableInputs(malProfRows, malProfCols, form, setForm, 'maladies_prof', searchTerm) && <div className="mb-2 font-medium">5.2.1 Maladies professionnelles</div>}
                {makeTableInputs(malProfRows, malProfCols, form, setForm, 'maladies_prof', searchTerm)}
                {matches.maladies && makeTableInputs(malCaracRows, malCaracCols, form, setForm, 'maladies_carac', searchTerm) && <div className="mb-2 mt-4 font-medium">5.2.2 Maladies à caractère professionnel</div>}
                {makeTableInputs(malCaracRows, malCaracCols, form, setForm, 'maladies_carac', searchTerm)}
              </AccordionContent>
            </AccordionItem>
          )}

          {matches.accidents && (
            <AccordionItem value="accidents">
              <AccordionTrigger>5.3 Déclarations d'accidents de travail</AccordionTrigger>
              <AccordionContent>{makeTableInputs(accTravRows, accTravCols, form, setForm, 'accidents_travail', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.obligatoires && (
            <AccordionItem value="obligatoires">
              <AccordionTrigger>5.4 Maladies à déclarations obligatoires</AccordionTrigger>
              <AccordionContent>{makeTableInputs(malOblRows, malOblCols, form, setForm, 'maladies_oblig', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.orientations && (
            <AccordionItem value="orientations">
              <AccordionTrigger>5.5 Orientations spécialisées</AccordionTrigger>
              <AccordionContent>{makeTableInputs(orientRows, orientCols, form, setForm, 'orientations', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.affections && (
            <AccordionItem value="affections">
              <AccordionTrigger>5.6 Affections chroniques dépistées</AccordionTrigger>
              <AccordionContent>{makeTableInputs(affecRows, affecCols, form, setForm, 'affections_chroniques', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.reclassements && (
            <AccordionItem value="reclassements">
              <AccordionTrigger>5.7 Reclassements professionnels</AccordionTrigger>
              <AccordionContent>{makeTableInputs(reclRows, reclCols, form, setForm, 'reclassements', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.longue_duree && (
            <AccordionItem value="longue_duree">
              <AccordionTrigger>5.8 Maladies de longue durée et invalidité</AccordionTrigger>
              <AccordionContent>{makeTableInputs(mldRows, mldCols, form, setForm, 'maladies_longue_duree', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ConclusionMed5;
