import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import type { OrdonnanceData, ServiceType } from './types';

interface OrdonnanceSectionProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedType: ServiceType | null;
  formData: OrdonnanceData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OrdonnanceSection = ({ open, setOpen, selectedType, formData, handleInputChange }: OrdonnanceSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="dialog-print-hide sm:max-w-[520px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-3 border-b">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {selectedType?.title === 'Ordonnance' ? 'Ordonnance Médicale' : 'Demande de service'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire d'ordonnance médicale
            </DialogDescription>
          </DialogHeader>

          {selectedType?.title === 'Ordonnance' && (
            <div className="px-4 py-4 space-y-4">
              {/* Header with icon + title */}
              <div className="flex items-center gap-2.5 pb-3 border-b">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  {selectedType.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedType.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedType.desc}</p>
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Informations Patient
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="nom" className="text-xs">Nom</Label>
                    <Input
                      id="nom"
                      name="nom"
                      placeholder="Nom de famille"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="prenoms" className="text-xs">Prénom(s)</Label>
                    <Input
                      id="prenoms"
                      name="prenoms"
                      placeholder="Prénom(s)"
                      value={formData.prenoms}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs">Âge</Label>
                    <Input
                      id="age"
                      name="age"
                      placeholder="Ex: 34 ans"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-xs">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Médicaments */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Prescription
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Médicament • Posologie • Durée
                  </span>
                </div>

                <Textarea
                  name="medicaments"
                  rows={6}
                  placeholder={`Exemple :
      1. Amoxicilline 500mg - 1 comprimé 3x/jour - 7 jours
      2. Paracétamol 1000mg - 1 comprimé si douleur - max 3/jour
      3. ...`}
                  value={formData.medicaments}
                  onChange={handleInputChange}
                  className="resize-none font-mono text-sm leading-relaxed min-h-[120px]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">Fermer</Button>
                </DialogClose>

                <Button onClick={handlePrint} size="sm" className="gap-2">
                  <Printer className="h-3.5 w-3.5" />
                  Imprimer l'ordonnance
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== PRINT AREA FOR ORDONNANCE ========== */}
      {open && selectedType?.title === 'Ordonnance' && (
        <div className="print-area hidden">
          <div className="font-sans text-black bg-white mx-auto p-6" style={{ width: '13.8cm', height: '20cm' }}>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-black text-white font-bold text-xs px-1.5 py-0.5 rounded">S</span>
                  <span className="font-bold tracking-tight">sonatrach</span>
                </div>
                <div className="font-semibold">Direction Régionale Haoud Berkaoui</div>
                <div>Centre de Médecine de Travail</div>
                <div className="mt-2">Nom du Médecin</div>
                <div className="text-muted-foreground text-xs">(Cachet)</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-base underline underline-offset-2 mb-1">ORDONNANCE MÉDICALE</div>
                <div className="text-xs text-gray-600">وصفة طبية</div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold min-w-[60px]">Nom :</span>
                <span className="border-b border-black flex-1 px-1">{formData.nom || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[70px]">Prénom :</span>
                <span className="border-b border-black flex-1 px-1">{formData.prenoms || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[60px]">Âge :</span>
                <span className="border-b border-black flex-1 px-1">{formData.age || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[70px]">Date :</span>
                <span className="border-b border-black flex-1 px-1">{formData.date || '—'}</span>
              </div>
            </div>

            {/* Médicaments */}
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Prescription :</div>
              <div className="border border-black rounded p-3 min-h-[280px] text-sm leading-relaxed whitespace-pre-wrap">
                {formData.medicaments || 'Aucune prescription renseignée'}
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="flex justify-end mt-10">
              <div className="text-center">
                <div className="font-bold text-sm mb-8">LE MÉDECIN</div>
                <div className="border-t border-black w-40 pt-1 text-xs">Cachet & Signature</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default OrdonnanceSection;
