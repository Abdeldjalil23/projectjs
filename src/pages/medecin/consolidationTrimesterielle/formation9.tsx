import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const makeTableInputs = (rows, cols, state, setState, section, options = {}) => (
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
            cIdx === 0 ? (
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
      {/* For 9.3, add a total row if options.total is true */}
      {options && 'total' in options && options.total && (
        <tr>
          <td className="border px-2 py-1 font-semibold">Total</td>
          <td className="border px-2 py-1 font-semibold">
            {(() => {
              // Sum all values in the second column (Nombre de participants)
              const vals = state[section] || [];
              return vals.reduce((sum, row) => {
                const v = row[cols[1]];
                const n = parseInt(v, 10);
                return sum + (isNaN(n) ? 0 : n);
              }, 0);
            })()}
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

const Formation9 = () => {
  const [form, setForm] = useState({});

  // 9.1 Formation et travaux du médecin
  const f91Cols = ['Nature de la formation', 'Lieu', 'Durée'];
  const f91Rows = [
    'Formation',
    'Stage',
    'Participation à un séminaire',
    'Autres (à préciser)'
  ];

  // 9.2 Formations animées par le médecin
  const f92Cols = ['Type de formation', 'Lieu', 'Durée'];
  const f92Rows = [
    'Formation',
    'Secourisme',
    'Médecine de travail',
    'Autres (à préciser)'
  ];

  // 9.3 Séance d'éducation sanitaire
  const f93Cols = ['Thèmes', 'Nombre de participants'];
  const f93Rows = [ '', '', '' ]; // 3 empty rows for user input

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>9. Formation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        <Accordion type="multiple" className="w-full space-y-2">
          {/* 9.1 Formation et travaux du médecin */}
          <AccordionItem value="f91">
            <AccordionTrigger>9.1 Formation et travaux du médecin</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(f91Rows, f91Cols, form, setForm, 'f91')}
            </AccordionContent>
          </AccordionItem>

          {/* 9.2 Formations animées par le médecin */}
          <AccordionItem value="f92">
            <AccordionTrigger>9.2 Formations animées par le médecin</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(f92Rows, f92Cols, form, setForm, 'f92')}
            </AccordionContent>
          </AccordionItem>

          {/* 9.3 Séance d'éducation sanitaire */}
          <AccordionItem value="f93">
            <AccordionTrigger>9.3 Séance d'éducation sanitaire</AccordionTrigger>
            <AccordionContent>
              {makeTableInputs(f93Rows, f93Cols, form, setForm, 'f93', { total: true })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Formation9;
