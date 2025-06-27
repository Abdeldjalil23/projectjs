import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const sections = [
  { value: "general", label: "Infos" },
  { value: "postes", label: "Postes Occup." },
  { value: "antecedentsp", label: "Antécéd. P." },
  { value: "antecedentsf", label: "Antécéd. F." },
  { value: "accidents", label: "Accidents" },
  { value: "vaccins", label: "Vaccins" },
  { value: "intoxications", label: "Intox." },
  { value: "visite2", label: "Visite 2" },
  { value: "peau", label: "Peau" },
  { value: "opht", label: "Ophtalmo" },
  { value: "orl", label: "ORL" },
  { value: "locomoteur", label: "Locomot." },
  { value: "respiratoire", label: "Respi" },
  { value: "cardio", label: "Cardio" },
  { value: "digestif", label: "Digestif" },
  { value: "urinaire", label: "Urinaire" },
  { value: "neuro", label: "Neuro" },
  { value: "hemato", label: "Hémato" },
  { value: "endocrino", label: "Endoc." },
  { value: "explorations", label: "Expl." },
  { value: "examens", label: "Exam." },
  { value: "orientation", label: "Orien." },
];

export default function Visite1() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full overflow-x-auto flex-nowrap border-b bg-white" style={{ direction: 'ltr' }}>
          {sections.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-[110px] px-4 py-2 text-base font-medium rounded-none border-0 border-b-2 border-transparent text-gray-600 transition-colors duration-200 bg-transparent data-[state=active]:text-orange-600 data-[state=active]:border-orange-500 data-[state=active]:bg-white focus-visible:outline-none"
              style={{ marginInlineEnd: 4 }}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="postes"><div className="p-4 text-gray-500">Postes Occupés (à compléter...)</div></TabsContent>
        <TabsContent value="antecedentsp"><div className="p-4 text-gray-500">Antécédents Personnels (à compléter...)</div></TabsContent>
        <TabsContent value="antecedentsf"><div className="p-4 text-gray-500">Antécédents Familiaux (à compléter...)</div></TabsContent>
        <TabsContent value="accidents"><div className="p-4 text-gray-500">Accidents (à compléter...)</div></TabsContent>
        <TabsContent value="vaccins"><div className="p-4 text-gray-500">Vaccins (à compléter...)</div></TabsContent>
        <TabsContent value="intoxications"><div className="p-4 text-gray-500">Intoxications (à compléter...)</div></TabsContent>
        <TabsContent value="visite2"><div className="p-4 text-gray-500">Visite 2 (à compléter...)</div></TabsContent>
        {/* Infos Générales */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label>Poids</label>
              <Input type="number" placeholder="Poids (kg)" />
            </div>
            <div>
              <label>Taille</label>
              <Input type="number" placeholder="Taille (cm)" />
            </div>
            <div>
              <label>PT</label>
              <Input placeholder="PT" />
            </div>
            <div>
              <label>Date de l'examen</label>
              <Input type="date" />
            </div>
            <div>
              <label>Médecin</label>
              <Input placeholder="Nom du médecin" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">Urines</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>A Jeûn</label>
                  <Input placeholder="A" />
                </div>
                <div>
                  <label>Post Prand</label>
                  <Input placeholder="S" />
                </div>
                <div>
                  <label>Pas d'urine</label>
                  <Input placeholder="Ph" />
                </div>
                <div>
                  <label>Cc</label>
                  <Input placeholder="Cc" />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Audition</label>
              <div className="flex gap-2">
                <div>
                  <label>OD</label>
                  <Input placeholder="OD" />
                </div>
                <div>
                  <label>OG</label>
                  <Input placeholder="OG" />
                </div>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Vision sans correction</label>
              <div className="flex gap-2">
                <div>
                  <label>De près D</label>
                  <Input placeholder="D" />
                </div>
                <div>
                  <label>De près G</label>
                  <Input placeholder="G" />
                </div>
                <div>
                  <label>De loin D</label>
                  <Input placeholder="D" />
                </div>
                <div>
                  <label>De loin G</label>
                  <Input placeholder="G" />
                </div>
                <div>
                  <label>Couleurs</label>
                  <Input placeholder="Couleurs" />
                </div>
              </div>
              <label className="block font-semibold mt-2 mb-1">Avec correction</label>
              <div className="flex gap-2">
                <div>
                  <label>D</label>
                  <Input placeholder="D" />
                </div>
                <div>
                  <label>G</label>
                  <Input placeholder="G" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        {/* Peau et muqueuses */}
        <TabsContent value="peau">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <label>Allergie</label>
              <Textarea placeholder="Détails de l'allergie ou remarques..." />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Ophtalmo */}
        <TabsContent value="opht">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2"><Checkbox /> Larmoiement</label>
                <label className="flex items-center gap-2"><Checkbox /> Douleur</label>
                <label className="flex items-center gap-2"><Checkbox /> Taches devant les yeux</label>
                <label className="flex items-center gap-2"><Checkbox /> Oeil rouge</label>
                <label className="flex items-center gap-2"><Checkbox /> Fatigue</label>
                <label className="flex items-center gap-2"><Checkbox /> Autre</label>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* ORL */}
        <TabsContent value="orl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2"><Checkbox /> Sifflements</label>
                <label className="flex items-center gap-2"><Checkbox /> Angines répétées</label>
                <label className="flex items-center gap-2"><Checkbox /> Epistaxis</label>
                <label className="flex items-center gap-2"><Checkbox /> Rhinorrhée</label>
                <label className="flex items-center gap-2"><Checkbox /> Entend mal</label>
                <label className="flex items-center gap-2"><Checkbox /> Otorrhées</label>
                <label className="flex items-center gap-2"><Checkbox /> Eternuement</label>
                <label className="flex items-center gap-2"><Checkbox /> Autre</label>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Locomoteur */}
        <TabsContent value="locomoteur">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <div className="mb-2">Douleurs :</div>
              <div className="flex flex-wrap gap-4 mb-2">
                <label className="flex items-center gap-2"><Checkbox /> Musculaires</label>
                <label className="flex items-center gap-2"><Checkbox /> Articulaires</label>
                <label className="flex items-center gap-2"><Checkbox /> Vertébrales</label>
                <label className="flex items-center gap-2"><Checkbox /> Névralgiques</label>
              </div>
              <label>Gêne des mouvements</label>
              <Input placeholder="" />
              <label>Fatigabilité</label>
              <Input placeholder="" />
              <label>Autre</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Respi */}
        <TabsContent value="respiratoire">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <label className="flex items-center gap-2"><Checkbox /> Toux</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2"><Checkbox /> Nocturne</label>
                <label className="flex items-center gap-2"><Checkbox /> Diurne</label>
              </div>
              <label className="flex items-center gap-2"><Checkbox /> Dyspnée</label>
              <label>Expectorations</label>
              <Input placeholder="" />
              <label>Douleurs thoraciques</label>
              <Input placeholder="" />
              <label className="flex items-center gap-2"><Checkbox /> Tabac</label>
              <label>Autre</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Cardio */}
        <TabsContent value="cardio">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <label className="flex items-center gap-2"><Checkbox /> Palpitations</label>
              <label className="flex items-center gap-2"><Checkbox /> Oedèmes</label>
              <label className="flex items-center gap-2"><Checkbox /> Douleurs à la marche</label>
              <label className="flex items-center gap-2"><Checkbox /> Douleurs thoraciques</label>
              <div className="mb-2">Dyspnée :</div>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2"><Checkbox /> d'effort</label>
                <label className="flex items-center gap-2"><Checkbox /> permanente</label>
              </div>
              <label>Autre</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <label>Pouls</label>
              <Input placeholder="" />
              <label>T.A</label>
              <Input placeholder="" />
              <label>Varices</label>
              <Input placeholder="" />
              <label>Cyanose</label>
              <Input placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Digestif */}
        <TabsContent value="digestif">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <label>Appétit</label>
              <Input placeholder="" />
              <label>Transit</label>
              <Input placeholder="" />
              <label>Sellles</label>
              <Input placeholder="" />
              <div className="flex flex-wrap gap-4 mb-2">
                <label className="flex items-center gap-2"><Checkbox /> Alcool</label>
                <label className="flex items-center gap-2"><Checkbox /> Pyrosis</label>
                <label className="flex items-center gap-2"><Checkbox /> Irritants</label>
                <label className="flex items-center gap-2"><Checkbox /> Vomissements</label>
                <label className="flex items-center gap-2"><Checkbox /> Rectorragies</label>
              </div>
              <label>Douleurs abdominales</label>
              <Input placeholder="" />
              <label>Autre</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <label>Denture</label>
              <Input placeholder="" />
              <label>Hernie</label>
              <Input placeholder="" />
              <label>Foie</label>
              <Input placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Urinaire */}
        <TabsContent value="urinaire">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <div className="flex flex-wrap gap-4 mb-2">
                <label className="flex items-center gap-2"><Checkbox /> Mictions nocturnes</label>
                <label className="flex items-center gap-2"><Checkbox /> Pollakiurie</label>
                <label className="flex items-center gap-2"><Checkbox /> Hématurie</label>
                <label className="flex items-center gap-2"><Checkbox /> Brûlures mictionnelles</label>
                <label className="flex items-center gap-2"><Checkbox /> Coliques néphrétiques</label>
                <label className="flex items-center gap-2"><Checkbox /> Pertes</label>
                <label className="flex items-center gap-2"><Checkbox /> Menstruations</label>
              </div>
              <label>Dysurie</label>
              <RadioGroup className="flex gap-4">
                <label className="flex items-center gap-2"><RadioGroupItem value="oui" /> Oui</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="non" /> Non</label>
              </RadioGroup>
              <label>Autre</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <label>Bourses</label>
              <Input placeholder="" />
              <label>Seins</label>
              <Input placeholder="" />
              <label>T.R</label>
              <Input placeholder="" />
              <label>T.V</label>
              <Input placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Neuro */}
        <TabsContent value="neuro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <div className="flex flex-wrap gap-4 mb-2">
                <label>Sommeil</label>
                <Input placeholder="" />
                <label>Céphalées</label>
                <Input placeholder="" />
                <label>Vertiges</label>
                <Input placeholder="" />
                <label>Peur de vide</label>
                <Input placeholder="" />
                <label>Perte de connaissance</label>
                <Input placeholder="" />
                <label>Parésies</label>
                <Input placeholder="" />
                <label>Paresthésies</label>
                <Input placeholder="" />
                <label>Autre</label>
                <Input placeholder="" />
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <div className="flex flex-wrap gap-4 mb-2">
                <label>Tremblement</label>
                <Input placeholder="" />
                <label>Romberg</label>
                <Input placeholder="" />
                <label>Coordination</label>
                <Input placeholder="" />
                <label>Sensibilité</label>
                <Input placeholder="" />
                <label>Motricité</label>
                <Input placeholder="" />
              </div>
              <div className="font-semibold mt-2 mb-1">Réflexes</div>
              <div className="flex flex-wrap gap-4 mb-2">
                <label>Rotuliens D</label>
                <Input placeholder="" className="w-16" />
                <label>G</label>
                <Input placeholder="" className="w-16" />
                <label>Achilléens D</label>
                <Input placeholder="" className="w-16" />
                <label>G</label>
                <Input placeholder="" className="w-16" />
                <label>Oculaires D</label>
                <Input placeholder="" className="w-16" />
                <label>G</label>
                <Input placeholder="" className="w-16" />
              </div>
            </div>
          </div>
        </TabsContent>
        {/* Hémato */}
        <TabsContent value="hemato">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-semibold mb-2">Interrogatoire</div>
              <label>Ecchymoses</label>
              <Input placeholder="" />
              <label>Tendances aux hémorragies</label>
              <Input placeholder="" />
            </div>
            <div>
              <div className="font-semibold mb-2">Examen clinique</div>
              <label>Rate</label>
              <Input placeholder="" />
              <label>Pétéchies</label>
              <Input placeholder="" />
              <label>Purpura</label>
              <Input placeholder="" />
              <label>GG</label>
              <Input placeholder="" />
              <label>Cervicaux</label>
              <Input placeholder="" />
              <label>Sus-claviculaires</label>
              <Input placeholder="" />
              <label>Axillaires</label>
              <Input placeholder="" />
              <label>Inguinaux</label>
              <Input placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Endoc. */}
        <TabsContent value="endocrino">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label>Obésité familiale</label>
              <RadioGroup className="flex gap-4">
                <label className="flex items-center gap-2"><RadioGroupItem value="oui" /> Oui</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="non" /> Non</label>
              </RadioGroup>
              <label>Maigreur familiale</label>
              <RadioGroup className="flex gap-4">
                <label className="flex items-center gap-2"><RadioGroupItem value="oui" /> Oui</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="non" /> Non</label>
              </RadioGroup>
              <label>Thyroïde</label>
              <Input placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Explorations fonctionnelles */}
        <TabsContent value="explorations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>Fonction respiratoire</label>
              <Textarea placeholder="" />
            </div>
            <div>
              <label>Fonction circulatoire</label>
              <Textarea placeholder="" />
            </div>
            <div>
              <label>Fonction motrice</label>
              <Textarea placeholder="" />
            </div>
          </div>
        </TabsContent>
        {/* Examens complémentaires */}
        <TabsContent value="examens">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>Radiologiques</label>
              <Textarea placeholder="Résultats..." />
            </div>
            <div>
              <label>Biologiques</label>
              <Textarea placeholder="Résultats..." />
            </div>
            <div>
              <label>Toxicologiques</label>
              <Textarea placeholder="Résultats..." />
            </div>
          </div>
        </TabsContent>
        {/* Orientation & Aptitude */}
        <TabsContent value="orientation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label>Spécialité</label>
              <Input placeholder="" />
              <div className="flex flex-wrap gap-4 mb-2 mt-2">
                <label className="flex items-center gap-2"><Checkbox /> Pour avis</label>
                <label className="flex items-center gap-2"><Checkbox /> Pour traitement</label>
                <label className="flex items-center gap-2"><Checkbox /> Service social</label>
                <label className="flex items-center gap-2"><Checkbox /> Service emploi</label>
              </div>
              <label>Hospitalisation</label>
              <RadioGroup className="flex gap-4">
                <label className="flex items-center gap-2"><RadioGroupItem value="oui" /> Oui</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="non" /> Non</label>
              </RadioGroup>
              <label>Réponse</label>
              <Input placeholder="" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Aptitude au travail</label>
              <RadioGroup className="flex gap-4 mb-2">
                <label className="flex items-center gap-2"><RadioGroupItem value="apte" /> Apte</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="temporaire" /> Inapte Temporaire</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="definitif" /> Inapte définitif</label>
              </RadioGroup>
              <label>Apte avec réserves</label>
              <Input placeholder="" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label>Postes conseillés</label>
                  <Textarea placeholder="" />
                </div>
                <div>
                  <label>Postes déconseillés</label>
                  <Textarea placeholder="" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-4 mt-8">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Enregistrer</button>
        <button className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition">Imprimer</button>
      </div>
    </div>
  );
}
