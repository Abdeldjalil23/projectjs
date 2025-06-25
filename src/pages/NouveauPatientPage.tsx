// src/pages/NouveauPatientPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input'; // For file input
import { Label } from '@/components/ui/label'; // For file input label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For Sexe
// Make sure this path is correct for your project structure:
import { InfoField, InfoTextareaField, CheckboxGroup } from '@/components/form/FormFields';
import { useToast } from "@/components/ui/use-toast"; // For notifications

const initialPatientData = {
  profileImageUrl: '',
  prenom: '',
  nom: '',
  sexe: '', // Will use Select component
  nbreEnf: 0,
  dnaiss: '',
  gsang: '',
  nss: '',
  serviceNational: '',
  adresse: '',
  formationScolaire: false,
  formationProfessionnelle: false,
  qualificationPersonnelle: '',
  activitesProfessionnellesAnterieures: '',
  handicapMoteur: false,
  handicapAuditif: false,
  handicapVisuel: false,
  contactGsm: '',
  contactPoste: '',
  contactEmail: '',
  affectationStructure: '',
  affectationDepartRetraite: '',
  affectationDateRecrutement: '',
};

const NouveauPatientPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialPatientData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({ title: "Image trop grande", description: "La taille de l'image ne doit pas dépasser 2MB.", variant: "destructive"});
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setProfileImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic Validation Example
    if (!formData.nom || !formData.prenom || !formData.dnaiss || !formData.sexe) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir Prénom, Nom, Date de Naissance et Sexe.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    console.log('Patient data to submit:', formData);
    if (profileImageFile) {
      console.log('Profile image file:', profileImageFile.name);
    }

    // --- API Call Placeholder ---
    // const submissionData = new FormData(); // Use FormData for file uploads
    // Object.keys(formData).forEach(key => {
    //   if (formData[key] !== null && formData[key] !== undefined) { // Append only defined values
    //      submissionData.append(key, formData[key]);
    //   }
    // });
    // if (profileImageFile) {
    //   submissionData.append('profileImage', profileImageFile);
    // }
    //
    // try {
    //   // const response = await fetch('/api/patients', { method: 'POST', body: submissionData });
    //   // const result = await response.json();
    //   // if (!response.ok) throw new Error(result.message || 'Failed to create patient');
    //   
    //   // Mock success:
    //   await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //   const result = { id: Date.now(), ...formData }; // Mock created patient with an ID
    //   toast({ title: "Succès", description: `Patient ${result.prenom} ${result.nom} ajouté avec succès!` });
    //   navigate(`/dossier/${result.id}`); // Navigate to the new patient's detail page
    // } catch (error) {
    //   console.error('Error creating patient:', error);
    //   toast({ title: "Erreur", description: error.message || "Échec de la création du patient.", variant: "destructive" });
    // } finally {
    //   setIsSubmitting(false);
    // }
    // --- End API Call Placeholder ---

    // For now, just log, show toast and navigate back
    toast({ title: "Soumission (Simulation)", description: "Données du patient prêtes à être envoyées." });
    setTimeout(() => { // Simulate API call
        setIsSubmitting(false);
        navigate('/dossiers-medicaux');
    }, 1000);
  };

  return (
    <AppLayout title="Ajouter un Nouveau Patient">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto"> {/* Max width for better form readability */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Nouveau Dossier Patient</h1>
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Annuler
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Informations du Patient</CardTitle>
              <CardDescription>Remplissez les détails ci-dessous pour créer un nouveau dossier patient.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image and Basic Info */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-32 w-32 border text-4xl">
                    <AvatarImage src={profileImagePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.prenom || 'P'}${formData.nom || 'N'}&radius=50&backgroundColor=00897b,039be5,3949ab,e53935,fb8c00&backgroundType=gradientLinear&fontSize=40`} alt="Aperçu profil" />
                    <AvatarFallback>{(formData.prenom?.[0] || 'P').toUpperCase()}{(formData.nom?.[0] || 'N').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Label htmlFor="profile-image-upload" className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {profileImagePreview ? "Changer l'image (max 2MB)" : "Télécharger une image (max 2MB)"}
                  </Label>
                  <Input id="profile-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-grow w-full">
                  <InfoField label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} required placeholder="Ex: Ali" />
                  <InfoField label="Nom" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Ex: Mezhoud" />
                </div>
              </div>

              {/* Main form grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <InfoField label="Sexe" name="sexe" required>
                    <Select name="sexe" value={formData.sexe} onValueChange={(value) => handleSelectChange('sexe', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le sexe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Masculin">Masculin</SelectItem>
                            <SelectItem value="Féminin">Féminin</SelectItem>
                        </SelectContent>
                    </Select>
                </InfoField>
                <InfoField label="Nombre d'enfants" name="nbreEnf" value={formData.nbreEnf} type="number" onChange={handleChange} placeholder="Ex: 2" />
                <InfoField label="Date de Naissance" name="dnaiss" value={formData.dnaiss} type="date" onChange={handleChange} required />
                <InfoField label="Groupe Sanguin" name="gsang" value={formData.gsang} onChange={handleChange} placeholder="Ex: O+" />
                <InfoField label="N° Sécurité Sociale (NSS)" name="nss" value={formData.nss} onChange={handleChange} placeholder="Ex: 180..." />
                <InfoField label="Service National" name="serviceNational" value={formData.serviceNational} onChange={handleChange} placeholder="Accompli, Dispensé, etc." />
                
                <InfoTextareaField className="md:col-span-2 lg:col-span-3" label="Adresse" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="123 Rue Principale, Ville" />

                <div className="md:col-span-1 lg:col-span-1 space-y-2">
                  <CheckboxGroup
                    groupLabel="Formation"
                    options={[
                      { id: 'formationScolaire', label: 'Scolaire' },
                      { id: 'formationProfessionnelle', label: 'Professionnelle' },
                    ]}
                    formData={formData}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>
                 {/* Spacer for alignment if needed, or adjust col-spans */}
                <div className="hidden md:block lg:hidden md:col-span-1"></div>


                <InfoTextareaField className="md:col-span-2 lg:col-span-3" label="Qualification Personnelle" name="qualificationPersonnelle" value={formData.qualificationPersonnelle} onChange={handleChange} placeholder="Diplômes, certificats..." />
                <InfoTextareaField className="md:col-span-2 lg:col-span-3" label="Activités Professionnelles Antérieures" name="activitesProfessionnellesAnterieures" value={formData.activitesProfessionnellesAnterieures} onChange={handleChange} placeholder="Liste des emplois précédents..." />

                <div className="md:col-span-1 lg:col-span-1 space-y-2">
                  <CheckboxGroup
                    groupLabel="Handicap"
                    options={[
                      { id: 'handicapMoteur', label: 'Moteur' },
                      { id: 'handicapAuditif', label: 'Auditif' },
                      { id: 'handicapVisuel', label: 'Visuel' },
                    ]}
                    formData={formData}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>
                
                {/* Spacers for grid alignment if needed */}
                <div className="hidden lg:block"></div> 
                <div className="hidden lg:block"></div>


                <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4 mb-2 border-b pb-1">Contact</h3>
                <InfoField label="GSM" name="contactGsm" value={formData.contactGsm} type="tel" onChange={handleChange} placeholder="06..." />
                <InfoField label="Poste (Tél. interne)" name="contactPoste" value={formData.contactPoste} onChange={handleChange} placeholder="Ex: 1234" />
                <InfoField label="Email" name="contactEmail" value={formData.contactEmail} type="email" onChange={handleChange} placeholder="patient@example.com" />

                <h3 className="text-lg font-semibold md:col-span-2 lg:col-span-3 mt-4 mb-2 border-b pb-1">Affectation</h3>
                <InfoField label="Structure d'affectation" name="affectationStructure" value={formData.affectationStructure} onChange={handleChange} placeholder="Nom de la structure" />
                <InfoField label="Date de départ à la retraite (prévue)" name="affectationDepartRetraite" value={formData.affectationDepartRetraite} type="date" onChange={handleChange} />
                <InfoField label="Date de recrutement" name="affectationDateRecrutement" value={formData.affectationDateRecrutement} type="date" onChange={handleChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enregistrement..." : "Enregistrer Patient"}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default NouveauPatientPage;