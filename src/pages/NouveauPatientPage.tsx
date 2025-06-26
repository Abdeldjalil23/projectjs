import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Make sure you have this component

// Helper component for editable input fields
const EditableField = ({ label, name, value, onChange, type = "text", placeholder, required = false, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <Label htmlFor={name}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || `Entrez ${label.toLowerCase()}`}
      className="w-full"
      required={required}
    />
  </div>
);

// Helper component for editable textarea fields
const EditableTextareaField = ({ label, name, value, onChange, placeholder, required = false, rows = 3, className = "md:col-span-2 lg:col-span-3" }) => (
  <div className={`space-y-1 ${className}`}>
    <Label htmlFor={name}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || `Décrivez ${label.toLowerCase()}`}
      className="w-full min-h-[80px]"
      rows={rows}
      required={required}
    />
  </div>
);

// Helper component for editable checkbox fields
const EditableCheckboxField = ({ label, name, checked, onChange, className = "" }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <Checkbox
      id={name}
      name={name}
      checked={checked}
      onCheckedChange={(isChecked) => onChange({ target: { name, value: isChecked, type: 'checkbox' } })}
    />
    <Label htmlFor={name} className="font-normal">
      {label}
    </Label>
  </div>
);

// Helper component for editable select fields
const EditableSelectField = ({ label, name, value, onChange, options, placeholder, required = false, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <Label htmlFor={name}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Select
      name={name}
      value={value}
      onValueChange={(selectedValue) => onChange({ target: { name, value: selectedValue } })} // Simulate event structure
      required={required}
    >
      <SelectTrigger className="w-full" id={name}>
        <SelectValue placeholder={placeholder || `Sélectionnez ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const AddPatientPage = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState({
    prenom: '',
    nom: '',
    chronique: false,
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API call to save patient data
    console.log('Patient data to save:', patientData);
    // For demonstration, navigate to a success page or back
    // In a real app, you'd likely navigate to the new patient's detail page or a list
    alert('Patient ajouté avec succès (simulation) !');
    navigate(-1); // Go back to the previous page
  };

  const sexeOptions = [
    { value: 'Masculin', label: 'Masculin' },
    { value: 'Féminin', label: 'Féminin' },
    { value: 'Autre', label: 'Autre' },
  ];

  const serviceNationalOptions = [
    { value: 'Accompli', label: 'Accompli' },
    { value: 'Non Accompli', label: 'Non Accompli' },
    { value: 'Sursis', label: 'Sursis' },
    { value: 'Exempté', label: 'Exempté' },
  ];

  return (
    <AppLayout title="Ajouter un Nouveau Patient">
      <div className="p-4 md:p-6 space-y-6">
        <Card className="w-full">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">Nouveau Dossier Patient</CardTitle>
              <CardDescription>Remplissez les informations ci-dessous pour créer un nouveau dossier patient.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Informations Générales */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="text-lg font-semibold">Informations Générales et Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <EditableField label="Prénom" name="prenom" value={patientData.prenom} onChange={handleChange} required placeholder={undefined} />
                  <EditableField label="Nom" name="nom" value={patientData.nom} onChange={handleChange} required placeholder={undefined} />
                  <EditableSelectField label="Sexe" name="sexe" value={patientData.sexe} onChange={handleChange} options={sexeOptions} required placeholder={undefined} />
                  <EditableField label="Nombre d'enfants" name="nbreEnf" value={patientData.nbreEnf} onChange={handleChange} type="number" placeholder={undefined} />
                  <EditableField label="Date de Naissance" name="dnaiss" value={patientData.dnaiss} onChange={handleChange} type="date" required placeholder={undefined} />
                  <EditableField label="Groupe Sanguin" name="gsang" value={patientData.gsang} onChange={handleChange} placeholder={undefined} />
                  <EditableField label="N° Sécurité Sociale (NSS)" name="nss" value={patientData.nss} onChange={handleChange} placeholder={undefined} />
                  <EditableSelectField label="Service National" name="serviceNational" value={patientData.serviceNational} onChange={handleChange} options={serviceNationalOptions} placeholder={undefined} />
                  <EditableCheckboxField label="Patient Chronique" name="chronique" checked={patientData.chronique} onChange={handleChange} className="mt-6" />
                  <EditableTextareaField label="Adresse" name="adresse" value={patientData.adresse} onChange={handleChange} className="md:col-span-2 lg:col-span-3" placeholder={undefined} />
                </div>
              </div>

              {/* Section Formation et Handicap */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="text-lg font-semibold">Formation, Qualification et Handicap</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Formation</Label>
                    <EditableCheckboxField label="Scolaire" name="formationScolaire" checked={patientData.formationScolaire} onChange={handleChange} />
                    <EditableCheckboxField label="Professionnelle" name="formationProfessionnelle" checked={patientData.formationProfessionnelle} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Handicap</Label>
                    <EditableCheckboxField label="Moteur" name="handicapMoteur" checked={patientData.handicapMoteur} onChange={handleChange} />
                    <EditableCheckboxField label="Auditif" name="handicapAuditif" checked={patientData.handicapAuditif} onChange={handleChange} />
                    <EditableCheckboxField label="Visuel" name="handicapVisuel" checked={patientData.handicapVisuel} onChange={handleChange} />
                  </div>
                  <div className="hidden lg:block"></div> {/* Spacer */}

                  <EditableTextareaField label="Qualification Personnelle" name="qualificationPersonnelle" value={patientData.qualificationPersonnelle} onChange={handleChange} className="md:col-span-2 lg:col-span-3" placeholder={undefined} />
                  <EditableTextareaField label="Activités Professionnelles Antérieures" name="activitesProfessionnellesAnterieures" value={patientData.activitesProfessionnellesAnterieures} onChange={handleChange} className="md:col-span-2 lg:col-span-3" placeholder={undefined} />
                </div>
              </div>

              {/* Section Contact */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <EditableField label="GSM" name="contactGsm" value={patientData.contactGsm} onChange={handleChange} type="tel" placeholder={undefined} />
                  <EditableField label="Poste (Tél. interne)" name="contactPoste" value={patientData.contactPoste} onChange={handleChange} placeholder={undefined} />
                  <EditableField label="Email" name="contactEmail" value={patientData.contactEmail} onChange={handleChange} type="email" placeholder={undefined} />
                </div>
              </div>

              {/* Section Affectation */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Affectation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <EditableField label="Structure d'affectation" name="affectationStructure" value={patientData.affectationStructure} onChange={handleChange} placeholder={undefined} />
                  <EditableField label="Date de recrutement" name="affectationDateRecrutement" value={patientData.affectationDateRecrutement} onChange={handleChange} type="date" placeholder={undefined} />
                  <EditableField label="Date de départ à la retraite (prévue)" name="affectationDepartRetraite" value={patientData.affectationDepartRetraite} onChange={handleChange} type="date" placeholder={undefined} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer le Patient
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddPatientPage;