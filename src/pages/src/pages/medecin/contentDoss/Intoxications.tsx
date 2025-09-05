import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialState = {
  intoxications: [
    {
      id: 1,
      type: 'professionnelle',
      date: '',
      produit: '',
      voie: '',
      circonstances: '',
      symptomes: '',
      traitement: '',
      sequelles: '',
      declaration: false,
      dateDeclaration: '',
      numeroDeclaration: '',
      observations: '',
    }
  ],
  antecedentsIntoxications: '',
  sensibilisations: '',
  observationsGenerales: '',
};

const Intoxications = () => {
  const [form, setForm] = useState(initialState);
  const [saved, setSaved] = useState(false);

  const handleIntoxicationChange = (intoxicationId, field, value) => {
    setForm(prev => ({
      ...prev,
      intoxications: prev.intoxications.map(intoxication => 
        intoxication.id === intoxicationId ? { ...intoxication, [field]: value } : intoxication
      )
    }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addIntoxication = () => {
    const newId = Math.max(...form.intoxications.map(i => i.id)) + 1;
    setForm(prev => ({
      ...prev,
      intoxications: [...prev.intoxications, {
        id: newId,
        type: 'professionnelle',
        date: '',
        produit: '',
        voie: '',
        circonstances: '',
        symptomes: '',
        traitement: '',
        sequelles: '',
        declaration: false,
        dateDeclaration: '',
        numeroDeclaration: '',
        observations: '',
      }]
    }));
  };

  const removeIntoxication = (id) => {
    setForm(prev => ({
      ...prev,
      intoxications: prev.intoxications.filter(i => i.id !== id)
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Déclaration d'Intoxication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {form.intoxications.map((intoxication) => (
              <div key={intoxication.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Intoxication #{intoxication.id}</h3>
                  {form.intoxications.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeIntoxication(intoxication.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type d'intoxication</Label>
                    <RadioGroup value={intoxication.type} onValueChange={v => handleIntoxicationChange(intoxication.id, 'type', v)}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="professionnelle" id={`intoxication-${intoxication.id}-professionnelle`} />
                        <Label htmlFor={`intoxication-${intoxication.id}-professionnelle`}>Professionnelle</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="domestique" id={`intoxication-${intoxication.id}-domestique`} />
                        <Label htmlFor={`intoxication-${intoxication.id}-domestique`}>Domestique</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="accidentelle" id={`intoxication-${intoxication.id}-accidentelle`} />
                        <Label htmlFor={`intoxication-${intoxication.id}-accidentelle`}>Accidentelle</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="volontaire" id={`intoxication-${intoxication.id}-volontaire`} />
                        <Label htmlFor={`intoxication-${intoxication.id}-volontaire`}>Volontaire</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label>Date de l'intoxication</Label>
                    <Input 
                      type="date" 
                      value={intoxication.date} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'date', e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <Label>Produit responsable</Label>
                    <Input 
                      value={intoxication.produit} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'produit', e.target.value)} 
                      placeholder="Nom du produit"
                    />
                  </div>
                  
                  <div>
                    <Label>Voie d'exposition</Label>
                    <RadioGroup value={intoxication.voie} onValueChange={v => handleIntoxicationChange(intoxication.id, 'voie', v)}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="inhalation" id={`voie-${intoxication.id}-inhalation`} />
                        <Label htmlFor={`voie-${intoxication.id}-inhalation`}>Inhalation</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="cutanee" id={`voie-${intoxication.id}-cutanee`} />
                        <Label htmlFor={`voie-${intoxication.id}-cutanee`}>Cutannée</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="orale" id={`voie-${intoxication.id}-orale`} />
                        <Label htmlFor={`voie-${intoxication.id}-orale`}>Orale</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="autre" id={`voie-${intoxication.id}-autre`} />
                        <Label htmlFor={`voie-${intoxication.id}-autre`}>Autre</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Circonstances</Label>
                    <Textarea 
                      value={intoxication.circonstances} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'circonstances', e.target.value)} 
                      placeholder="Description des circonstances"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Symptômes présentés</Label>
                    <Textarea 
                      value={intoxication.symptomes} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'symptomes', e.target.value)} 
                      placeholder="Description des symptômes"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Traitement reçu</Label>
                    <Textarea 
                      value={intoxication.traitement} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'traitement', e.target.value)} 
                      placeholder="Traitement administré"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Séquelles éventuelles</Label>
                    <Textarea 
                      value={intoxication.sequelles} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'sequelles', e.target.value)} 
                      placeholder="Description des séquelles"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={intoxication.declaration} 
                      onCheckedChange={v => handleIntoxicationChange(intoxication.id, 'declaration', v)} 
                      id={`declaration-${intoxication.id}`} 
                    />
                    <Label htmlFor={`declaration-${intoxication.id}`}>Déclaration effectuée</Label>
                  </div>
                  
                  {intoxication.declaration && (
                    <>
                      <div>
                        <Label>Date de déclaration</Label>
                        <Input 
                          type="date" 
                          value={intoxication.dateDeclaration} 
                          onChange={e => handleIntoxicationChange(intoxication.id, 'dateDeclaration', e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label>Numéro de déclaration</Label>
                        <Input 
                          value={intoxication.numeroDeclaration} 
                          onChange={e => handleIntoxicationChange(intoxication.id, 'numeroDeclaration', e.target.value)} 
                          placeholder="Numéro de déclaration"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2">
                    <Label>Observations</Label>
                    <Textarea 
                      value={intoxication.observations} 
                      onChange={e => handleIntoxicationChange(intoxication.id, 'observations', e.target.value)} 
                      placeholder="Observations complémentaires"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addIntoxication}>
              Ajouter une intoxication
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Antécédents d'intoxications</Label>
              <Textarea 
                value={form.antecedentsIntoxications} 
                onChange={e => handleChange('antecedentsIntoxications', e.target.value)} 
                placeholder="Antécédents d'intoxications"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label>Sensibilisations</Label>
              <Textarea 
                value={form.sensibilisations} 
                onChange={e => handleChange('sensibilisations', e.target.value)} 
                placeholder="Sensibilisations connues"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label>Observations générales</Label>
              <Textarea 
                value={form.observationsGenerales} 
                onChange={e => handleChange('observationsGenerales', e.target.value)} 
                placeholder="Observations générales"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">Enregistrer</Button>
      </div>
      {saved && <div className="text-green-600 font-bold">Enregistré avec succès !</div>}
    </form>
  );
};

export default Intoxications;
