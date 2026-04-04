import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const makeTableInputs = (rows: string[], cols: string[], state: any, setState: any, section: string, searchTerm: string, options: any = {}) => {
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
                cIdx === 0 ? (
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
        {options && 'total' in options && options.total && (
          <tr>
            <td className="border px-2 py-1 font-semibold">Total</td>
            <td className="border px-2 py-1 font-semibold">
              {(() => {
                const vals = state[section] || {};
                return Object.values(vals).reduce((sum: number, row: any) => {
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
};

const Formation9 = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const [form, setForm] = useState({});

  const f91Cols = ['Nature de la formation', 'Lieu', 'Durée'];
  const f91Rows = ['Formation', 'Stage', 'Participation à un séminaire', 'Autres (à préciser)'];

  const f92Cols = ['Type de formation', 'Lieu', 'Durée'];
  const f92Rows = ['Formation', 'Secourisme', 'Médecine de travail', 'Autres (à préciser)'];

  const f93Cols = ['Thèmes', 'Nombre de participants'];
  const f93Rows = [ '', '', '' ];

  const checkMatch = (title: string, rowsGroup: string[][]) => {
    if (!searchTerm) return true;
    if (title.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    for (const rows of rowsGroup) {
      if (rows.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))) return true;
    }
    return false;
  };

  const matches = {
    f91: checkMatch("9.1 Formation et travaux du médecin", [f91Rows]),
    f92: checkMatch("9.2 Formations animées par le médecin", [f92Rows]),
    f93: checkMatch("9.3 Séance d'éducation sanitaire", [f93Rows]),
  };

  const defaultValues = Object.entries(matches).filter(([_, v]) => v).map(([k]) => k);

  if (searchTerm && defaultValues.length === 0) return null;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>9. Formation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        <Accordion type="multiple" value={searchTerm ? defaultValues : undefined} className="w-full space-y-2">
          {matches.f91 && (
            <AccordionItem value="f91">
              <AccordionTrigger>9.1 Formation et travaux du médecin</AccordionTrigger>
              <AccordionContent>{makeTableInputs(f91Rows, f91Cols, form, setForm, 'f91', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.f92 && (
            <AccordionItem value="f92">
              <AccordionTrigger>9.2 Formations animées par le médecin</AccordionTrigger>
              <AccordionContent>{makeTableInputs(f92Rows, f92Cols, form, setForm, 'f92', searchTerm)}</AccordionContent>
            </AccordionItem>
          )}

          {matches.f93 && (
            <AccordionItem value="f93">
              <AccordionTrigger>9.3 Séance d'éducation sanitaire</AccordionTrigger>
              <AccordionContent>{makeTableInputs(f93Rows, f93Cols, form, setForm, 'f93', searchTerm, { total: true })}</AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Formation9;
