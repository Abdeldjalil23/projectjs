import React, { useState } from 'react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ActivitieClinic3 = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activité clinique de médecine de travail</CardTitle>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="w-full">
        {/* 3.1 Visites d'embauche */}
        <AccordionItem value="visites-embauche">
          <AccordionTrigger>3.1 Visites d'embauche</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Identification de la nuisance */}
        <AccordionItem value="identification-nuisance">
          <AccordionTrigger>Identification de la nuisance</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
                    {/* Nuisances chimiques */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Nuisances chimiques</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• C-inorganique, organométallique</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Hydrocarbures</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Matières plastiques</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Gaz et vapeurs</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>

                    {/* Nuisances biologiques */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Nuisances biologiques</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Personnel de santé</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Personnel de cuisines</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Personnel de l'assainissement</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>

                    {/* Nuisances physiques */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Nuisances physiques</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Bruit</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Rayonnement (*)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Vibrations</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Travail sur écran</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>

                    {/* Nuisances psycho-chimiques */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Nuisances psycho-chimiques</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Poussières</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>

                    {/* Travail posté */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Travail posté</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• 2 x 12</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• 3 x 8</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>

                    {/* Postes de sécurité */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-semibold">Postes de sécurité (*)</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Poussières</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-6">• Autres (à préciser)</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="%" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>(*) Préciser le dernier contrôle dosimétrique, date</p>
                  <p>(**) Travaux dans les postes de sécurité: Conducteurs d'engins; tableau de commande, TC</p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* 3.2 Visites périodiques */}
        <AccordionItem value="visites-periodiques">
          <AccordionTrigger>3.2 Visites périodiques</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* 3.2.1 Visite annuelle */}
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
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    Note: Visite obligatoire pour tous les travailleurs; pour les travailleurs qui nécessitent une surveillance médicale particulière, leur première visite est reportée sur le tableau de la visite annuelle, les autres visites sont enregistrées sur le tableau des visites particulières.
                  </p>
                </CardContent>
              </Card>

              {/* 3.2.2 Visites particulières */}
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
                      <TableRow>
                        <TableCell>Apprentis</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Travailleurs fortement exposés aux risques professionnels</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Travailleurs responsables de la sécurité (*)</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Travailleurs âgés de moins de 18 ans</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Travailleurs âgés de plus de 55 ans</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Handicapés physiques</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Malades chroniques</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Femmes enceintes</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Mères d'un enfant de moins de 02 ans</TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="Nombre" /></TableCell>
                        <TableCell><Input placeholder="%" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    Note: (*) Personnel chargé de la sûreté des installations et des personnes (SIE); le taux de couverture représente le nombre des travailleurs examinés sur l'effectif.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3.3 Visites de reprise de travail */}
        <AccordionItem value="visites-reprise">
          <AccordionTrigger>3.3 Visites de reprise de travail</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* 3.4 Visites spontanées */}
        <AccordionItem value="visites-spontanees">
          <AccordionTrigger>3.4 Visites spontanées</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* 3.5 Urgences médico-chirurgicales */}
        <AccordionItem value="urgences">
          <AccordionTrigger>3.5 Urgences médico-chirurgicales</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Désignation</TableHead>
                      <TableHead>Prise en charge totalement par des structures de Sonatrach</TableHead>
                      <TableHead>Évacué vers une autre structure extra Sonatrach</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Médicales</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Total" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chirurgicales</TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Nombre" /></TableCell>
                      <TableCell><Input placeholder="Total" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* 3.6 Visites médicales de soins */}
        <AccordionItem value="visites-soins">
          <AccordionTrigger>3.6 Visites médicales de soins</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button type="submit">Enregistrer</Button>
      </div>
      {saved && <div className="text-green-600 font-bold">Enregistré avec succès !</div>}
    </form>
  );
};

export default ActivitieClinic3;
