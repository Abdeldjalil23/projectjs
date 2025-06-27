// src/pages/admin/VisitePerdPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const VisitePerdPage = () => {
  const navigate = useNavigate();
  const [visiteData, setVisiteData] = useState({
    numeroVisite: "",
    type: "",
    date: "",
    matricule: "",
    nom: "",
    prenom: "",
    structure: "",
    medecin: "",
    infirmier: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setVisiteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Données visite perdue:", visiteData);
    alert("Visite enregistrée avec succès !");
    navigate(-1);
  };

  return (
    <AppLayout title="Ajouter une Visite Perdue">
      <div className="p-4 md:p-6 space-y-6">
        <Card className="w-full">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">Nouvelle Visite Perdue</CardTitle>
              <CardDescription>
                Veuillez remplir les informations suivantes :
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="numeroVisite">N° Visite</Label>
                <Input
                  id="numeroVisite"
                  name="numeroVisite"
                  value={visiteData.numeroVisite}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={visiteData.type}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={visiteData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="matricule">Matricule</Label>
                <Input
                  id="matricule"
                  name="matricule"
                  value={visiteData.matricule}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={visiteData.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={visiteData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="structure">Structure</Label>
                <Input
                  id="structure"
                  name="structure"
                  value={visiteData.structure}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="medecin">Médecin</Label>
                <Input
                  id="medecin"
                  name="medecin"
                  value={visiteData.medecin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="infirmier">Infirmier(ère)</Label>
                <Input
                  id="infirmier"
                  name="infirmier"
                  value={visiteData.infirmier}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate(-1)} type="button">
                Annuler
              </Button>
              <Button type="submit">Enregistrer la Visite</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VisitePerdPage;
