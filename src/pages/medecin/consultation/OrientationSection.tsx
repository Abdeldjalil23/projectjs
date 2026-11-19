import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { OrientationData } from './types';
import { natureOptions } from './constants';

interface OrientationSectionProps {
  orientationOpen: boolean;
  setOrientationOpen: (open: boolean) => void;
  orientationData: OrientationData;
  handleOrientationInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const OrientationSection = ({ orientationOpen, setOrientationOpen, orientationData, handleOrientationInput }: OrientationSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={orientationOpen} onOpenChange={setOrientationOpen}>
        <DialogContent className="dialog-print-hide max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-wide">
              LETTRE D'ORIENTATION
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* En-tête officiel */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-0.5 text-xs leading-tight">
                <div className="font-bold uppercase">Entreprise Nationale Sonatrach</div>
                <div>Exploration – Production</div>
                <div>Division Production</div>
                <div>Direction Régionale HBK</div>
                <div>C.M.S</div>
              </div>

              {/* Logo placeholder */}
              <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded flex items-center justify-center font-bold text-xl text-gray-500">
                S
              </div>
            </div>

            {/* Informations patient */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Informations du patient
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <label className="w-16 shrink-0 font-medium">Nom :</label>
                  <input
                    name="nom"
                    value={orientationData.nom}
                    onChange={handleOrientationInput}
                    placeholder="Nom"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 shrink-0 font-medium">Prénom :</label>
                  <input
                    name="prenom"
                    value={orientationData.prenom}
                    onChange={handleOrientationInput}
                    placeholder="Prénom"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 shrink-0 font-medium">Âge :</label>
                  <input
                    name="age"
                    type="number"
                    min={0}
                    value={orientationData.age}
                    onChange={handleOrientationInput}
                    placeholder="Âge"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Nature de visite */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Nature de visite
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {natureOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      name="nature"
                      value={opt}
                      checked={orientationData.nature.includes(opt)}
                      onChange={handleOrientationInput}
                      className="w-4 h-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span>Le/La susnommé(e) nécessite un avis / consultation en</span>
                <input
                  name="avis"
                  value={orientationData.avis}
                  onChange={handleOrientationInput}
                  placeholder="spécialité"
                  className="border-b border-gray-400 bg-transparent py-1 w-48 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Le docteur destinataire :</span>
                <input
                  name="destinataire"
                  value={orientationData.destinataire}
                  onChange={handleOrientationInput}
                  placeholder="Nom du docteur"
                  className="border-b border-gray-400 bg-transparent py-1 w-48 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Date :</span>
                <input
                  type="date"
                  name="date"
                  value={orientationData.date}
                  onChange={handleOrientationInput}
                  className="border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Signature + Actions */}
            <div className="flex items-center justify-between pt-5 border-t">
              <span className="font-bold text-base">LE MÉDECIN</span>

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
              {orientationOpen && (
                <div className="print-area hidden">
                  <div className="font-sans text-black bg-white mx-auto p-8" style={{ width: '14.8cm', height: '21cm' }}>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <div>
                        <div className="font-bold text-xs">ENTREPRISE NATIONALE SONATRACH</div>
                        <div className="text-xs">EXPLORATION - PRODUCTION</div>
                        <div className="text-xs">DIVISION PRODUCTION</div>
                        <div className="text-xs">DIRECTION REGIONAL HBK</div>
                        <div className="text-xs">C.M.S</div>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center font-bold text-lg">S</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2 mt-4">
                      <div className="border-b border-black px-1 col-span-1 min-w-[120px]">{orientationData.nom}</div>
                      <div className="border-b border-black px-1 col-span-1 min-w-[120px]">{orientationData.prenom}</div>
                      <div className="border-b border-black px-1 col-span-1 min-w-[80px]">{orientationData.age}</div>
                    </div>
                    <div className="font-bold text-center my-4 text-lg">LETTRE D'ORIENTATION</div>
                    <div className="mb-2">
                      <div className="font-semibold mb-1">Nature de visite :</div>
                      <div className="flex flex-col gap-1">
                        {natureOptions.map((opt) => (
                          <div key={opt} className="flex items-center gap-2 text-sm">
                            <span className="inline-block w-4 h-4 border border-black mr-2 align-middle">{orientationData.nature.includes(opt) ? '✔' : ''}</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-2 mt-4">
                      <span>Le/La susnommé(e) nécessite un avis / consultation en </span>
                      <span className="border-b border-black px-1 min-w-[120px] inline-block">{orientationData.avis}</span>
                    </div>
                    <div className="mb-2 mt-2">
                      <span>Le docteur destinataire : </span>
                      <span className="border-b border-black px-1 min-w-[120px] inline-block">{orientationData.destinataire}</span>
                    </div>
                    <div className="flex justify-between mt-12">
                      <span className="font-bold">LE MEDECIN</span>
                      <span>HBK: Le <span className="border-b border-black px-1 min-w-[80px] inline-block">{orientationData.date}</span></span>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default OrientationSection;
