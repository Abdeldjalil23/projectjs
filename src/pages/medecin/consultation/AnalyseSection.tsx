import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import type { ExplorationData } from './types';
import { testOptions } from './constants';


// Patient fields shown on the printed request.
const PRINT_FIELDS = [
  { label: 'Nom', key: 'nom' },
  { label: 'Prénoms', key: 'prenom' },
  { label: 'Age', key: 'age' },
  { label: 'Date', key: 'date' },
] as const;
interface AnalyseSectionProps {
  explorationOpen: boolean;
  setExplorationOpen: (open: boolean) => void;
  explorationData: ExplorationData;
  handleExplorationInput: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AnalyseSection = ({ explorationOpen, setExplorationOpen, explorationData, handleExplorationInput }: AnalyseSectionProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={explorationOpen} onOpenChange={setExplorationOpen}>
        <DialogContent className="dialog-print-hide max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold tracking-wide">
              DEMANDE D'ANALYSE MÉDICALE
            </DialogTitle>
            <DialogDescription className="text-center">
              طلب تحاليل أو فحوصات مخبرية
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
                    value={explorationData.nom}
                    onChange={handleExplorationInput}
                    placeholder="الاسم"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Prénom :</label>
                  <input
                    name="prenom"
                    value={explorationData.prenom}
                    onChange={handleExplorationInput}
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
                    value={explorationData.age}
                    onChange={handleExplorationInput}
                    placeholder="العمر"
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 shrink-0 font-medium">Date :</label>
                  <input
                    type="date"
                    name="date"
                    value={explorationData.date}
                    onChange={handleExplorationInput}
                    className="flex-1 border-b border-gray-400 bg-transparent py-1 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Type d'analyse */}
            <div>
              <h3 className="font-semibold mb-3 text-base border-b pb-1">
                Type d'analyse / نوع التحليل
              </h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="analyseType"
                    value="interne"
                    checked={explorationData.analyseType === "interne"}
                    onChange={handleExplorationInput}
                    className="w-4 h-4"
                  />
                  Analyse Interne / تحليل داخلي
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="analyseType"
                    value="externe"
                    checked={explorationData.analyseType === "externe"}
                    onChange={handleExplorationInput}
                    className="w-4 h-4"
                  />
                  Analyse Externe / تحليل خارجي
                </label>
              </div>
            </div>

            {/* Liste des analyses */}
            {explorationData.analyseType && (
              <div>
                <h3 className="font-semibold mb-3 text-base border-b pb-1">
                  {explorationData.analyseType === "interne"
                    ? "Analyses Internes / التحاليل الداخلية"
                    : "Analyses Externes / التحاليل الخارجية"}
                </h3>

                <div className="border rounded-md p-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-[220px] overflow-y-auto pr-2">
                    {testOptions[explorationData.analyseType]?.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/60 rounded px-1 py-0.5"
                      >
                        <input
                          type="checkbox"
                          name="tests"
                          value={opt}
                          checked={explorationData.tests.includes(opt)}
                          onChange={handleExplorationInput}
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
                value={explorationData.commentaires}
                onChange={handleExplorationInput}
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

      {explorationOpen && (
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
                <div className="font-bold text-xs underline">DEMANDE D'ANALYSE MÉDICALE</div>
                {PRINT_FIELDS.map(({ label, key }) => (
                  <div key={label} className="flex items-center">
                    <div className="font-semibold min-w-[40px] text-xs">{label} :</div>
                    <div className="w-full text-xs font-normal px-1 border-b border-black min-h-[0.8em]">
                      {explorationData[key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center my-2">
              <div className="tracking-[0.1em] font-bold text-xs mb-0">DEMANDE D'ANALYSE</div>
              <div className="w-20 border-b border-black mx-auto mb-0"></div>
            </div>

            <div className="text-xs">
              <div className="font-semibold mb-0">
                Type d'analyse : {explorationData.analyseType === 'interne' ? 'Analyses Internes' : 'Analyses Externes'}
              </div>
              <div className="font-semibold mb-0">Analyses demandées :</div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0 text-xs leading-tight">
                {explorationData.tests.map((test, i) => (
                  <div key={i} className="flex items-start">
                    <span className="mr-0.5 text-xs">•</span>
                    <span className="text-xs leading-tight">{test}</span>
                  </div>
                ))}
              </div>

              {explorationData.commentaires && (
                <div className="mt-0.5">
                  <div className="font-semibold text-xs">Commentaires :</div>
                  <div className="text-xs">{explorationData.commentaires}</div>
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

export default AnalyseSection;
