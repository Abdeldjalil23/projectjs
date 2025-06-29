import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const makeTableInputs = (rows, cols, state, setState, section) => (
  <table className="min-w-full border text-xs">
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
            cIdx === 0 ? (
              <td key={cIdx} className="border px-2 py-1 font-semibold">{row}</td>
            ) : (
              <td key={cIdx} className="border px-2 py-1">
                <Input
                  type="number"
                  min="0"
                  value={state[section]?.[row]?.[col] || ''}
                  onChange={e => setState(s => ({
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
      ))}
    </tbody>
  </table>
);

const GeneralInfo12467810 = () => {
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

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {/* 1. Caractéristiques liées à la population de l'unité */}
        <AccordionItem value="pop1">
          <AccordionTrigger>1. Caractéristiques liées à la population de l'unité</AccordionTrigger>
          <AccordionContent>
            <div className="mb-4">
              {makeTableInputs(popRows, popCols, form, setForm, 'pop1')}
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Effectif par C.S.P. et par âge</div>
              {makeTableInputs(cspRows, cspCols, form, setForm, 'csp1')}
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Effectif sous-traitant</div>
              {makeTableInputs(sousTraitantRows, sousTraitantCols, form, setForm, 'sousTraitant1')}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Caractéristiques spécifiques au personnel de santé */}
        <AccordionItem value="sante2">
          <AccordionTrigger>2. Caractéristiques spécifiques au personnel de santé</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(santeRows, santeCols, form, setForm, 'sante2')}
          </AccordionContent>
        </AccordionItem>

        {/* 3. Prise en charge du personnel sous-traitant et populations */}
        <AccordionItem value="prise3">
          <AccordionTrigger>3. Prise en charge du personnel sous-traitant et populations</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(priseEnChargeRows, priseEnChargeCols, form, setForm, 'prise3')}
          </AccordionContent>
        </AccordionItem>

        {/* 4. Activités en milieu de travail */}
        <AccordionItem value="activite4">
          <AccordionTrigger>4. Activités en milieu de travail</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(activiteRows, activiteCols, form, setForm, 'activite4')}
          </AccordionContent>
        </AccordionItem>

        {/* 5. Soins infirmiers */}
        <AccordionItem value="soins5">
          <AccordionTrigger>5. Soins infirmiers</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(soinsRows, soinsCols, form, setForm, 'soins5')}
          </AccordionContent>
        </AccordionItem>

        {/* 6. Vaccination */}
        <AccordionItem value="vaccin6">
          <AccordionTrigger>6. Vaccination</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(vaccinRows, vaccinCols, form, setForm, 'vaccin6')}
          </AccordionContent>
        </AccordionItem>

        {/* 7. Examens complémentaires */}
        <AccordionItem value="exam7">
          <AccordionTrigger>7. Examens complémentaires</AccordionTrigger>
          <AccordionContent>
            {makeTableInputs(examRows, examCols, form, setForm, 'exam7')}
          </AccordionContent>
        </AccordionItem>
      </Accordion>  
    </form>
  );
};

export default GeneralInfo12467810;
