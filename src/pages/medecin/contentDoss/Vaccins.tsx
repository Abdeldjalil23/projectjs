import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialState = {
  vaccins: [
    {
      id: 1,
      nom: 'BCG',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 2,
      nom: 'DTCP',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 3,
      nom: 'Hépatite B',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 4,
      nom: 'ROR',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 5,
      nom: 'Fièvre jaune',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 6,
      nom: 'Grippe',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
    {
      id: 7,
      nom: 'COVID-19',
      dateVaccination: '',
      dateRappel: '',
      lot: '',
      centre: '',
      medecin: '',
      observations: '',
      effectue: false,
    },
  ],
  allergiesVaccins: '',
  contreIndications: '',
  observationsGenerales: '',
};

const Vaccins = () => {
  const [form, setForm] = useState(initialState);
  const [saved, setSaved] = useState(false);

  const handleVaccinChange = (vaccinId, field, value) => {
    setForm(prev => ({
      ...prev,
      vaccins: prev.vaccins.map(vaccin => 
        vaccin.id === vaccinId ? { ...vaccin, [field]: value } : vaccin
      )
    }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
          <CardTitle>Carnet de Vaccination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {form.vaccins.map((vaccin) => (
              <div key={vaccin.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox 
                    checked={vaccin.effectue} 
                    onCheckedChange={v => handleVaccinChange(vaccin.id, 'effectue', v)} 
                    id={`vaccin-${vaccin.id}`} 
                  />
                  <Label htmlFor={`vaccin-${vaccin.id}`} className="text-lg font-semibold">
                    {vaccin.nom}
                  </Label>
                </div>
                
                {vaccin.effectue && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date de vaccination</Label>
                      <Input 
                        type="date" 
                        value={vaccin.dateVaccination} 
                        onChange={e => handleVaccinChange(vaccin.id, 'dateVaccination', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label>Date de rappel</Label>
                      <Input 
                        type="date" 
                        value={vaccin.dateRappel} 
                        onChange={e => handleVaccinChange(vaccin.id, 'dateRappel', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label>Numéro de lot</Label>
                      <Input 
                        value={vaccin.lot} 
                        onChange={e => handleVaccinChange(vaccin.id, 'lot', e.target.value)} 
                        placeholder="Numéro de lot"
                      />
                    </div>
                    <div>
                      <Label>Centre de vaccination</Label>
                      <Input 
                        value={vaccin.centre} 
                        onChange={e => handleVaccinChange(vaccin.id, 'centre', e.target.value)} 
                        placeholder="Centre de vaccination"
                      />
                    </div>
                    <div>
                      <Label>Médecin vaccinateur</Label>
                      <Input 
                        value={vaccin.medecin} 
                        onChange={e => handleVaccinChange(vaccin.id, 'medecin', e.target.value)} 
                        placeholder="Nom du médecin"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Observations</Label>
                      <Textarea 
                        value={vaccin.observations} 
                        onChange={e => handleVaccinChange(vaccin.id, 'observations', e.target.value)} 
                        placeholder="Observations spécifiques"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Allergies aux vaccins</Label>
              <Textarea 
                value={form.allergiesVaccins} 
                onChange={e => handleChange('allergiesVaccins', e.target.value)} 
                placeholder="Préciser les allergies connues aux vaccins"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label>Contre-indications</Label>
              <Textarea 
                value={form.contreIndications} 
                onChange={e => handleChange('contreIndications', e.target.value)} 
                placeholder="Contre-indications à la vaccination"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label>Observations générales</Label>
              <Textarea 
                value={form.observationsGenerales} 
                onChange={e => handleChange('observationsGenerales', e.target.value)} 
                placeholder="Observations générales sur le carnet de vaccination"
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

export default Vaccins;
