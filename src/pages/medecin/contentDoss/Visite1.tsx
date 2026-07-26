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

// نموذج الحالة الأولية لكل قسم (يمكنك التوسع لاحقًا)
const initialState = {
  typeVisite: '', // 'embauche' | 'periodique'
  date: '',
  docteur: '',
  poids: '',
  taille: '',
  pt: '',
  urines: {
    aJeun: '', // 'A', 'S', ''
    post: '',  // 'Post', 'H', ''
    prand: '', // 'Prand', 'Ph', ''
    pas: '',   // 'Pas', 'Cc', ''
  },
  audition: { od: '', og: '' },
  vision: { sansCorrection: { dp: '', dg: '', lp: '', lg: '' }, avecCorrection: { dp: '', dg: '', lp: '', lg: '' }, couleurs: '' },
  peau: { 
    allergie: false,
    etatPeau: '',
    muqueuses: '',
    autre: '',
    examenClinique: '',
  },
  opht: { 
    larmoiement: false, 
    douleur: false, 
    taches: false, 
    oeilRouge: false, 
    fatigue: false, 
    autre: '',
    conjonctives: '',
    cornee: '',
    pupilles: '',
    fondOeil: '',
    examenClinique: '',
  },
  orl: { 
    sifflements: false, 
    angines: false, 
    epistaxis: false, 
    rhinorhee: '', 
    entendMal: false, 
    otorrhees: false, 
    eternuement: false, 
    autre: '',
    nez: '',
    gorge: '',
    oreilles: '',
    audition: '',
    examenClinique: '',
  },
  locomoteur: { 
    douleurs: { musculaires: false, articulaires: false, vertebrales: false, nevralgiques: false }, 
    gene: '', 
    fatiguabilite: '', 
    autre: '',
    mobilite: '',
    force: '',
    autreExamen: '',
    examenClinique: ''
  },
  respiratoire: { 
    toux: false, 
    nocturne: false, 
    diurne: false, 
    dyspnee: false, 
    expectorations: '', 
    douleursThoraciques: false, 
    tabac: false, 
    autre: '',
    auscultation: '',
    percussion: '',
    examenClinique: '',
  },
  cardio: { 
    palpitations: false, 
    oedemes: false, 
    douleursMarche: false, 
    douleursThoraciques: false, 
    dyspneeEffort: false, 
    dyspneePermanente: false, 
    pouls: '', 
    ta: '', 
    varices: '', 
    cyanose: '', 
    autre: '',
    auscultation: '',
    electrocardiogramme: '',
    autreExamen: ''
  },
  digestif: { 
    appetit: '', 
    transit: '', 
    selles: '', 
    alcool: false, 
    pyrosis: false, 
    irritants: false, 
    vomissements: false, 
    rectorragies: false, 
    douleursAbdo: '', 
    autre: '',
    denture: '',
    hernie: '',
    foie: '',
    autreExamen: ''
  },
  genito: { 
    mictionsNocturnes: false, 
    pallakiurie: false, 
    hematurieDysurie: '', 
    bruluresColiques: '', 
    pertes: '', 
    menstruations: '', 
    autre: '',
    bourses: '',
    seins: '',
    tr: '',
    tv: ''
  },
  examenClinique: { denture: '', hernie: '', foie: '', bourses: '', seins: '', tr: '', tv: '' },
  neuro: {
    sommeil: '',
    cephalees: '',
    vertiges: '',
    peurVide: false,
    perteConnaissance: '',
    paresies: false,
    paresthesies: false,
    tremblement: '',
    romberg: '',
    coordination: '',
    sensibilite: '',
    motricite: '',
    reflexes: {
      rotuliensD: '',
      rotuliensG: '',
      achilleensD: '',
      achilleensG: '',
      oculairesD: '',
      oculairesG: '',
    },
    autre: '',
  },
  hemato: { ecchymosesTendances: '', rate: '', petechies: '', purpura: '', cervicaux: '', susClaviculaires: '', axillaires: '', inguinaux: '' },
  endocrino: { obesiteMaigreur: '', thyroide: '' },
  explorations: { respiratoire: '', circulatoire: '', motrice: '' },
  examens: { radiologiques: '', biologiques: '', toxicologiques: '' },
  orientation: { specialite: '', pourAvisTraitement: '', hospitalisation: false, serviceSocialEmploi: '', reponse: '' },
  aptitude: { apte: false, inapteTemp: false, inapteDef: false, apteReserve: false, postesConseilles: '', postesDeconseilles: '' },
};

