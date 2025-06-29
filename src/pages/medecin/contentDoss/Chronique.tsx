import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChronique } from '@/context/ChroniqueContext';
import { useParams } from 'react-router-dom';

const initialState = {
  maladies: [
    {
      id: 1,
      typeMaladie: '',
      sousType: '',
      dateDiagnostic: '',
      traitementActuel: '',
      medecinSuivi: '',
      dateDerniereSuivi: '',
      restrictionsTravail: false,
      notes: '',
    }
  ],
  observationsGenerales: '',
};

// Disease subcategories
const diseaseSubcategories = {
  diabete: [
    { value: 'diabete_type1', label: 'Diabète de type 1' },
    { value: 'diabete_type2', label: 'Diabète de type 2' },
    { value: 'diabete_gestationnel', label: 'Diabète gestationnel' },
    { value: 'diabete_lada', label: 'Diabète LADA' },
    { value: 'diabete_mody', label: 'Diabète MODY' },
  ],
  hypertension: [
    { value: 'hypertension_essentielle', label: 'Hypertension essentielle' },
    { value: 'hypertension_secondaire', label: 'Hypertension secondaire' },
    { value: 'hypertension_resistante', label: 'Hypertension résistante' },
  ],
  asthme: [
    { value: 'asthme_intermittent', label: 'Asthme intermittent' },
    { value: 'asthme_persistant_leger', label: 'Asthme persistant léger' },
    { value: 'asthme_persistant_modere', label: 'Asthme persistant modéré' },
    { value: 'asthme_persistant_severe', label: 'Asthme persistant sévère' },
  ],
  cardiopathie: [
    { value: 'cardiopathie_coronarienne', label: 'Cardiopathie coronarienne' },
    { value: 'cardiopathie_valvulaire', label: 'Cardiopathie valvulaire' },
    { value: 'cardiopathie_congenitale', label: 'Cardiopathie congénitale' },
    { value: 'insuffisance_cardiaque', label: 'Insuffisance cardiaque' },
    { value: 'arythmie', label: 'Arythmie' },
  ],
  arthrite: [
    { value: 'arthrite_rhumatoide', label: 'Arthrite rhumatoïde' },
    { value: 'arthrose', label: 'Arthrose' },
    { value: 'arthrite_psoriasique', label: 'Arthrite psoriasique' },
    { value: 'goutte', label: 'Goutte' },
    { value: 'spondylarthrite', label: 'Spondylarthrite' },
  ],
  epilepsie: [
    { value: 'epilepsie_generalisee', label: 'Épilepsie généralisée' },
    { value: 'epilepsie_focale', label: 'Épilepsie focale' },
    { value: 'epilepsie_absence', label: 'Épilepsie absence' },
    { value: 'epilepsie_tonico_clonique', label: 'Épilepsie tonico-clonique' },
  ],
  maladie_renale: [
    { value: 'insuffisance_renale', label: 'Insuffisance rénale' },
    { value: 'glomerulonephrite', label: 'Glomérulonéphrite' },
    { value: 'pyelonephrite', label: 'Pyélonéphrite' },
    { value: 'polykystose_renale', label: 'Polykystose rénale' },
  ],
  maladie_hepatique: [
    { value: 'hepatite_b', label: 'Hépatite B' },
    { value: 'hepatite_c', label: 'Hépatite C' },
    { value: 'cirrhose', label: 'Cirrhose' },
    { value: 'steatose_hepatique', label: 'Stéatose hépatique' },
  ],
  maladie_thyroidienne: [
    { value: 'hypothyroidie', label: 'Hypothyroïdie' },
    { value: 'hyperthyroidie', label: 'Hyperthyroïdie' },
    { value: 'thyroidite_hashimoto', label: 'Thyroïdite de Hashimoto' },
    { value: 'maladie_de_basedow', label: 'Maladie de Basedow' },
  ],
  maladie_respiratoire: [
    { value: 'bronchopneumopathie', label: 'Broncho-pneumopathie chronique' },
    { value: 'emphyseme', label: 'Emphysème' },
    { value: 'bronchectasie', label: 'Bronchectasie' },
    { value: 'fibrose_pulmonaire', label: 'Fibrose pulmonaire' },
  ],
  maladie_neurologique: [
    { value: 'maladie_parkinson', label: 'Maladie de Parkinson' },
    { value: 'sclerose_plaques', label: 'Sclérose en plaques' },
    { value: 'maladie_alzheimer', label: 'Maladie d\'Alzheimer' },
    { value: 'maladie_huntington', label: 'Maladie de Huntington' },
  ],
  cancer: [
    { value: 'cancer_poumon', label: 'Cancer du poumon' },
    { value: 'cancer_sein', label: 'Cancer du sein' },
    { value: 'cancer_colon', label: 'Cancer du côlon' },
    { value: 'cancer_prostate', label: 'Cancer de la prostate' },
    { value: 'cancer_peau', label: 'Cancer de la peau' },
    { value: 'cancer_autre', label: 'Autre type de cancer' },
  ],
  maladie_auto_immune: [
    { value: 'lupus', label: 'Lupus érythémateux' },
    { value: 'sclerodermie', label: 'Sclérodermie' },
    { value: 'maladie_crohn', label: 'Maladie de Crohn' },
    { value: 'colite_ulcerative', label: 'Colite ulcérative' },
    { value: 'psoriasis', label: 'Psoriasis' },
  ],
  maladie_mentale: [
    { value: 'depression', label: 'Dépression' },
    { value: 'trouble_bipolaire', label: 'Trouble bipolaire' },
    { value: 'schizophrenie', label: 'Schizophrénie' },
    { value: 'trouble_anxiete', label: 'Trouble d\'anxiété' },
    { value: 'trouble_obsessionnel', label: 'Trouble obsessionnel compulsif' },
  ],
};

