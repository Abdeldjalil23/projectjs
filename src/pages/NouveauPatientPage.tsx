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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const initialPatientData = {
  profileImageUrl: '',
  prenom: '',
  nom: '',
  sexe: '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
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

    toast({
      title: 'Soumission (Simulation)',
      description: 'Données du patient prêtes à être envoyées.',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dossiers-medicaux');
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

// Composant champ texte générique
const InfoField = ({ label, name, value, onChange, type = 'text', required, placeholder, children }) => (
  <div className="flex flex-col space-y-1">
    <Label htmlFor={name}>{label}{required && <span className="text-red-500">*</span>}</Label>
    {children ? children : (
      <Input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

// Champ texte long (textarea)
const InfoTextareaField = ({ label, name, value, onChange, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <Label htmlFor={name}>{label}</Label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border rounded px-3 py-2 text-sm"
      rows={3}
    />
  </div>
);

// Groupe de cases à cocher
const CheckboxGroup = ({ groupLabel, options, formData, onCheckboxChange }) => (
  <div>
    <p className="font-medium">{groupLabel}</p>
    <div className="space-y-1 mt-1">
      {options.map(({ id, label }) => (
        <label key={id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!formData[id]}
            onChange={(e) => onCheckboxChange(id, e.target.checked)}
            className="accent-primary"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default NouveauPatientPage;