const Visite1 = () => {
  const [form, setForm] = useState(initialState);
  const [saved, setSaved] = useState(false);

  // دالة مساعدة لتغيير القيم
  const handleChange = (section, field, value, subfield) => {
    setForm((prev) => {
      if (subfield) {
        // للحقول المتداخلة مثل reflexes
        const currentSection = prev[section] || {};
        const currentField = currentSection[field] || {};
        return { 
          ...prev, 
          [section]: { 
            ...currentSection, 
            [field]: { 
              ...currentField, 
              [subfield]: value 
            } 
          } 
        };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  // دالة مساعدة لتغيير القيم في المستوى الأعلى
  const handleRootChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // دالة الحفظ
  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    // هنا يمكنك إرسال البيانات إلى API أو أي معالجة أخرى
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visite médicale périodique / d'embauche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Type de visite</Label>
              <RadioGroup value={form.typeVisite} onValueChange={v => handleRootChange('typeVisite', v)}>
                <div className="flex items-center gap-2"><RadioGroupItem value="embauche" id="visite-embauche" /><Label htmlFor="visite-embauche">D'embauche</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="periodique" id="visite-periodique" /><Label htmlFor="visite-periodique">Périodique</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => handleRootChange('date', e.target.value)} />
            </div>
            <div>
              <Label>Médecin</Label>
              <Input value={form.docteur} onChange={e => handleRootChange('docteur', e.target.value)} />
            </div>
          </div>
          {/* Urines */}
          <div className="mb-4">
            <Label className="block mb-1">Urines</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <Label>A Jeûn</Label>
                <RadioGroup value={form.urines.aJeun} onValueChange={v => setForm(f => ({ ...f, urines: { ...f.urines, aJeun: v } }))}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="A" id="urines-ajeun-a" /><Label htmlFor="urines-ajeun-a">A</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="S" id="urines-ajeun-s" /><Label htmlFor="urines-ajeun-s">S</Label></div>
                </RadioGroup>
              </div>
              <div>
                <Label>Post</Label>
                <RadioGroup value={form.urines.post} onValueChange={v => setForm(f => ({ ...f, urines: { ...f.urines, post: v } }))}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Post" id="urines-post-post" /><Label htmlFor="urines-post-post">Post</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="H" id="urines-post-h" /><Label htmlFor="urines-post-h">H</Label></div>
                </RadioGroup>
              </div>
              <div>
                <Label>Prand</Label>
                <RadioGroup value={form.urines.prand} onValueChange={v => setForm(f => ({ ...f, urines: { ...f.urines, prand: v } }))}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Prand" id="urines-prand-prand" /><Label htmlFor="urines-prand-prand">Prand</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Ph" id="urines-prand-ph" /><Label htmlFor="urines-prand-ph">Ph</Label></div>
                </RadioGroup>
              </div>
              <div>
                <Label>Pas d'urine</Label>
                <RadioGroup value={form.urines.pas} onValueChange={v => setForm(f => ({ ...f, urines: { ...f.urines, pas: v } }))}>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Pas" id="urines-pas-pas" /><Label htmlFor="urines-pas-pas">Pas</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Cc" id="urines-pas-cc" /><Label htmlFor="urines-pas-cc">Cc</Label></div>
                </RadioGroup>
              </div>
            </div>
          </div>
          {/* Audition & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Audition</Label>
              <div className="flex gap-2">
                <div>
                  <Label>OD</Label>
                  <Input value={form.audition.od} onChange={e => setForm(f => ({ ...f, audition: { ...f.audition, od: e.target.value } }))} />
                </div>
                <div>
                  <Label>OG</Label>
                  <Input value={form.audition.og} onChange={e => setForm(f => ({ ...f, audition: { ...f.audition, og: e.target.value } }))} />
                </div>
              </div>
            </div>
            <div>
              <Label>Vision sans correction</Label>
              <div className="flex gap-2 mb-1">
                <div>
                  <Label>De près D</Label>
                  <Input value={form.vision.sansCorrection.dp} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, sansCorrection: { ...f.vision.sansCorrection, dp: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De près G</Label>
                  <Input value={form.vision.sansCorrection.dg} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, sansCorrection: { ...f.vision.sansCorrection, dg: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De loin D</Label>
                  <Input value={form.vision.sansCorrection.lp} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, sansCorrection: { ...f.vision.sansCorrection, lp: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De loin G</Label>
                  <Input value={form.vision.sansCorrection.lg} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, sansCorrection: { ...f.vision.sansCorrection, lg: e.target.value } } }))} />
                </div>
              </div>
              <Label>Vision avec correction</Label>
              <div className="flex gap-2 mb-1">
                <div>
                  <Label>De près D</Label>
                  <Input value={form.vision.avecCorrection.dp} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, avecCorrection: { ...f.vision.avecCorrection, dp: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De près G</Label>
                  <Input value={form.vision.avecCorrection.dg} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, avecCorrection: { ...f.vision.avecCorrection, dg: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De loin D</Label>
                  <Input value={form.vision.avecCorrection.lp} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, avecCorrection: { ...f.vision.avecCorrection, lp: e.target.value } } }))} />
                </div>
                <div>
                  <Label>De loin G</Label>
                  <Input value={form.vision.avecCorrection.lg} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, avecCorrection: { ...f.vision.avecCorrection, lg: e.target.value } } }))} />
                </div>
              </div>
              <div>
                <Label>Couleurs</Label>
                <Input value={form.vision.couleurs} onChange={e => setForm(f => ({ ...f, vision: { ...f.vision, couleurs: e.target.value } }))} />
              </div>
            </div>
          </div>
          {/* Poids, Taille, PT تبقى كما هي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Poids</Label>
              <Input value={form.poids} onChange={e => handleRootChange('poids', e.target.value)} />
            </div>
            <div>
              <Label>Taille</Label>
              <Input value={form.taille} onChange={e => handleRootChange('taille', e.target.value)} />
            </div>
            <div>
              <Label>PT</Label>
              <Input value={form.pt} onChange={e => handleRootChange('pt', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Accordion type="multiple" className="w-full">
        {/* Peau et muqueuses */}
        <AccordionItem value="peau">
          <AccordionTrigger>Peau et muqueuses</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.peau.allergie} onCheckedChange={v => handleChange('peau', 'allergie', v, undefined)} id="peau-allergie" />
                  <Label htmlFor="peau-allergie">Allergie</Label>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <Textarea 
                  placeholder="Examen clinique de la peau et muqueuses..." 
                  value={form.peau.examenClinique} 
                  onChange={e => handleChange('peau', 'examenClinique', e.target.value, undefined)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Yeux */}
        <AccordionItem value="opht">
          <AccordionTrigger>Yeux</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2"><Checkbox checked={form.opht.larmoiement} onCheckedChange={v => handleChange('opht', 'larmoiement', v, undefined)} id="opht-larmoiement" /><Label htmlFor="opht-larmoiement">Larmoiement</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.opht.douleur} onCheckedChange={v => handleChange('opht', 'douleur', v, undefined)} id="opht-douleur" /><Label htmlFor="opht-douleur">Douleur</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.opht.taches} onCheckedChange={v => handleChange('opht', 'taches', v, undefined)} id="opht-taches" /><Label htmlFor="opht-taches">Taches devant les yeux</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.opht.oeilRouge} onCheckedChange={v => handleChange('opht', 'oeilRouge', v, undefined)} id="opht-oeilRouge" /><Label htmlFor="opht-oeilRouge">Œil rouge</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.opht.fatigue} onCheckedChange={v => handleChange('opht', 'fatigue', v, undefined)} id="opht-fatigue" /><Label htmlFor="opht-fatigue">Fatigue</Label></div>
                  <div><Label>Autre</Label><Input value={form.opht.autre} onChange={e => handleChange('opht', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <Textarea 
                  placeholder="Examen clinique des yeux..." 
                  value={form.opht.examenClinique} 
                  onChange={e => handleChange('opht', 'examenClinique', e.target.value, undefined)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* O.R.L. */}
        <AccordionItem value="orl">
          <AccordionTrigger>O.R.L.</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.sifflements} onCheckedChange={v => handleChange('orl', 'sifflements', v, undefined)} id="orl-sifflements" /><Label htmlFor="orl-sifflements">Sifflements</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.angines} onCheckedChange={v => handleChange('orl', 'angines', v, undefined)} id="orl-angines" /><Label htmlFor="orl-angines">Angines répétées</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.epistaxis} onCheckedChange={v => handleChange('orl', 'epistaxis', v, undefined)} id="orl-epistaxis" /><Label htmlFor="orl-epistaxis">Epistaxis</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.entendMal} onCheckedChange={v => handleChange('orl', 'entendMal', v, undefined)} id="orl-entendMal" /><Label htmlFor="orl-entendMal">Entend mal</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.otorrhees} onCheckedChange={v => handleChange('orl', 'otorrhees', v, undefined)} id="orl-otorrhees" /><Label htmlFor="orl-otorrhees">Otorrhées</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.orl.eternuement} onCheckedChange={v => handleChange('orl', 'eternuement', v, undefined)} id="orl-eternuement" /><Label htmlFor="orl-eternuement">Éternuement</Label></div>
                  <div><Label>Rhinorrhée</Label><Input value={form.orl.rhinorhee} onChange={e => handleChange('orl', 'rhinorhee', e.target.value, undefined)} /></div>
                  <div><Label>Autre</Label><Input value={form.orl.autre} onChange={e => handleChange('orl', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <Textarea 
                  placeholder="Examen clinique O.R.L..." 
                  value={form.orl.examenClinique} 
                  onChange={e => handleChange('orl', 'examenClinique', e.target.value, undefined)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Appareil locomoteur */}
        <AccordionItem value="locomoteur">
          <AccordionTrigger>Appareil locomoteur</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="font-semibold mb-1">Douleurs</div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.locomoteur.douleurs.musculaires} onCheckedChange={v => handleChange('locomoteur', 'douleurs', { ...form.locomoteur.douleurs, musculaires: v }, undefined)} id="locomoteur-musculaires" /><Label htmlFor="locomoteur-musculaires">Douleurs musculaires</Label></div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.locomoteur.douleurs.articulaires} onCheckedChange={v => handleChange('locomoteur', 'douleurs', { ...form.locomoteur.douleurs, articulaires: v }, undefined)} id="locomoteur-articulaires" /><Label htmlFor="locomoteur-articulaires">Douleurs articulaires</Label></div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.locomoteur.douleurs.vertebrales} onCheckedChange={v => handleChange('locomoteur', 'douleurs', { ...form.locomoteur.douleurs, vertebrales: v }, undefined)} id="locomoteur-vertebrales" /><Label htmlFor="locomoteur-vertebrales">Douleurs vertébrales</Label></div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.locomoteur.douleurs.nevralgiques} onCheckedChange={v => handleChange('locomoteur', 'douleurs', { ...form.locomoteur.douleurs, nevralgiques: v }, undefined)} id="locomoteur-nevralgiques" /><Label htmlFor="locomoteur-nevralgiques">Névralgique</Label></div>
                  <div><Label>Gêne des mouvements</Label><Input value={form.locomoteur.gene} onChange={e => handleChange('locomoteur', 'gene', e.target.value, undefined)} /></div>
                  <div><Label>Fatigabilité</Label><Input value={form.locomoteur.fatiguabilite} onChange={e => handleChange('locomoteur', 'fatiguabilite', e.target.value, undefined)} /></div>
                  <div><Label>Autre</Label><Input value={form.locomoteur.autre} onChange={e => handleChange('locomoteur', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <Textarea 
                  placeholder="Examen clinique de l'appareil locomoteur..." 
                  value={form.locomoteur.examenClinique} 
                  onChange={e => handleChange('locomoteur', 'examenClinique', e.target.value, undefined)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Appareil respiratoire */}
        <AccordionItem value="respiratoire">
          <AccordionTrigger>Appareil respiratoire</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2"><Checkbox checked={form.respiratoire.toux} onCheckedChange={v => handleChange('respiratoire', 'toux', v, undefined)} id="respiratoire-toux" /><Label htmlFor="respiratoire-toux">Toux</Label></div>
                  <div className="font-semibold mb-1">Dyspnée</div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.respiratoire.nocturne} onCheckedChange={v => handleChange('respiratoire', 'nocturne', v, undefined)} id="respiratoire-nocturne" /><Label htmlFor="respiratoire-nocturne">Nocturne</Label></div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.respiratoire.diurne} onCheckedChange={v => handleChange('respiratoire', 'diurne', v, undefined)} id="respiratoire-diurne" /><Label htmlFor="respiratoire-diurne">Diurne</Label></div>
                  <div><Label>Expectorations</Label><Input value={form.respiratoire.expectorations} onChange={e => handleChange('respiratoire', 'expectorations', e.target.value, undefined)} /></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.respiratoire.douleursThoraciques} onCheckedChange={v => handleChange('respiratoire', 'douleursThoraciques', v, undefined)} id="respiratoire-douleursThoraciques" /><Label htmlFor="respiratoire-douleursThoraciques">Douleurs thoraciques</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.respiratoire.tabac} onCheckedChange={v => handleChange('respiratoire', 'tabac', v, undefined)} id="respiratoire-tabac" /><Label htmlFor="respiratoire-tabac">Tabac</Label></div>
                  <div><Label>Autre</Label><Input value={form.respiratoire.autre} onChange={e => handleChange('respiratoire', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <Textarea 
                  placeholder="Examen clinique de l'appareil respiratoire..." 
                  value={form.respiratoire.examenClinique} 
                  onChange={e => handleChange('respiratoire', 'examenClinique', e.target.value, undefined)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Appareil cardio-vasculaire */}
        <AccordionItem value="cardio">
          <AccordionTrigger>Appareil cardio-vasculaire</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2"><Checkbox checked={form.cardio.palpitations} onCheckedChange={v => handleChange('cardio', 'palpitations', v, undefined)} id="cardio-palpitations" /><Label htmlFor="cardio-palpitations">Palpitations</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.cardio.oedemes} onCheckedChange={v => handleChange('cardio', 'oedemes', v, undefined)} id="cardio-oedemes" /><Label htmlFor="cardio-oedemes">Œdèmes</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.cardio.douleursMarche} onCheckedChange={v => handleChange('cardio', 'douleursMarche', v, undefined)} id="cardio-douleursMarche" /><Label htmlFor="cardio-douleursMarche">Douleurs à la marche</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.cardio.douleursThoraciques} onCheckedChange={v => handleChange('cardio', 'douleursThoraciques', v, undefined)} id="cardio-douleursThoraciques" /><Label htmlFor="cardio-douleursThoraciques">Douleurs thoraciques</Label></div>
                  <div className="font-semibold mb-1">Dyspnée</div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.cardio.dyspneeEffort} onCheckedChange={v => handleChange('cardio', 'dyspneeEffort', v, undefined)} id="cardio-dyspneeEffort" /><Label htmlFor="cardio-dyspneeEffort">Dyspnée d'effort</Label></div>
                  <div className="flex items-center gap-2 ml-4"><Checkbox checked={form.cardio.dyspneePermanente} onCheckedChange={v => handleChange('cardio', 'dyspneePermanente', v, undefined)} id="cardio-dyspneePermanente" /><Label htmlFor="cardio-dyspneePermanente">Dyspnée permanente</Label></div>
                  <div><Label>Autre</Label><Input value={form.cardio.autre} onChange={e => handleChange('cardio', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <div className="mb-1"><Label>Pouls</Label><Input value={form.cardio.pouls} onChange={e => handleChange('cardio', 'pouls', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>T.A.</Label><Input value={form.cardio.ta} onChange={e => handleChange('cardio', 'ta', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Varices</Label><Input value={form.cardio.varices} onChange={e => handleChange('cardio', 'varices', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Cyanose</Label><Input value={form.cardio.cyanose} onChange={e => handleChange('cardio', 'cyanose', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Autre</Label><Input value={form.cardio.autreExamen} onChange={e => handleChange('cardio', 'autreExamen', e.target.value, undefined)} /></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Appareil digestif */}
        <AccordionItem value="digestif">
          <AccordionTrigger>Appareil digestif</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div><Label>Appétit</Label><Input value={form.digestif.appetit} onChange={e => handleChange('digestif', 'appetit', e.target.value, undefined)} /></div>
                  <div><Label>Transit</Label><Input value={form.digestif.transit} onChange={e => handleChange('digestif', 'transit', e.target.value, undefined)} /></div>
                  <div><Label>Selles</Label><Input value={form.digestif.selles} onChange={e => handleChange('digestif', 'selles', e.target.value, undefined)} /></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.digestif.alcool} onCheckedChange={v => handleChange('digestif', 'alcool', v, undefined)} id="digestif-alcool" /><Label htmlFor="digestif-alcool">Alcool</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.digestif.pyrosis} onCheckedChange={v => handleChange('digestif', 'pyrosis', v, undefined)} id="digestif-pyrosis" /><Label htmlFor="digestif-pyrosis">Pyrosis</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.digestif.irritants} onCheckedChange={v => handleChange('digestif', 'irritants', v, undefined)} id="digestif-irritants" /><Label htmlFor="digestif-irritants">Irritants</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.digestif.vomissements} onCheckedChange={v => handleChange('digestif', 'vomissements', v, undefined)} id="digestif-vomissements" /><Label htmlFor="digestif-vomissements">Vomissements</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.digestif.rectorragies} onCheckedChange={v => handleChange('digestif', 'rectorragies', v, undefined)} id="digestif-rectorragies" /><Label htmlFor="digestif-rectorragies">Rectorragies</Label></div>
                  <div><Label>Douleurs abdominales</Label><Input value={form.digestif.douleursAbdo} onChange={e => handleChange('digestif', 'douleursAbdo', e.target.value, undefined)} /></div>
                  <div><Label>Autre</Label><Input value={form.digestif.autre} onChange={e => handleChange('digestif', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <div className="mb-1"><Label>Denture</Label><Input value={form.digestif.denture} onChange={e => handleChange('digestif', 'denture', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Hernie</Label><Input value={form.digestif.hernie} onChange={e => handleChange('digestif', 'hernie', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Foie</Label><Input value={form.digestif.foie} onChange={e => handleChange('digestif', 'foie', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Autre</Label><Input value={form.digestif.autreExamen} onChange={e => handleChange('digestif', 'autreExamen', e.target.value, undefined)} /></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Appareil génito-urinaire */}
        <AccordionItem value="genito">
          <AccordionTrigger>Appareil génito-urinaire</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2"><Checkbox checked={form.genito.mictionsNocturnes} onCheckedChange={v => handleChange('genito', 'mictionsNocturnes', v, undefined)} id="genito-mictionsNocturnes" /><Label htmlFor="genito-mictionsNocturnes">Mictions nocturnes</Label></div>
                  <div className="flex items-center gap-2"><Checkbox checked={form.genito.pallakiurie} onCheckedChange={v => handleChange('genito', 'pallakiurie', v, undefined)} id="genito-pallakiurie" /><Label htmlFor="genito-pallakiurie">Pollakiurie</Label></div>
                  <div className="mb-2">
                    <Label className="block mb-1">Hématurie / Dysurie</Label>
                    <RadioGroup value={form.genito.hematurieDysurie} onValueChange={v => handleChange('genito', 'hematurieDysurie', v, undefined)}>
                      <div className="flex items-center gap-2"><RadioGroupItem value="hematurie" id="genito-hematurie" /><Label htmlFor="genito-hematurie">Hématurie</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="dysurie" id="genito-dysurie" /><Label htmlFor="genito-dysurie">Dysurie</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="mb-2">
                    <Label className="block mb-1">Brûlures / Coliques</Label>
                    <RadioGroup value={form.genito.bruluresColiques} onValueChange={v => handleChange('genito', 'bruluresColiques', v, undefined)}>
                      <div className="flex items-center gap-2"><RadioGroupItem value="brulures" id="genito-brulures" /><Label htmlFor="genito-brulures">Brûlures mictionnelles</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="coliques" id="genito-coliques" /><Label htmlFor="genito-coliques">Coliques néphrétiques</Label></div>
                    </RadioGroup>
                  </div>
                  <div><Label>Pertes</Label><Input value={form.genito.pertes} onChange={e => handleChange('genito', 'pertes', e.target.value, undefined)} /></div>
                  <div><Label>Menstruations</Label><Input value={form.genito.menstruations} onChange={e => handleChange('genito', 'menstruations', e.target.value, undefined)} /></div>
                  <div><Label>Autre</Label><Input value={form.genito.autre} onChange={e => handleChange('genito', 'autre', e.target.value, undefined)} /></div>
                </div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <div className="mb-1"><Label>Bourses</Label><Input value={form.genito.bourses} onChange={e => handleChange('genito', 'bourses', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Seins</Label><Input value={form.genito.seins} onChange={e => handleChange('genito', 'seins', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>T.R</Label><Input value={form.genito.tr} onChange={e => handleChange('genito', 'tr', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>T.V</Label><Input value={form.genito.tv} onChange={e => handleChange('genito', 'tv', e.target.value, undefined)} /></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Neurologie / Psychisme */}
        <AccordionItem value="neuro">
          <AccordionTrigger>Neurologie / Psychisme</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interrogatoire */}
              <div>
                <div className="font-bold mb-2">Interrogatoire</div>
                <div className="mb-1"><Label>Céphalées</Label><Input value={form.neuro.cephalees} onChange={e => handleChange('neuro', 'cephalees', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Vertiges</Label><Input value={form.neuro.vertiges} onChange={e => handleChange('neuro', 'vertiges', e.target.value, undefined)} /></div>
                <div className="flex items-center gap-2 mb-1"><Checkbox checked={form.neuro.peurVide} onCheckedChange={v => handleChange('neuro', 'peurVide', v, undefined)} id="neuro-peurVide" /><Label htmlFor="neuro-peurVide">Peur du vide</Label></div>
                <div className="mb-1"><Label>Perte de connaissance</Label><Input value={form.neuro.perteConnaissance} onChange={e => handleChange('neuro', 'perteConnaissance', e.target.value, undefined)} /></div>
                <div className="flex items-center gap-2 mb-1"><Checkbox checked={form.neuro.paresies} onCheckedChange={v => handleChange('neuro', 'paresies', v, undefined)} id="neuro-paresies" /><Label htmlFor="neuro-paresies">Paresies</Label></div>
                <div className="flex items-center gap-2 mb-1"><Checkbox checked={form.neuro.paresthesies} onCheckedChange={v => handleChange('neuro', 'paresthesies', v, undefined)} id="neuro-paresthesies" /><Label htmlFor="neuro-paresthesies">Paresthésies</Label></div>
                <div className="mb-1"><Label>Sommeil</Label><Input value={form.neuro.sommeil} onChange={e => handleChange('neuro', 'sommeil', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Autre</Label><Input value={form.neuro.autre} onChange={e => handleChange('neuro', 'autre', e.target.value, undefined)} /></div>
              </div>
              {/* Examen clinique */}
              <div>
                <div className="font-bold mb-2">Examen clinique</div>
                <div className="mb-1"><Label>Tremblement</Label><Input value={form.neuro.tremblement} onChange={e => handleChange('neuro', 'tremblement', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Romberg</Label><Input value={form.neuro.romberg} onChange={e => handleChange('neuro', 'romberg', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Coordination</Label><Input value={form.neuro.coordination} onChange={e => handleChange('neuro', 'coordination', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Sensibilité</Label><Input value={form.neuro.sensibilite} onChange={e => handleChange('neuro', 'sensibilite', e.target.value, undefined)} /></div>
                <div className="mb-1"><Label>Motricité</Label><Input value={form.neuro.motricite} onChange={e => handleChange('neuro', 'motricite', e.target.value, undefined)} /></div>
                <div className="font-semibold mt-2 mb-1">Réflexes</div>
                <div className="mb-1">
                  <Label>Rotuliens</Label>
                  <div className="flex gap-2">
                    <Input placeholder="D" value={form.neuro.reflexes.rotuliensD} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, rotuliensD: e.target.value } } }))} className="w-16" />
                    <Input placeholder="G" value={form.neuro.reflexes.rotuliensG} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, rotuliensG: e.target.value } } }))} className="w-16" />
                  </div>
                </div>
                <div className="mb-1">
                  <Label>Achilléens</Label>
                  <div className="flex gap-2">
                    <Input placeholder="D" value={form.neuro.reflexes.achilleensD} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, achilleensD: e.target.value } } }))} className="w-16" />
                    <Input placeholder="G" value={form.neuro.reflexes.achilleensG} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, achilleensG: e.target.value } } }))} className="w-16" />
                  </div>
                </div>
                <div className="mb-1">
                  <Label>Oculaires</Label>
                  <div className="flex gap-2">
                    <Input placeholder="D" value={form.neuro.reflexes.oculairesD} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, oculairesD: e.target.value } } }))} className="w-16" />
                    <Input placeholder="G" value={form.neuro.reflexes.oculairesG} onChange={e => setForm(f => ({ ...f, neuro: { ...f.neuro, reflexes: { ...f.neuro.reflexes, oculairesG: e.target.value } } }))} className="w-16" />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Hématologie & GG */}
        <AccordionItem value="hemato">
          <AccordionTrigger>Hématologie & GG</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="mb-2">
                <Label className="block mb-1">Ecchymoses / Tendances hémorragiques</Label>
                <RadioGroup value={form.hemato.ecchymosesTendances} onValueChange={v => handleChange('hemato', 'ecchymosesTendances', v, undefined)} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="ecchymoses" id="hemato-ecchymoses" /><Label htmlFor="hemato-ecchymoses">Ecchymoses</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="tendances" id="hemato-tendances" /><Label htmlFor="hemato-tendances">Tendances aux hémorragies</Label></div>
                </RadioGroup>
              </div>
              <div className="col-span-2 md:col-span-4"><Label>Rate</Label><Input value={form.hemato.rate} onChange={e => handleChange('hemato', 'rate', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Pétéchies</Label><Input value={form.hemato.petechies} onChange={e => handleChange('hemato', 'petechies', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Purpura</Label><Input value={form.hemato.purpura} onChange={e => handleChange('hemato', 'purpura', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Cervicaux</Label><Input value={form.hemato.cervicaux} onChange={e => handleChange('hemato', 'cervicaux', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Sus-claviculaires</Label><Input value={form.hemato.susClaviculaires} onChange={e => handleChange('hemato', 'susClaviculaires', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Axillaires</Label><Input value={form.hemato.axillaires} onChange={e => handleChange('hemato', 'axillaires', e.target.value, undefined)} /></div>
              <div className="col-span-2 md:col-span-4"><Label>Inguinaux</Label><Input value={form.hemato.inguinaux} onChange={e => handleChange('hemato', 'inguinaux', e.target.value, undefined)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Endocrinologie */}
        <AccordionItem value="endocrino">
          <AccordionTrigger>Endocrinologie</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="mb-2">
                <Label className="block mb-1">Obésité / Maigreur familiale</Label>
                <RadioGroup value={form.endocrino.obesiteMaigreur} onValueChange={v => handleChange('endocrino', 'obesiteMaigreur', v, undefined)} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="obesite" id="endocrino-obesite" /><Label htmlFor="endocrino-obesite">Obésité familiale</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="maigreur" id="endocrino-maigreur" /><Label htmlFor="endocrino-maigreur">Maigreur familiale</Label></div>
                </RadioGroup>
              </div>
              <div className="col-span-2 md:col-span-4"><Label>Thyroïde</Label><Input value={form.endocrino.thyroide} onChange={e => handleChange('endocrino', 'thyroide', e.target.value, undefined)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Explorations fonctionnelles */}
        <AccordionItem value="explorations">
          <AccordionTrigger>Explorations fonctionnelles</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Fonction respiratoire</Label><Textarea value={form.explorations.respiratoire} onChange={e => handleChange('explorations', 'respiratoire', e.target.value, undefined)} className="min-h-[100px]" /></div>
              <div><Label>Fonction circulatoire</Label><Textarea value={form.explorations.circulatoire} onChange={e => handleChange('explorations', 'circulatoire', e.target.value, undefined)} className="min-h-[100px]" /></div>
              <div><Label>Fonction motrice</Label><Textarea value={form.explorations.motrice} onChange={e => handleChange('explorations', 'motrice', e.target.value, undefined)} className="min-h-[100px]" /></div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Examens complémentaires */}
        <AccordionItem value="examens">
          <AccordionTrigger>Examens complémentaires</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><Label>Radiologiques</Label><Input value={form.examens.radiologiques} onChange={e => handleChange('examens', 'radiologiques', e.target.value, undefined)} /></div>
              <div><Label>Biologiques</Label><Input value={form.examens.biologiques} onChange={e => handleChange('examens', 'biologiques', e.target.value, undefined)} /></div>
              <div><Label>Toxicologiques</Label><Input value={form.examens.toxicologiques} onChange={e => handleChange('examens', 'toxicologiques', e.target.value, undefined)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Orientation */}
        <AccordionItem value="orientation">
          <AccordionTrigger>Orientation</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><Label>Spécialité</Label><Input value={form.orientation.specialite} onChange={e => handleChange('orientation', 'specialite', e.target.value, undefined)} /></div>
              <div className="mb-2">
                <Label className="block mb-1">Pour avis / Pour traitement</Label>
                <RadioGroup value={form.orientation.pourAvisTraitement} onValueChange={v => handleChange('orientation', 'pourAvisTraitement', v, undefined)} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="avis" id="orientation-avis" /><Label htmlFor="orientation-avis">Pour avis</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="traitement" id="orientation-traitement" /><Label htmlFor="orientation-traitement">Pour traitement</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-2"><Checkbox checked={form.orientation.hospitalisation} onCheckedChange={v => handleChange('orientation', 'hospitalisation', v, undefined)} id="orientation-hospitalisation" /><Label htmlFor="orientation-hospitalisation">Hospitalisation</Label></div>
              <div className="mb-2">
                <Label className="block mb-1">Service social / Service emploi</Label>
                <RadioGroup value={form.orientation.serviceSocialEmploi} onValueChange={v => handleChange('orientation', 'serviceSocialEmploi', v, undefined)} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="social" id="orientation-social" /><Label htmlFor="orientation-social">Service social</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="emploi" id="orientation-emploi" /><Label htmlFor="orientation-emploi">Service emploi</Label></div>
                </RadioGroup>
              </div>
              <div className="col-span-2"><Label>Réponse</Label><Input value={form.orientation.reponse} onChange={e => handleChange('orientation', 'reponse', e.target.value, undefined)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Aptitude au travail */}
        <AccordionItem value="aptitude">
          <AccordionTrigger>Aptitude au travail</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2"><Checkbox checked={form.aptitude.apte} onCheckedChange={v => handleChange('aptitude', 'apte', v, undefined)} id="aptitude-apte" /><Label htmlFor="aptitude-apte">Apte</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.aptitude.inapteTemp} onCheckedChange={v => handleChange('aptitude', 'inapteTemp', v, undefined)} id="aptitude-inapteTemp" /><Label htmlFor="aptitude-inapteTemp">Inapte temporaire</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.aptitude.inapteDef} onCheckedChange={v => handleChange('aptitude', 'inapteDef', v, undefined)} id="aptitude-inapteDef" /><Label htmlFor="aptitude-inapteDef">Inapte définitif</Label></div>
              <div className="col-span-3">
                <div className="flex items-center gap-2 mb-2"><Checkbox checked={form.aptitude.apteReserve} onCheckedChange={v => handleChange('aptitude', 'apteReserve', v, undefined)} id="aptitude-apteReserve" /><Label htmlFor="aptitude-apteReserve">Apte avec réserves</Label></div>
                {form.aptitude.apteReserve && (
                  <div className="ml-6 space-y-2">
                    <div><Label>Postes conseillés</Label><Input value={form.aptitude.postesConseilles} onChange={e => handleChange('aptitude', 'postesConseilles', e.target.value, undefined)} /></div>
                    <div><Label>Postes déconseillés</Label><Input value={form.aptitude.postesDeconseilles} onChange={e => handleChange('aptitude', 'postesDeconseilles', e.target.value, undefined)} /></div>
                  </div>
                )}
              </div>
            </div>
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

export default Visite1;