const Chronique = () => {
  const { id } = useParams();
  const patientId = parseInt(id || '0');
  const { saveChroniqueData, getChroniqueData } = useChronique();
  const [form, setForm] = useState(initialState);
  const [saved, setSaved] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingData = getChroniqueData(patientId);
    if (existingData) {
      setForm({
        maladies: existingData.maladies,
        observationsGenerales: existingData.observationsGenerales,
      });
    }
  }, [patientId, getChroniqueData]);

  const handleMaladieChange = (maladieId, field, value) => {
    setForm(prev => ({
      ...prev,
      maladies: prev.maladies.map(maladie => {
        if (maladie.id === maladieId) {
          // Reset sousType when typeMaladie changes
          if (field === 'typeMaladie') {
            return { ...maladie, [field]: value, sousType: '' };
          }
          return { ...maladie, [field]: value };
        }
        return maladie;
      })
    }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addMaladie = () => {
    const newId = Math.max(...form.maladies.map(m => m.id)) + 1;
    setForm(prev => ({
      ...prev,
      maladies: [...prev.maladies, {
        id: newId,
        typeMaladie: '',
        sousType: '',
        dateDiagnostic: '',
        traitementActuel: '',
        medecinSuivi: '',
        dateDerniereSuivi: '',
        restrictionsTravail: false,
        notes: '',
      }]
    }));
  };

  const removeMaladie = (id) => {
    setForm(prev => ({
      ...prev,
      maladies: prev.maladies.filter(m => m.id !== id)
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save to context
    saveChroniqueData(patientId, {
      patientId,
      maladies: form.maladies,
      observationsGenerales: form.observationsGenerales,
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maladies Chroniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {form.maladies.map((maladie) => (
              <div key={maladie.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Maladie #{maladie.id}</h3>
                  {form.maladies.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeMaladie(maladie.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Type de maladie</Label>
                    <Select value={maladie.typeMaladie} onValueChange={v => handleMaladieChange(maladie.id, 'typeMaladie', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de maladie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diabete">Diabète</SelectItem>
                        <SelectItem value="hypertension">Hypertension artérielle</SelectItem>
                        <SelectItem value="asthme">Asthme</SelectItem>
                        <SelectItem value="cardiopathie">Cardiopathie</SelectItem>
                        <SelectItem value="arthrite">Arthrite</SelectItem>
                        <SelectItem value="epilepsie">Épilepsie</SelectItem>
                        <SelectItem value="maladie_renale">Maladie rénale</SelectItem>
                        <SelectItem value="maladie_hepatique">Maladie hépatique</SelectItem>
                        <SelectItem value="maladie_thyroidienne">Maladie thyroïdienne</SelectItem>
                        <SelectItem value="maladie_respiratoire">Maladie respiratoire chronique</SelectItem>
                        <SelectItem value="maladie_neurologique">Maladie neurologique</SelectItem>
                        <SelectItem value="cancer">Cancer</SelectItem>
                        <SelectItem value="maladie_auto_immune">Maladie auto-immune</SelectItem>
                        <SelectItem value="maladie_mentale">Maladie mentale</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {maladie.typeMaladie && maladie.typeMaladie !== 'autre' && diseaseSubcategories[maladie.typeMaladie] && (
                    <div>
                      <Label>Sous-type de maladie</Label>
                      <Select value={maladie.sousType} onValueChange={v => handleMaladieChange(maladie.id, 'sousType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le sous-type" />
                        </SelectTrigger>
                        <SelectContent>
                          {diseaseSubcategories[maladie.typeMaladie].map((subType) => (
                            <SelectItem key={subType.value} value={subType.value}>
                              {subType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label>Date du diagnostic</Label>
                    <Input 
                      type="date" 
                      value={maladie.dateDiagnostic} 
                      onChange={e => handleMaladieChange(maladie.id, 'dateDiagnostic', e.target.value)} 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Traitement actuel</Label>
                    <Textarea 
                      value={maladie.traitementActuel} 
                      onChange={e => handleMaladieChange(maladie.id, 'traitementActuel', e.target.value)} 
                      placeholder="Description du traitement actuel"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Médecin suivant</Label>
                    <Input 
                      value={maladie.medecinSuivi} 
                      onChange={e => handleMaladieChange(maladie.id, 'medecinSuivi', e.target.value)} 
                      placeholder="Nom du médecin suivant"
                    />
                  </div>
                  
                  <div>
                    <Label>Date de dernière suivi</Label>
                    <Input 
                      type="date" 
                      value={maladie.dateDerniereSuivi} 
                      onChange={e => handleMaladieChange(maladie.id, 'dateDerniereSuivi', e.target.value)} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={maladie.restrictionsTravail} 
                      onCheckedChange={v => handleMaladieChange(maladie.id, 'restrictionsTravail', v)} 
                      id={`restrictions-${maladie.id}`} 
                    />
                    <Label htmlFor={`restrictions-${maladie.id}`}>Restrictions sur le travail</Label>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={maladie.notes} 
                      onChange={e => handleMaladieChange(maladie.id, 'notes', e.target.value)} 
                      placeholder="Notes complémentaires"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addMaladie}>
              Ajouter une maladie
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Observations générales</Label>
              <Textarea 
                value={form.observationsGenerales} 
                onChange={e => handleChange('observationsGenerales', e.target.value)} 
                placeholder="Observations générales sur les maladies chroniques"
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

export default Chronique;
