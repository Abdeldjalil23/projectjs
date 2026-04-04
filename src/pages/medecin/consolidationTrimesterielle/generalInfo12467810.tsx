import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const makeTableInputs = (rows: string[], cols: string[], state: any, setState: any, section: string, searchTerm: string = '') => {
  const filteredIndexes = rows.map((r, i) => i).filter(i => !searchTerm || rows[i].toLowerCase().includes(searchTerm.toLowerCase()));
  if (searchTerm && filteredIndexes.length === 0) return null;

  return (
    <table className="min-w-full border text-xs">
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
                cIdx === 0 ? (
                  <td key={cIdx} className="border px-2 py-1 font-semibold">{row}</td>
                ) : (
                  <td key={cIdx} className="border px-2 py-1">
                    <Input
                      type="number"
                      min="0"
                      value={state[section]?.[row]?.[col] || ''}
                      onChange={e => setState((s: any) => ({
                        ...s,
                        [section]: {
                          ...s[section],
                          [row]: {
                            ...((s[section] && s[section][row]) || {}),
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

const GeneralInfo12467810 = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  // Section 1 tables
  const popCols = [' ', 'Permanents', 'Contractuels (SIE)', 'Apprentis/Stagiaires', 'Effectif Global'];
  const popRows = ['Hommes', 'Femmes', 'Total'];

  const cspCols = [' ', 'Cadre', 'Maîtrise', 'Exécution', '< 20', '20 - 30', '31 - 40', '41 - 50', '51 - 60', '> 60', 'Total'];
  const cspRows = ['Effectif'];

  const sousTraitantCols = [' ', 'Total'];
  const sousTraitantRows = ['Conventionné', 'Non conventionné'];

  // Section 2 table
  const santeCols = [
    'Médecin du travail', 'Médecin généraliste', 'Chirurgien dentiste',
    'Infirmier', 'Manip. Rx', 'Aux. Dentaire', 'Personnel Adm', 'Autres (à préciser)', 'Total'
  ];
  const santeRows = ['Personnel'];

  // Section 3 table
  const priseEnChargeCols = [
    'Prestation', 'Entreprises conventionnées', 'Sous-traitant Conventionné', 'Sous-traitant N. Conventionné', 'Population'
  ];
  const priseEnChargeRows = [
    "Visites d'embauche", 'Visites périodiques', 'Visites de reprise du travail', 'Visites spontanées',
    'Visites de soins', 'Urgences médico-chirurgicales', 'Evacuations sanitaires',
    'Activités en milieu du travail', 'Education sanitaire', 'Autre (à préciser)'
  ];

  // Section 4 table
  const activiteCols = ['Nature de l\'activité', 'Nombre', 'Observations'];
  const activiteRows = ['Visite des lieux de travail', 'Etudes de Métrologie', 'Etudes de postes',
    'Enquête suite à un AT ou une MP ou MCP', 'Visites d\'hygiène',
    'Prélèvements / analyses de produits toxicologiques et dangereux',
    'Réunions CHS', 'Autres'
  ];

  // Section 5 table
  const soinsCols = ['Type de soins', 'Nombre'];
  const soinsRows = ['Soins généraux', 'Soins pour accidents de travail', 'Total'];

  // Section 6 table
  const vaccinCols = [
    'Type de vaccin', 'Population ciblée pour la période considérée',
    'Population vaccinée', 'Nombre de doses utilisées'
  ];
  const vaccinRows = ['Vaccin 1', 'Vaccin 2', 'Vaccin 3'];

  // Section 7 table
  const examCols = [
    "Nombre d'examens", 'Biologiques', 'Radiologiques', 'Toxicologiques', 'Exploration-fonction', 'Total'
  ];
  const examRows = ['Examens prescrits', 'Examens contrôlés'];

  const handleSave = (e: any) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const checkMatch = (title: string, rowsGroup: string[][]) => {
    if (!searchTerm) return true;
    if (title.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    for (const rows of rowsGroup) {
      if (rows.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))) return true;
    }
    return false;
  };

  const matches = {
    pop1: checkMatch("1. Caractéristiques liées à la population de l'unité", [popRows, cspRows, sousTraitantRows]),
    sante2: checkMatch("2. Caractéristiques spécifiques au personnel de santé", [santeRows]),
    prise3: checkMatch("3. Prise en charge du personnel sous-traitant et populations", [priseEnChargeRows]),
    activite4: checkMatch("4. Activités en milieu de travail", [activiteRows]),
    soins5: checkMatch("5. Soins infirmiers", [soinsRows]),
    vaccin6: checkMatch("6. Vaccination", [vaccinRows]),
    exam7: checkMatch("7. Examens complémentaires", [examRows]),
  };

  const defaultValues = Object.entries(matches).filter(([_, v]) => v).map(([k]) => k);

  if (searchTerm && defaultValues.length === 0) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Accordion type="multiple" value={searchTerm ? defaultValues : undefined} className="w-full space-y-2">
        {matches.pop1 && (
          <AccordionItem value="pop1">
            <AccordionTrigger>1. Caractéristiques liées à la population de l'unité</AccordionTrigger>
            <AccordionContent>
              <div className="mb-4">
                {makeTableInputs(popRows, popCols, form, setForm, 'pop1', searchTerm)}
              </div>
              <div className="mb-4">
                {makeTableInputs(cspRows, cspCols, form, setForm, 'csp1', searchTerm) && <div className="font-semibold mb-1">Effectif par C.S.P. et par âge</div>}
                {makeTableInputs(cspRows, cspCols, form, setForm, 'csp1', searchTerm)}
              </div>
              <div className="mb-4">
                {makeTableInputs(sousTraitantRows, sousTraitantCols, form, setForm, 'sousTraitant1', searchTerm) && <div className="font-semibold mb-1">Effectif sous-traitant</div>}
                {makeTableInputs(sousTraitantRows, sousTraitantCols, form, setForm, 'sousTraitant1', searchTerm)}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.sante2 && (
          <AccordionItem value="sante2">
            <AccordionTrigger>2. Caractéristiques spécifiques au personnel de santé</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(santeRows, santeCols, form, setForm, 'sante2', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.prise3 && (
          <AccordionItem value="prise3">
            <AccordionTrigger>3. Prise en charge du personnel sous-traitant et populations</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(priseEnChargeRows, priseEnChargeCols, form, setForm, 'prise3', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.activite4 && (
          <AccordionItem value="activite4">
            <AccordionTrigger>4. Activités en milieu de travail</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(activiteRows, activiteCols, form, setForm, 'activite4', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.soins5 && (
          <AccordionItem value="soins5">
            <AccordionTrigger>5. Soins infirmiers</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(soinsRows, soinsCols, form, setForm, 'soins5', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.vaccin6 && (
          <AccordionItem value="vaccin6">
            <AccordionTrigger>6. Vaccination</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(vaccinRows, vaccinCols, form, setForm, 'vaccin6', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}

        {matches.exam7 && (
          <AccordionItem value="exam7">
            <AccordionTrigger>7. Examens complémentaires</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(examRows, examCols, form, setForm, 'exam7', searchTerm)}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>  
    </form>
  );
};

export default GeneralInfo12467810;
