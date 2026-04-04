import React, { useState } from 'react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const match = (str: string, st: string) => !st || str.toLowerCase().includes(st.toLowerCase());

const ActivitieClinic3 = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const [saved, setSaved] = useState(false);

  // Group 3.1 Nuisances
  const nuisances_chimiques = ['C-inorganique, organométallique', 'Hydrocarbures', 'Matières plastiques', 'Gaz et vapeurs', 'Autres (à préciser)'];
  const nuisances_biologiques = ['Personnel de santé', 'Personnel de cuisines', "Personnel de l'assainissement", 'Autres (à préciser)'];
  const nuisances_physiques = ['Bruit', 'Rayonnement (*)', 'Vibrations', 'Travail sur écran', 'Autres (à préciser)'];
  const nuisances_psycho = ['Poussières', 'Autres (à préciser)'];
  const travail_poste = ['2 x 12', '3 x 8', 'Autres (à préciser)'];
  const postes_securite = ['Poussières', 'Autres (à préciser)'];

  const nuisancesKeys = [
    { label: 'Nuisances chimiques', items: nuisances_chimiques },
    { label: 'Nuisances biologiques', items: nuisances_biologiques },
    { label: 'Nuisances physiques', items: nuisances_physiques },
    { label: 'Nuisances psycho-chimiques', items: nuisances_psycho },
    { label: 'Travail posté', items: travail_poste },
    { label: 'Postes de sécurité (*)', items: postes_securite },
  ];

  const filteredNuisances = nuisancesKeys.map(k => ({
    ...k,
    items: k.items.filter(i => match(i, searchTerm))
  })).filter(k => k.items.length > 0 || match(k.label, searchTerm));


  // Group 3.2.2 Particulières
  const popParticulieres = [
    'Apprentis',
    'Travailleurs fortement exposés aux risques professionnels',
    'Travailleurs responsables de la sécurité (*)',
    'Travailleurs âgés de moins de 18 ans',
    'Travailleurs âgés de plus de 55 ans',
    'Handicapés physiques',
    'Malades chroniques',
    'Femmes enceintes',
    "Mères d'un enfant de moins de 02 ans"
  ];
  const filteredParticulieres = popParticulieres.filter(p => match(p, searchTerm));

  // 3.5 Urgences
  const urgences = ['Médicales', 'Chirurgicales'];
  const filteredUrgences = urgences.filter(u => match(u, searchTerm));

  const checkMatch = (title: string, matchConditions: boolean[]) => {
    if (!searchTerm) return true;
    if (title.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    return matchConditions.some(c => c);
  };

  const matches = {
    embauche: checkMatch("3.1 Visites d'embauche", [
      match("Personnel permanent", searchTerm), match("Personnel contractuel", searchTerm), match("Apprentis", searchTerm), match("Total des visites", searchTerm)
    ]),
    nuisance: checkMatch("Identification de la nuisance", [filteredNuisances.length > 0]),
    periodique: checkMatch("3.2 Visites périodiques", [
      match("Visite annuelle", searchTerm), filteredParticulieres.length > 0
    ]),
    reprise: checkMatch("3.3 Visites de reprise de travail", [
      match("Maladie professionnelle", searchTerm), match("Accidents de travail", searchTerm), match("Congé de maternité", searchTerm), match("Arrêt de travail d'au moins 21 jours", searchTerm), match("Absences répétées", searchTerm)
    ]),
    spontanees: checkMatch("3.4 Visites spontanées", [
      match("À la demande de l'employeur", searchTerm), match("À la demande de l'agent", searchTerm), match("Total des visites", searchTerm)
    ]),
    urgences: checkMatch("3.5 Urgences médico-chirurgicales", [filteredUrgences.length > 0]),
    soins: checkMatch("3.6 Visites médicales de soins", [
      match("Travailleurs Sonatrach", searchTerm), match("Total", searchTerm)
    ]),
  };

  const defaultValues = Object.entries(matches).filter(([_, v]) => v).map(([k]) => k);

  if (searchTerm && defaultValues.length === 0) return null;

  const handleSave = (e: any) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Activité clinique de médecine de travail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-0">
          <Accordion type="multiple" value={searchTerm ? defaultValues : undefined} className="w-full">
            {matches.embauche && (
              <AccordionItem value="embauche">
                <AccordionTrigger>3.1 Visites d'embauche</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Personnel permanent</TableHead>
                        <TableHead>Personnel contractuel</TableHead>
                        <TableHead>Apprentis</TableHead>
                        <TableHead>Total des visites</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Total" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.nuisance && (
              <AccordionItem value="nuisance">
                <AccordionTrigger>Identification de la nuisance</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nuisances</TableHead>
                        <TableHead>Personnel exposé</TableHead>
                        <TableHead>Personnel examiné</TableHead>
                        <TableHead>Nombre visites</TableHead>
                        <TableHead>Taux couverture</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNuisances.map((category) => (
                        <React.Fragment key={category.label}>
                          <TableRow className="bg-gray-50">
                            <TableCell className="font-semibold">{category.label}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {category.items.map((item) => (
                            <TableRow key={item}>
                              <TableCell className="pl-6">• {item}</TableCell>
                              <TableCell><Input placeholder="Nombre" /></TableCell>
                              <TableCell><Input placeholder="Nombre" /></TableCell>
                              <TableCell><Input placeholder="Nombre" /></TableCell>
                              <TableCell><Input placeholder="%" /></TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    <p>(*) Préciser le dernier contrôle dosimétrique, date</p>
                    <p>(**) Travaux dans les postes de sécurité: Conducteurs d'engins; tableau de commande, TC</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.periodique && (
              <AccordionItem value="periodique">
                <AccordionTrigger>3.2 Visites périodiques</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {(!searchTerm || match("Visite annuelle", searchTerm)) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>3.2.1 Visite annuelle</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Effectif soumis à la visite (organiques)</TableHead>
                                <TableHead>Personnel examiné</TableHead>
                                <TableHead>Taux de couverture</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell><Input placeholder="Nombre" /></TableCell>
                                <TableCell><Input placeholder="Nombre" /></TableCell>
                                <TableCell><Input placeholder="%" /></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          
                          <Table className="mt-4">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Effectif soumis à la visite (SIE)</TableHead>
                                <TableHead>Personnel examiné</TableHead>
                                <TableHead>Taux de couverture</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell><Input placeholder="Nombre" /></TableCell>
                                <TableCell><Input placeholder="Nombre" /></TableCell>
                                <TableCell><Input placeholder="%" /></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {filteredParticulieres.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>3.2.2 Visites particulières</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Population</TableHead>
                                <TableHead>Effectif soumis à la visite</TableHead>
                                <TableHead>Personnel examiné</TableHead>
                                <TableHead>Nombre de visites</TableHead>
                                <TableHead>Taux de couverture</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredParticulieres.map(p => (
                                <TableRow key={p}>
                                  <TableCell>{p}</TableCell>
                                  <TableCell><Input placeholder="Nombre" /></TableCell>
                                  <TableCell><Input placeholder="Nombre" /></TableCell>
                                  <TableCell><Input placeholder="Nombre" /></TableCell>
                                  <TableCell><Input placeholder="%" /></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.reprise && (
              <AccordionItem value="reprise">
                <AccordionTrigger>3.3 Visites de reprise de travail</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Maladie professionnelle</TableHead>
                        <TableHead>Accidents de travail</TableHead>
                        <TableHead>Congé de maternité</TableHead>
                        <TableHead>Arrêt de travail d'au moins 21 jours</TableHead>
                        <TableHead>Absences répétées</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.spontanees && (
              <AccordionItem value="spontanees">
                <AccordionTrigger>3.4 Visites spontanées</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>À la demande de l'employeur</TableHead>
                        <TableHead>À la demande de l'agent</TableHead>
                        <TableHead>Total des visites</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Total" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.urgences && (
              <AccordionItem value="urgences">
                <AccordionTrigger>3.5 Urgences médico-chirurgicales</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Désignation</TableHead>
                        <TableHead>Prise en charge totalement</TableHead>
                        <TableHead>Évacué vers une autre structure</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUrgences.map(u => (
                        <TableRow key={u}>
                          <TableCell>{u}</TableCell>
                          <TableCell><Input placeholder="Nombre" /></TableCell>
                          <TableCell><Input placeholder="Nombre" /></TableCell>
                          <TableCell><Input placeholder="Total" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}

            {matches.soins && (
              <AccordionItem value="soins">
                <AccordionTrigger>3.6 Visites médicales de soins</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Travailleurs Sonatrach</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Total" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">Enregistrer</Button>
      </div>
      {saved && <div className="text-green-600 font-bold">Enregistré avec succès !</div>}
    </form>
  );
};

export default ActivitieClinic3;
