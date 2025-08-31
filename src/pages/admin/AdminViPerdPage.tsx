import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";

// Mock data (expanded to allow multiple sessions)
const allUsersData = [
  { id: 1, name: 'Dr. Mohammed Ali', email: 'mohammed.ali@sonatrach.dz', avatar: 'MA', role: 'doctor' },
  { id: 2, name: 'Amira Bouzid (Admin)', email: 'amira.bouzid@sonatrach.dz', avatar: 'AB', role: 'admin' },
  { id: 3, name: 'Dr. Fatima Zahra', email: 'fatima.zahra@sonatrach.dz', avatar: 'FZ', role: 'doctor' },
  { id: 4, name: 'Yacine Brahimi (Admin)', email: 'yacine.brahimi@sonatrach.dz', avatar: 'YB', role: 'admin' },
  { id: 5, name: 'Dr. Karim Benzema', email: 'karim.benzema@sonatrach.dz', avatar: 'KB', role: 'doctor' },
  { id: 6, name: 'Dr. Nadia Saoudi', email: 'nadia.saoudi@sonatrach.dz', avatar: 'NS', role: 'doctor' },
  { id: 7, name: 'Dr. Ahmed Khedir', email: 'ahmed.khedir@sonatrach.dz', avatar: 'AK', role: 'doctor' },
  { id: 8, name: 'Dr. Laila Hamdi', email: 'laila.hamdi@sonatrach.dz', avatar: 'LH', role: 'doctor' },
  { id: 9, name: 'Dr. Omar Ziane', email: 'omar.ziane@sonatrach.dz', avatar: 'OZ', role: 'doctor' },
  { id: 10, name: 'Dr. Sarah Boudiaf', email: 'sarah.boudiaf@sonatrach.dz', avatar: 'SB', role: 'doctor' },
  { id: 11, name: 'Dr. Youcef Amrani', email: 'youcef.amrani@sonatrach.dz', avatar: 'YA', role: 'doctor' },
  { id: 12, name: 'Dr. Zineb Cherif', email: 'zineb.cherif@sonatrach.dz', avatar: 'ZC', role: 'doctor' },
  { id: 13, name: 'Dr. Hichem Boumediene', email: 'hichem.boumediene@sonatrach.dz', avatar: 'HB', role: 'doctor' },
  { id: 14, name: 'Dr. Aicha Laib', email: 'aicha.laib@sonatrach.dz', avatar: 'AL', role: 'doctor' },
];

// Predefined nurses
const nurses = [
  "Dr. Amina Khelifi",
  "Dr. Sofiane Merabet",
  "Nurse Leila Haddad",
  "Nurse Omar Cherif",
];

// Filter doctors for employee selection
const doctors = allUsersData.filter(user => user.role === 'doctor');

type Employee = {
  id: number;
  name: string;
  matricule: string;
  email: string;
  attended: boolean;
  reminderDate?: string;
};

const VisitePerdPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [visiteData, setVisiteData] = useState({
    date: "",
    selectedEmployees: [] as Employee[],
    infirmier: "",
    reminderDate: "",
  });
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [scheduledEmployeeIds, setScheduledEmployeeIds] = useState<number[]>([]);

  // Load previously scheduled employees
  useEffect(() => {
    const storedScheduled = localStorage.getItem('scheduledEmployeeIds');
    if (storedScheduled) {
      setScheduledEmployeeIds(JSON.parse(storedScheduled));
    }
    const storedEmployees = localStorage.getItem('selectedEmployees');
    if (storedEmployees) {
      setVisiteData((prev) => ({
        ...prev,
        selectedEmployees: JSON.parse(storedEmployees),
      }));
    }
  }, []);

  const availableDoctors = doctors.filter(
    (doctor) => !scheduledEmployeeIds.includes(doctor.id)
  );

  const validateDates = (date: string, reminderDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const visitDate = new Date(date);
    const reminder = new Date(reminderDate);
    if (date && visitDate < new Date(today)) {
      return "La date de la visite doit être dans le futur.";
    }
    if (reminderDate && reminder < new Date(today)) {
      return "La date de rappel doit être dans le futur.";
    }
    if (date && reminderDate && reminder <= visitDate) {
      return "La date de rappel doit être après la date de la visite.";
    }
    return "";
  };

  const handleEmployeeToggle = (doctorId: string) => {
    const id = parseInt(doctorId);
    const isSelected = visiteData.selectedEmployees.some(emp => emp.id === id);
    
    let newSelectedEmployees: Employee[];
    if (isSelected) {
      newSelectedEmployees = visiteData.selectedEmployees.filter(emp => emp.id !== id);
    } else {
      if (visiteData.selectedEmployees.length >= 10) {
        setError("Vous ne pouvez pas sélectionner plus de 10 employés.");
        return;
      }
      const doctor = doctors.find(d => d.id === id);
      if (doctor) {
        newSelectedEmployees = [
          ...visiteData.selectedEmployees,
          {
            id: doctor.id,
            name: doctor.name,
            matricule: `MAT-${doctor.id.toString().padStart(4, '0')}`,
            email: doctor.email,
            attended: true,
            reminderDate: visiteData.reminderDate,
          },
        ];
      } else {
        return;
      }
    }

    setVisiteData((prevData) => ({
      ...prevData,
      selectedEmployees: newSelectedEmployees,
    }));
    localStorage.setItem('selectedEmployees', JSON.stringify(newSelectedEmployees));
    setError(newSelectedEmployees.length === 0 ? "Vous devez sélectionner au moins un employé." : "");
  };

  const handleChange = (name: string, value: string) => {
    setVisiteData((prevData) => {
      const newData = { ...prevData, [name]: value };
      const dateError = validateDates(newData.date, newData.reminderDate);
      setError(dateError || (visiteData.selectedEmployees.length === 0 ? "Vous devez sélectionner au moins un employé." : ""));
      return newData;
    });
  };

  const handleAttendanceToggle = (employeeId: number) => {
    setVisiteData((prevData) => ({
      ...prevData,
      selectedEmployees: prevData.selectedEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, attended: !emp.attended } : emp
      ),
    }));
  };

  const handleResendReminder = (employeeId: number, newReminderDate: string) => {
    if (!newReminderDate) {
      setError("Veuillez sélectionner une nouvelle date de rappel.");
      return;
    }
    const reminder = new Date(newReminderDate);
    const today = new Date();
    if (reminder < today) {
      setError("La date de rappel doit être dans le futur.");
      return;
    }
    setVisiteData((prevData) => ({
      ...prevData,
      selectedEmployees: prevData.selectedEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, reminderDate: newReminderDate } : emp
      ),
    }));
    console.log(`Nouveau rappel envoyé pour employé ${employeeId} à ${newReminderDate}`);
    alert(`Nouveau rappel planifié pour ${visiteData.selectedEmployees.find(emp => emp.id === employeeId)?.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (visiteData.selectedEmployees.length === 0) {
        setError("Vous devez sélectionner au moins un employé.");
        return;
      }
      if (visiteData.selectedEmployees.length > 10) {
        setError("Vous ne pouvez pas sélectionner plus de 10 employés.");
        return;
      }
      setStep(2);
      setError("");
    } else {
      if (!visiteData.date || !visiteData.infirmier || !visiteData.reminderDate) {
        setError("Tous les champs sont requis.");
        return;
      }
      const dateError = validateDates(visiteData.date, visiteData.reminderDate);
      if (dateError) {
        setError(dateError);
        return;
      }
      setShowConfirm(true);
    }
  };

  const confirmSave = () => {
    const newScheduledIds = [
      ...scheduledEmployeeIds,
      ...visiteData.selectedEmployees.map(emp => emp.id),
    ];
    setScheduledEmployeeIds(newScheduledIds);
    localStorage.setItem('scheduledEmployeeIds', JSON.stringify(newScheduledIds));
    localStorage.setItem('selectedEmployees', JSON.stringify([]));
    console.log("Données visite périodique:", visiteData);
    console.log("Rappels planifiés:", visiteData.selectedEmployees.map(emp => ({
      name: emp.name,
      reminderDate: emp.reminderDate || visiteData.reminderDate,
      attended: emp.attended,
    })));
    alert("Visite enregistrée avec succès !");
    navigate(-1);
  };

  const handleResetScheduled = () => {
    setScheduledEmployeeIds([]);
    localStorage.setItem('scheduledEmployeeIds', JSON.stringify([]));
    setVisiteData((prev) => ({ ...prev, selectedEmployees: [] }));
    localStorage.setItem('selectedEmployees', JSON.stringify([]));
    setError("");
  };

  return (
    <AppLayout title="Visite Périodique">
      <div className="p-4 md:p-6 space-y-6">
        <Card className="w-full">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">
                {step === 1 ? "Sélectionner les Employés" : "Nouvelle Visite Périodique"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Sélectionnez jusqu'à 10 employés pour la visite périodique."
                  : "Remplissez les informations pour planifier la visite périodique."}
              </CardDescription>
              {step === 1 && (
                <Button
                  variant="outline"
                  onClick={handleResetScheduled}
                  className="mt-2"
                >
                  Réinitialiser les employés programmés
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sélection</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Matricule</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableDoctors.map(doctor => (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <Checkbox
                                checked={visiteData.selectedEmployees.some(emp => emp.id === doctor.id)}
                                onCheckedChange={() => handleEmployeeToggle(doctor.id.toString())}
                              />
                            </TableCell>
                            <TableCell>{doctor.name}</TableCell>
                            <TableCell>{`MAT-${doctor.id.toString().padStart(4, '0')}`}</TableCell>
                            <TableCell>{doctor.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {visiteData.selectedEmployees.length > 0 && (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visiteData.selectedEmployees.map(emp => (
                            <TableRow key={emp.id}>
                              <TableCell>{emp.name}</TableCell>
                              <TableCell>{emp.matricule}</TableCell>
                              <TableCell>{emp.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <p className="text-sm">
                    Employés sélectionnés: {visiteData.selectedEmployees.length}/10
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="date">Date de la Visite</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={visiteData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="infirmier">Infirmier(ère)</Label>
                    <Select
                      value={visiteData.infirmier}
                      onValueChange={(value) => handleChange('infirmier', value)}
                      required
                    >
                      <SelectTrigger id="infirmier">
                        <SelectValue placeholder="Sélectionnez un infirmier" />
                      </SelectTrigger>
                      <SelectContent>
                        {nurses.map(nurse => (
                          <SelectItem key={nurse} value={nurse}>{nurse}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reminderDate">Date de Rappel Initiale</Label>
                    <Input
                      id="reminderDate"
                      name="reminderDate"
                      type="datetime-local"
                      value={visiteData.reminderDate}
                      onChange={(e) => handleChange('reminderDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>

            {error && <p className="text-red-500 text-sm mx-4">{error}</p>}

            <CardFooter className="flex justify-between gap-4">
              {step === 1 ? (
                <>
                  <Button variant="outline" onClick={() => navigate(-1)} type="button">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={visiteData.selectedEmployees.length === 0}>
                    Suivant
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setStep(1)} type="button">
                    Retour
                  </Button>
                  <Button type="submit">Enregistrer la Visite</Button>
                </>
              )}
            </CardFooter>
          </form>
        </Card>

        {step === 2 && visiteData.selectedEmployees.some(emp => !emp.attended) && (
          <Card className="w-full mt-6">
            <CardHeader>
              <CardTitle>Gérer les Non-Présences</CardTitle>
              <CardDescription>
                Marquez les employés non présents et planifiez un nouveau rappel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Présence</TableHead>
                    <TableHead>Nouveau Rappel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visiteData.selectedEmployees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.matricule}</TableCell>
                      <TableCell>
                        <Badge variant={emp.attended ? "default" : "destructive"}>
                          {emp.attended ? "Présent" : "Non Présent"}
                        </Badge>
                        <Button
                          variant="link"
                          onClick={() => handleAttendanceToggle(emp.id)}
                          className="ml-2"
                        >
                          Changer
                        </Button>
                      </TableCell>
                      <TableCell>
                        {!emp.attended && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="datetime-local"
                              onChange={(e) => handleResendReminder(emp.id, e.target.value)}
                              defaultValue={emp.reminderDate}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer l'enregistrement</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir enregistrer cette visite périodique pour {visiteData.selectedEmployees.length} employés ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default VisitePerdPage;