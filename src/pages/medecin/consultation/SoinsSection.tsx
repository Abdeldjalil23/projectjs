import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { SoinsData } from './types';

interface SoinsSectionProps {
  soinsOpen: boolean;
  setSoinsOpen: (open: boolean) => void;
  soinsData: SoinsData;
  handleSoinsInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SoinsSection = ({ soinsOpen, setSoinsOpen, soinsData, handleSoinsInput }: SoinsSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
              <Dialog open={soinsOpen} onOpenChange={setSoinsOpen}>
        <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-wide">
              CERTIFICAT MÉDICAL DE SOINS
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* En-tête + Type de certificat + Numéro */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-4">
              <div className="font-bold text-lg leading-tight">
                CERTIFICAT MÉDICAL DE
              </div>

              {/* Choix du type */}
              <div className="border border-black rounded-md p-3 space-y-1.5 min-w-[200px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="choix"
                    value="1"
                    checked={soinsData.choix === "1"}
                    onChange={handleSoinsInput}
                    className="w-4 h-4"
                  />
                  1 - Arrêt de travail
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="choix"
                    value="2"
                    checked={soinsData.choix === "2"}
                    onChange={handleSoinsInput}
                    className="w-4 h-4"
                  />
                  2 - Prolongation
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="choix"
                    value="3"
                    checked={soinsData.choix === "3"}
                    onChange={handleSoinsInput}
                    className="w-4 h-4"
                  />
                  3 - Reprise de travail
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="choix"
                    value="4"
                    checked={soinsData.choix === "4"}
                    onChange={handleSoinsInput}
                    className="w-4 h-4"
                  />
                  4 - Hospitalisation
                </label>
              </div>

              {/* Numéro */}
              <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                <span>N°</span>
                <input
                  name="signature"
                  value={soinsData.signature}
                  onChange={handleSoinsInput}
                  placeholder="Numéro"
                  className="border-b-2 border-red-600 bg-transparent w-24 text-center focus:outline-none"
                />
              </div>
            </div>

            {/* Informations générales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Émis le :</label>
                <input
                  type="date"
                  name="emisLe"
                  value={soinsData.emisLe}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Par le docteur :</label>
                <input
                  name="docteur"
                  value={soinsData.docteur}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Nom du patient :</label>
                <input
                  name="nom"
                  value={soinsData.nom}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Date accident / maladie :</label>
                <input
                  type="date"
                  name="dateAccident"
                  value={soinsData.dateAccident}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Service Employeur :</label>
                <input
                  name="service"
                  value={soinsData.service}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 shrink-0 font-medium">Compagnie :</label>
                <input
                  name="compagnie"
                  value={soinsData.compagnie}
                  onChange={handleSoinsInput}
                  className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Texte de certification */}
            <div className="font-medium leading-relaxed border-t pt-4">
              Je soussigné, Docteur en Médecine, certifie que l'état de santé du
              susnommé justifie :
            </div>

            {/* Contenu dynamique selon le choix */}
            <div className="border border-black rounded-md p-5 bg-gray-50/50 min-h-[80px]">
              {soinsData.choix === "1" && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  <span className="font-bold text-base">1.</span>
                  <span>Traitement avec arrêt de travail de</span>
                  <input
                    name="arretJours"
                    value={soinsData.arretJours}
                    onChange={handleSoinsInput}
                    className="border-b border-black w-14 text-center bg-transparent focus:outline-none"
                    placeholder="__"
                  />
                  <span>jours, sauf complications, du</span>
                  <input
                    type="date"
                    name="arretDu"
                    value={soinsData.arretDu}
                    onChange={handleSoinsInput}
                    className="border-b border-black bg-transparent focus:outline-none"
                  />
                  <span>au</span>
                  <input
                    type="date"
                    name="arretAu"
                    value={soinsData.arretAu}
                    onChange={handleSoinsInput}
                    className="border-b border-black bg-transparent focus:outline-none"
                  />
                </div>
              )}

