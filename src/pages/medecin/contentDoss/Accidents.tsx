import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialState = {
  natureAccident: '',
  date: '',
  lieu: '',
  consequences: '',
  deces: false,
  ipp: '',
  soins: '',
  nbreJArr: '',
  lieuEvac: '',
  moyenEvac: '',
  observations: '',
};

const Accidents = () => {
  const [form, setForm] = useState(initialState);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Auto-set current date if no date is provided
    if (!form.date) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, date: today }));
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Déclaration d'Accident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>1. Nature de l'accident</Label>
              <RadioGroup value={form.natureAccident} onValueChange={v => handleChange('natureAccident', v)}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="travail" id="nature-travail" />
                  <Label htmlFor="nature-travail">Accident de travail</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="trajet" id="nature-trajet" />
                  <Label htmlFor="nature-trajet">Accident de trajet</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="maladie" id="nature-maladie" />
                  <Label htmlFor="nature-maladie">Maladie professionnelle</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="autre" id="nature-autre" />
                  <Label htmlFor="nature-autre">Autre</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>2. Date</Label>
              <Input 
                type="date" 
                value={form.date} 
                onChange={e => handleChange('date', e.target.value)} 
              />
            </div>
            
            <div>
              <Label>3. Lieu</Label>
              <Input 
                value={form.lieu} 
                onChange={e => handleChange('lieu', e.target.value)} 
                placeholder="Lieu de l'accident"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>4. Conséquences</Label>
              <Textarea 
                value={form.consequences} 
                onChange={e => handleChange('consequences', e.target.value)} 
                placeholder="Description des conséquences de l'accident"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={form.deces} 
                onCheckedChange={v => handleChange('deces', v)} 
                id="deces" 
              />
              <Label htmlFor="deces">5. Décès</Label>
            </div>
            
            <div>
              <Label>6. IPP %</Label>
              <Input 
                type="number" 
                value={form.ipp} 
                onChange={e => handleChange('ipp', e.target.value)} 
                placeholder="Pourcentage d'IPP"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>7. Soins</Label>
              <Textarea 
                value={form.soins} 
                onChange={e => handleChange('soins', e.target.value)} 
                placeholder="Description des soins reçus"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label>8. Nbre J Arr</Label>
              <Input 
                type="number" 
                value={form.nbreJArr} 
                onChange={e => handleChange('nbreJArr', e.target.value)} 
                placeholder="Nombre de jours d'arrêt"
                min="0"
              />
            </div>
            
            <div>
              <Label>9. Lieu Evac</Label>
              <Input 
                value={form.lieuEvac} 
                onChange={e => handleChange('lieuEvac', e.target.value)} 
                placeholder="Lieu d'évacuation"
              />
            </div>
            
            <div>
              <Label>10. Moyen Evac</Label>
              <RadioGroup value={form.moyenEvac} onValueChange={v => handleChange('moyenEvac', v)}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ambulance" id="moyen-ambulance" />
                  <Label htmlFor="moyen-ambulance">Ambulance</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="avion" id="moyen-avion" />
                  <Label htmlFor="moyen-avion">Avion</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="vehicule" id="moyen-vehicule" />
                  <Label htmlFor="moyen-vehicule">Véhicule personnel</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="md:col-span-2">
              <Label>Observations</Label>
              <Textarea 
                value={form.observations} 
                onChange={e => handleChange('observations', e.target.value)} 
                placeholder="Observations complémentaires"
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

export default Accidents;
