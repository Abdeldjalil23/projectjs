// src/pages/NouveauPatientPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const initialPatientData = {
  profileImageUrl: '',
  prenom: '',
  nom: '',
  sexe: '',
  nbreEnf: '',
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Image trop grande',
          description: "La taille de l'image ne doit pas dépasser 2MB.",
          variant: 'destructive',
        });
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

    if (!formData.nom || !formData.prenom || !formData.dnaiss || !formData.sexe) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir Prénom, Nom, Date de Naissance et Sexe.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const id = Date.now();
    const profileImageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${formData.prenom}${formData.nom}&radius=50&backgroundColor=00897b,039be5,3949ab,e53935,fb8c00&backgroundType=gradientLinear&fontSize=40`;

    const patientData = {
      id,
      ...formData,
      profileImageUrl,
    };

    console.log('✅ Données patient à enregistrer :', patientData);

    toast({
      title: 'Soumission (Simulation)',
      description: 'Données du patient prêtes à être envoyées.',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/dossier/${id}`);
    }, 1000);
  };

  return (
    <AppLayout title="Ajouter un Nouveau Patient">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
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
              <CardDescription>
                Remplissez les détails ci-dessous pour créer un nouveau dossier patient.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-32 w-32 border text-4xl">
                    <AvatarImage
                      src={
                        profileImagePreview ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${formData.prenom || 'P'}${formData.nom || 'N'}&radius=50`
                      }
                      alt="Aperçu profil"
                    />
                    <AvatarFallback>
                      {(formData.prenom?.[0] || 'P').toUpperCase()}
                      {(formData.nom?.[0] || 'N').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="profile-image-upload"
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    {profileImagePreview
                      ? "Changer l'image (max 2MB)"
                      : "Télécharger une image (max 2MB)"}
                  </Label>
                  <Input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(initialPatientData).map((key) => {
                  if (typeof formData[key] === 'boolean' || key === 'profileImageUrl') return null;
                  return (
                    <div key={key}>
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                      />
                    </div>
                  );
                })}
                <div>
                  <Label>Formation</Label>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.formationScolaire}
                        onChange={(e) => handleCheckboxChange('formationScolaire', e.target.checked)}
                      />
                      <span>Scolaire</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.formationProfessionnelle}
                        onChange={(e) => handleCheckboxChange('formationProfessionnelle', e.target.checked)}
                      />
                      <span>Professionnelle</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Handicap</Label>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.handicapMoteur}
                        onChange={(e) => handleCheckboxChange('handicapMoteur', e.target.checked)}
                      />
                      <span>Moteur</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.handicapAuditif}
                        onChange={(e) => handleCheckboxChange('handicapAuditif', e.target.checked)}
                      />
                      <span>Auditif</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.handicapVisuel}
                        onChange={(e) => handleCheckboxChange('handicapVisuel', e.target.checked)}
                      />
                      <span>Visuel</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer Patient'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default NouveauPatientPage;