              {soinsData.choix === "2" && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  <span className="font-bold text-base">2.</span>
                  <span>Prolongation d'arrêt de travail de</span>
                  <input
                    name="prolongationJours"
                    value={soinsData.prolongationJours}
                    onChange={handleSoinsInput}
                    className="border-b border-black w-14 text-center bg-transparent focus:outline-none"
                    placeholder="__"
                  />
                  <span>jours, sauf complications, du</span>
                  <input
                    type="date"
                    name="prolongationDu"
                    value={soinsData.prolongationDu}
                    onChange={handleSoinsInput}
                    className="border-b border-black bg-transparent focus:outline-none"
                  />
                  <span>au</span>
                  <input
                    type="date"
                    name="prolongationAu"
                    value={soinsData.prolongationAu}
                    onChange={handleSoinsInput}
                    className="border-b border-black bg-transparent focus:outline-none"
                  />
                </div>
              )}

              {soinsData.choix === "3" && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  <span className="font-bold text-base">3.</span>
                  <span>Reprise de travail à dater du</span>
                  <input
                    type="date"
                    name="repriseDate"
                    value={soinsData.repriseDate}
                    onChange={handleSoinsInput}
                    className="border-b border-black bg-transparent focus:outline-none"
                  />
                </div>
              )}

              {soinsData.choix === "4" && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  <span className="font-bold text-base">4.</span>
                  <span>Admission ou transport d'urgence à l'hôpital ou à la clinique de</span>
                  <input
                    name="admissionLieu"
                    value={soinsData.admissionLieu}
                    onChange={handleSoinsInput}
                    className="border-b border-black w-48 bg-transparent focus:outline-none"
                    placeholder="Nom de l'établissement"
                  />
                </div>
              )}

              {!soinsData.choix && (
                <div className="text-gray-400 italic text-center py-2">
                  Veuillez sélectionner un type de certificat ci-dessus
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t">
              <div className="text-center">
                <div className="font-medium mb-8">Cachet du Médecin</div>
                <div className="border-t border-dashed border-gray-400 w-32 mx-auto"></div>
              </div>

              <div className="text-center">
                <div className="mb-2">Ces exemplaires doivent être remis à :</div>
                <input
                  name="exemplaires"
                  value={soinsData.exemplaires}
                  onChange={handleSoinsInput}
                  className="border-b border-gray-400 bg-transparent w-full text-center focus:outline-none"
                  placeholder="..."
                />
              </div>

              <div className="text-center">
                <div className="font-medium mb-8">Signature du Médecin</div>
                <div className="border-t border-dashed border-gray-400 w-32 mx-auto"></div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={handlePrint} className="min-w-[110px]">
                Imprimer
              </Button>
              <DialogClose asChild>
                <Button variant="outline" className="min-w-[110px]">
                  Fermer
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
              {soinsOpen && (
                <div className="print-area hidden">
                  <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <div className="font-bold text-lg">CERTIFICAT MEDICAL DE</div>
                      <div className="flex flex-col text-xs border border-black p-2">
                        <div>1 Arrêt de travail</div>
                        <div>2 Prolongation</div>
                        <div>3 Reprise de travail</div>
                        <div>4 Hospitalisation</div>
                      </div>
                      <div className="text-red-600 font-bold text-lg ml-4">N° <span className="border-b border-black w-20 inline-block">{soinsData.signature}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>Emis le : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.emisLe}</span></div>
                      <div>Par le docteur : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.docteur}</span></div>
                      <div>Nom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.nom}</span></div>
                      <div>Date accident ou maladie : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.dateAccident}</span></div>
                      <div>Service Employeur : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.service}</span></div>
                      <div>Compagnie : <span className="border-b border-black px-1 min-w-[80px] inline-block">{soinsData.compagnie}</span></div>
                    </div>
                    <div className="font-bold my-2">Je soussigné, Docteur en Médecine, Certifie que l'état de santé du susnommé justifie :</div>
                    <div className="border border-black p-4 mb-2 flex flex-col gap-3">
                      {soinsData.choix === '1' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">1</span> Traitement avec arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.arretJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.arretAu}</span>
                        </div>
                      )}
                      {soinsData.choix === '2' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">2</span> Prolongation d'arrêt de travail de <span className="border-b border-black px-1 min-w-[40px] inline-block">{soinsData.prolongationJours}</span> jours, sauf complications, du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationDu}</span> au <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.prolongationAu}</span>
                        </div>
                      )}
                      {soinsData.choix === '3' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">3</span> Reprise de travail à dater du <span className="border-b border-black px-1 min-w-[60px] inline-block">{soinsData.repriseDate}</span>
                        </div>
                      )}
                      {soinsData.choix === '4' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">4</span> Admission ou transport d'urgence à l'hôpital ou à la clinique de <span className="border-b border-black px-1 min-w-[120px] inline-block">{soinsData.admissionLieu}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row justify-between mt-4 text-xs">
                      <div>Cachet du Médecin</div>
                      <div>Ces exemplaires doivent être remis à : <span className="border-b border-black px-1 min-w-[120px] inline-block">{soinsData.exemplaires}</span></div>
                      <div>Signature du Médecin</div>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default SoinsSection;
