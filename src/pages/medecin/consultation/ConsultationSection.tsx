import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ConsultationData } from './types';

interface ConsultationSectionProps {
  consultationOpen: boolean;
  setConsultationOpen: (open: boolean) => void;
  consultationData: ConsultationData;
  handleConsultationInput: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => void;
}

const ConsultationSection = ({ consultationOpen, setConsultationOpen, consultationData, handleConsultationInput, handleSave }: ConsultationSectionProps) => {
  return (
    <>
      <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
        <DialogContent className="dialog-print-hide max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 pt-4 pb-3 border-b">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 2v2" />
                    <path d="M5 2v2" />
                    <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V5a2 2 0 0 0-2-2h-1" />
                    <path d="M8 15a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6" />
                    <circle cx="20" cy="12" r="2" />
                  </svg>
                </span>
                CONSULTATION MÉDICALE
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                مقابلة مع الطبيب العام
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Section: Informations de base */}
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Informations de base
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">
                    Numéro de Consultation
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="consultationNumber"
                    placeholder="Ex: CONS-2024-001"
                    value={consultationData.consultationNumber}
                    onChange={handleConsultationInput}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">
                    Numéro de Visite
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="visitNumber"
                    placeholder="Ex: VIS-001"
                    value={consultationData.visitNumber}
                    onChange={handleConsultationInput}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">Date</label>
                  <input
                    type="date"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="date"
                    value={consultationData.date}
                    onChange={handleConsultationInput}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">Médecin</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="doctor"
                    placeholder="Nom du médecin"
                    value={consultationData.doctor}
                    onChange={handleConsultationInput}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">Spécialité</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="specialty"
                    placeholder="Médecine générale..."
                    value={consultationData.specialty}
                    onChange={handleConsultationInput}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium leading-none">
                    Nature de Consultation
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    name="natureConsultation"
                    placeholder="Première visite, Suivi..."
                    value={consultationData.natureConsultation}
                    onChange={handleConsultationInput}
                  />
                </div>
              </div>
            </section>

            {/* Section: Diagnostic */}
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Diagnostic
              </h3>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
                name="diagnostic"
                rows={3}
                placeholder="Décrivez le diagnostic médical..."
                value={consultationData.diagnostic}
                onChange={handleConsultationInput}
              />
            </section>

            {/* Section: Arrêt de travail */}
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Arrêt de travail
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  className="flex h-9 w-24 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  name="workStoppageDays"
                  placeholder="0"
                  value={consultationData.workStoppageDays}
                  onChange={handleConsultationInput}
                />
                <span className="text-xs text-muted-foreground">jours d’arrêt</span>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/30">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Signature
              </span>
              <span className="text-sm font-semibold">LE MÉDECIN</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConsultationOpen(false)}
                className="min-w-[80px]"
              >
                Fermer
              </Button>
              <Button size="sm" onClick={handleSave} className="min-w-[95px]">
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {consultationOpen && (
        <div className="print-area hidden">
          <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
            <div className="flex flex-row justify-between items-start mb-8 w-full">
              <div className="flex flex-col items-start gap-1 text-xs min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-black text-white font-bold text-xs px-2 py-1 rounded">S</span>
                  <span className="font-bold text-xs tracking-tight">sonatrach</span>
                </div>
                <div className="font-semibold">Direction Régionale Haoud Berkaoui</div>
                <div>Centre de Médecine de Travail</div>
                <div className="mt-2">Nom du Médecin</div>
                <div className="text-muted-foreground">(Cachet)</div>
              </div>
              <div className="flex flex-col items-end gap-1 w-[340px]">
                <div className="font-bold text-base mb-2 underline underline-offset-2">CONSULTATION MÉDICALE</div>
                <div className="flex flex-col gap-2 w-full text-xs">
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Numéro Consultation :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.consultationNumber}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Numéro Visite :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.visitNumber}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Date :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.date}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Médecin :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.doctor}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Spécialité :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.specialty}</div>
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="font-semibold min-w-[100px]">Nature Consultation :</div>
                    <div className="w-full text-base font-normal px-1" style={{ borderBottom: '2px solid #000', minHeight: '2em' }}>{consultationData.natureConsultation}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center my-8 w-full">
              <div className="tracking-[0.4em] font-bold text-lg mb-1">DIAGNOSTIC</div>
              <div className="w-40 border-b-2 border-black mb-2"></div>
            </div>
            <div className="w-full mb-6">
              <div className="font-semibold mb-2">Diagnostic :</div>
              <div className="border border-black p-4 min-h-[100px] text-sm">
                {consultationData.diagnostic}
              </div>
            </div>
            <div className="w-full mb-6">
              <div className="font-semibold mb-2">Nombre de Jours - Arrêt de Travail :</div>
              <div className="flex items-center gap-2">
                <div className="border-b border-black px-2 py-1 min-w-[100px] text-center">{consultationData.workStoppageDays}</div>
                <span className="text-sm">jours</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationSection;
