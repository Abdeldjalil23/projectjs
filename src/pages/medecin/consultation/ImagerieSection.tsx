import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import type { ImagerieData } from './types';
import { imagerieOptions } from './constants';


// Patient fields shown on the printed request.
const PRINT_FIELDS = [
  { label: 'Nom', key: 'nom' },
  { label: 'Prénoms', key: 'prenom' },
  { label: 'Age', key: 'age' },
  { label: 'Date', key: 'date' },
] as const;
interface ImagerieSectionProps {
  imagerieOpen: boolean;
  setImagerieOpen: (open: boolean) => void;
  imagerieData: ImagerieData;
  handleImagerieInput: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ImagerieSection = ({ imagerieOpen, setImagerieOpen, imagerieData, handleImagerieInput }: ImagerieSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={imagerieOpen} onOpenChange={setImagerieOpen}>
        <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-wide">
              DEMANDE D'IMAGERIE
            </DialogTitle>
            <DialogDescription className="text-center">
              طلب تصوير (أشعة، IRM…)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* Informations patient */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Informations du patient / معلومات المريض
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Nom :</label>
                  <input
                    name="nom"
                    value={imagerieData.nom}
                    onChange={handleImagerieInput}
                    placeholder="الاسم"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Prénom :</label>
                  <input
                    name="prenom"
                    value={imagerieData.prenom}
                    onChange={handleImagerieInput}
                    placeholder="اللقب"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Âge :</label>
                  <input
                    name="age"
                    type="number"
                    min={0}
                    value={imagerieData.age}
                    onChange={handleImagerieInput}
                    placeholder="العمر"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Date :</label>
                  <input
                    type="date"
                    name="date"
                    value={imagerieData.date}
                    onChange={handleImagerieInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Type d'imagerie */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Type d'imagerie / نوع التصوير
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {Object.keys(imagerieOptions).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imagerieType"
                      value={type}
                      checked={imagerieData.imagerieType === type}
                      onChange={handleImagerieInput}
                      className="w-4 h-4"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Liste des examens */}
            {imagerieData.imagerieType && (
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  {imagerieData.imagerieType.charAt(0).toUpperCase() +
                    imagerieData.imagerieType.slice(1)}{" "}
                  / الفحوصات
                </h3>

                <div className="border rounded-md p-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-[220px] overflow-y-auto pr-2">
                    {imagerieOptions[imagerieData.imagerieType]?.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/60 rounded px-1 py-0.5"
                      >
                        <input
                          type="checkbox"
                          name="examens"
                          value={opt}
                          checked={imagerieData.examens.includes(opt)}
                          onChange={handleImagerieInput}
                          className="w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Commentaires */}
            <div>
              <h3 className="font-semibold mb-2 text-base border-b pb-1">
                Commentaires / تعليقات
              </h3>
              <textarea
                name="commentaires"
                rows={4}
                value={imagerieData.commentaires}
                onChange={handleImagerieInput}
                placeholder="Commentaires supplémentaires / تعليقات إضافية..."
                className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Signature + Actions */}
            <div className="flex items-center justify-between pt-5 border-t">
              <span className="font-bold text-base">LE MÉDECIN / الطبيب</span>

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

      {imagerieOpen && (
        <div className="print-area hidden">
          <div className="font-sans text-black bg-white mx-auto p-1" style={{ width: '13.8cm', height: '20cm', fontSize: '10px' }}>
            <div className="flex justify-between items-start mb-1">
              <div className="text-xs min-w-[140px] space-y-0">
                <div className="flex items-center gap-1 mb-0">
                  <span className="bg-black text-white font-bold text-xs px-1 py-0.5 rounded">S</span>
                  <span className="font-bold tracking-tight text-xs">sonatrach</span>
                </div>
                <div className="font-semibold text-xs">Direction Régionale Haoud Berkaoui</div>
                <div className="text-xs">Centre de Médecine de Travail</div>
                <div className="mt-0 text-xs">Nom du Médecin</div>
                <div className="text-muted-foreground text-xs">(Cachet)</div>
              </div>

              <div className="text-xs w-[260px] space-y-0">
                <div className="font-bold text-xs underline">DEMANDE D'IMAGERIE</div>
                {PRINT_FIELDS.map(({ label, key }) => (
                  <div key={label} className="flex items-center">
                    <div className="font-semibold min-w-[40px] text-xs">{label} :</div>
                    <div className="w-full text-xs font-normal px-1 border-b border-black min-h-[0.8em]">
                      {imagerieData[key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center my-2">
              <div className="tracking-[0.1em] font-bold text-xs mb-0">DEMANDE D'IMAGERIE</div>
              <div className="w-20 border-b border-black mx-auto mb-0"></div>
            </div>

            <div className="text-xs">
              <div className="font-semibold mb-0">
                Type d'imagerie : {imagerieData.imagerieType.charAt(0).toUpperCase() + imagerieData.imagerieType.slice(1)}
              </div>
              <div className="font-semibold mb-0">Examens demandés :</div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0 text-xs leading-tight">
                {imagerieData.examens.map((exam, i) => (
                  <div key={i} className="flex items-start">
                    <span className="mr-0.5 text-xs">•</span>
                    <span className="text-xs leading-tight">{exam}</span>
                  </div>
                ))}
              </div>

              {imagerieData.commentaires && (
                <div className="mt-0.5">
                  <div className="font-semibold text-xs">Commentaires :</div>
                  <div className="text-xs">{imagerieData.commentaires}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <span className="font-bold text-xs">LE MÉDECIN</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagerieSection;
