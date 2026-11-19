import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { EvacData } from './types';

interface EvacuationSectionProps {
  evacOpen: boolean;
  setEvacOpen: (open: boolean) => void;
  evacData: EvacData;
  handleEvacInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EvacuationSection = ({ evacOpen, setEvacOpen, evacData, handleEvacInput }: EvacuationSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={evacOpen} onOpenChange={setEvacOpen}>
        <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-wide">
              ÉVACUATION SANITAIRE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* En-tête officiel */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-0.5 text-xs leading-tight">
                <div className="font-bold uppercase">Sonatrach</div>
                <div>Exploration – Production</div>
                <div>Direction Régionale</div>
                <div>Haoud Berkaoui</div>
                <div>Division Personnel</div>
                <div>Service Santé / CMT</div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span>Haoud Berkaoui, le :</span>
                <input
                  type="date"
                  name="date"
                  value={evacData.date}
                  onChange={handleEvacInput}
                  className="border-b border-black bg-transparent px-1 focus:outline-none"
                />
              </div>
            </div>

            {/* Informations du patient */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Informations du patient
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Nom :</label>
                  <input
                    name="nom"
                    value={evacData.nom}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Prénom :</label>
                  <input
                    name="prenom"
                    value={evacData.prenom}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Fonction :</label>
                  <input
                    name="fonction"
                    value={evacData.fonction}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Structure :</label>
                  <input
                    name="structure"
                    value={evacData.structure}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Doit être évacué
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="w-36 shrink-0 font-medium">Son domicile :</label>
                  <input
                    name="domicile"
                    value={evacData.domicile}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-36 shrink-0 font-medium">Vers l'hôpital de :</label>
                  <input
                    name="hopital"
                    value={evacData.hopital}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-36 shrink-0 font-medium">Spécialiste en :</label>
                  <input
                    name="specialiste"
                    value={evacData.specialiste}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-36 shrink-0 font-medium">Délai :</label>
                  <input
                    name="delai"
                    value={evacData.delai}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Motif */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">Motif</h3>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="maladie"
                    checked={evacData.maladie}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Maladie
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accident"
                    checked={evacData.accident}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Accident du Travail
                </label>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="font-medium whitespace-nowrap">Autres à préciser :</span>
                  <input
                    name="autres"
                    value={evacData.autres}
                    onChange={handleEvacInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Moyens de transport */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Moyens de transport à utiliser
              </h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport.avion"
                    checked={evacData.transport?.avion}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Avion
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport.ambulance"
                    checked={evacData.transport?.ambulance}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Ambulance
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport.sh"
                    checked={evacData.transport?.sh}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Véhicule SH
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport.propres"
                    checked={evacData.transport?.propres}
                    onChange={handleEvacInput}
                    className="w-4 h-4"
                  />
                  Propres Moyens
                </label>
              </div>
            </div>

            {/* Accompagnement */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Accompagné par
              </h3>
              <div className="flex flex-wrap gap-10">
                <div className="flex items-center gap-4">
                  <span className="font-medium">L'infirmier :</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="inf"
                      value="oui"
                      checked={evacData.inf === "oui"}
                      onChange={handleEvacInput}
                    />
                    Oui
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="inf"
                      value="non"
                      checked={evacData.inf === "non"}
                      onChange={handleEvacInput}
                    />
                    Non
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-medium">L'assistant(e) :</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="assistant"
                      value="oui"
                      checked={evacData.assistant === "oui"}
                      onChange={handleEvacInput}
                    />
                    Oui
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="assistant"
                      value="non"
                      checked={evacData.assistant === "non"}
                      onChange={handleEvacInput}
                    />
                    Non
                  </label>
                </div>
              </div>
            </div>

            {/* Signature + Actions */}
            <div className="flex items-center justify-between pt-6 border-t mt-4">
              <div className="font-bold text-base">Le Médecin</div>

              <div className="flex gap-3">
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
          </div>
        </DialogContent>
      </Dialog>
      {evacOpen && (
        <div className="print-area hidden">
          <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
            <div className="flex flex-row justify-between items-center mb-2">
              <div>
                <div className="font-bold text-xs">sonatrach</div>
                <div className="text-xs">EXPLORATION – PRODUCTION</div>
                <div className="text-xs">DIRECTION REGIONAL</div>
                <div className="text-xs">HAOUD BERKAOUI</div>
                <div className="text-xs">DIVISION PERSONNEL</div>
                <div className="text-xs">SERVICE SANTE/CMT</div>
              </div>
              <div className="text-xs">Haoud Berkaoui Le : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.date}</span></div>
            </div>
            <div className="text-center font-bold text-lg my-2 border-b border-black">EVACUATION SANITAIRE</div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>Nom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.nom}</span></div>
              <div>Prénom : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.prenom}</span></div>
              <div>Fonction : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.fonction}</span></div>
              <div>Structure : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.structure}</span></div>
            </div>
            <div className="font-bold">Doit être évacué :</div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>Son domicile : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.domicile}</span></div>
              <div>vers l'hôpital de : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.hopital}</span></div>
              <div>Un spécialiste en : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.specialiste}</span></div>
              <div>Délai : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.delai}</span></div>
            </div>
            <div className="flex gap-4 items-center mb-2">
              <span className="flex items-center gap-1">Maladie <span className="border border-black w-4 h-4 inline-block text-center">{evacData.maladie ? '✔' : ''}</span></span>
              <span className="flex items-center gap-1">Accident du Travail <span className="border border-black w-4 h-4 inline-block text-center">{evacData.accident ? '✔' : ''}</span></span>
              <span>Autres à préciser : <span className="border-b border-black px-1 min-w-[80px] inline-block">{evacData.autres}</span></span>
            </div>
            <div className="font-bold">Moyens de transport à utiliser :</div>
            <div className="flex gap-4 items-center mb-2">
              <span className="flex items-center gap-1">Avion <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.avion ? '✔' : ''}</span></span>
              <span className="flex items-center gap-1">Ambulance <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.ambulance ? '✔' : ''}</span></span>
              <span className="flex items-center gap-1">Véhicule SH <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.sh ? '✔' : ''}</span></span>
              <span className="flex items-center gap-1">Propres Moyens <span className="border border-black w-4 h-4 inline-block text-center">{evacData.transport.propres ? '✔' : ''}</span></span>
            </div>
            <div className="font-bold">Accompagné par :</div>
            <div className="flex gap-8 items-center mb-2">
              <span>L'infirmier : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf === 'oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.inf === 'non' ? '✔' : ''}</span></span>
              <span>L'assistant(e) : Oui <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant === 'oui' ? '✔' : ''}</span> Non <span className="border border-black w-4 h-4 inline-block text-center">{evacData.assistant === 'non' ? '✔' : ''}</span></span>
            </div>
            <div className="text-end font-bold mt-4">Le Médecin</div>
          </div>
        </div>
      )}
    </>
  );
};

export default EvacuationSection;
