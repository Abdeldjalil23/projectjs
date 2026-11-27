// The patient file: everything about one beneficiary, in tabs. Each tab is shown only to roles
// with the matching permission (medical content stays with the care team).
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { BeneficiaryDetails, Category, PersonRef, ageOn, fetchBeneficiary } from '@/lib/beneficiaries';
import BeneficiaryInfo from '@/pages/beneficiaries/BeneficiaryInfo';
import BeneficiaryDialog from '@/pages/beneficiaries/BeneficiaryDialog';
import BeneficiaryNumber from '@/pages/beneficiaries/BeneficiaryNumber';
import { WORKER_CATEGORIES } from '@/lib/workerAccess';
import WorkerAccessCard from './WorkerAccessCard';
import { PATIENT_TABS } from './tabs';

type DialogState =
  | { mode: 'create'; preset: { category: Category; holder: PersonRef; company?: string | null } }
  | { mode: 'edit'; beneficiary: BeneficiaryDetails }
  | null;

export const PatientFilePage = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { can } = useAuth();
  const [dialog, setDialog] = useState<DialogState>(null);

  const details = useQuery({ queryKey: ['beneficiary', id], queryFn: () => fetchBeneficiary(id), enabled: Boolean(id) });
  const b = details.data;


  const tabs = PATIENT_TABS.filter((tab) => tab.visible(can));
  const current = tabs.some((tab) => tab.value === params.get('tab')) ? params.get('tab')! : 'info';
  const age = b ? ageOn(b.birth_date) : null;

  return (
    <AppLayout title={b ? `${b.last_name} ${b.first_name}` : t('patient.title')}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/beneficiaries">
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('patient.back')}
          </Link>
        </Button>

        {details.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : details.isError || !b ? (
          <p className="py-8 text-center text-sm text-destructive">
            {details.error instanceof Error ? details.error.message : t('patient.notFound')}
          </p>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
                <h2 className="text-xl font-semibold" data-testid="patient-name">
                  {b.last_name} {b.first_name}
                </h2>
                <span className="font-mono text-sm">
                  <BeneficiaryNumber beneficiary={b} />
                </span>
                <Badge variant="outline">{t(`beneficiaries.categories.${b.category}`)}</Badge>
                <span className="text-sm text-muted-foreground">
                  {[b.sex ? t(`beneficiaries.sexes.${b.sex}`) : null, age !== null ? t('beneficiaries.years', { age }) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {!b.active && <Badge variant="secondary">{t('common.inactive')}</Badge>}
              </CardContent>
            </Card>

            <Tabs value={current} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
              <TabsList className="h-auto flex-wrap">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {t(`patient.tabs.${tab.value}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="info" className="mt-4 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <BeneficiaryInfo
                      beneficiary={b}
                      onOpen={(other) => navigate(`/beneficiaries/${other}`)}
                      onEdit={(beneficiary) => setDialog({ mode: 'edit', beneficiary })}
                      onAddDependent={(preset) => setDialog({ mode: 'create', preset })}
                    />
                  </CardContent>
                </Card>
                {/* Access to the workers' app, for workers and retirees (dependents use theirs). */}
                {can('worker_access.manage') && b.active && WORKER_CATEGORIES.includes(b.category) && <WorkerAccessCard beneficiaryId={b.id} />}
              </TabsContent>
              {tabs
                .filter((tab) => tab.value !== 'info')
                .map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-4">
                    {tab.render(b)}
                  </TabsContent>
                ))}
            </Tabs>
          </>
        )}
      </div>

      {dialog?.mode === 'create' && (
        <BeneficiaryDialog preset={dialog.preset} onClose={() => setDialog(null)} onSaved={(newId) => navigate(`/beneficiaries/${newId}`)} />
      )}
      {dialog?.mode === 'edit' && <BeneficiaryDialog beneficiary={dialog.beneficiary} onClose={() => setDialog(null)} />}
    </AppLayout>
  );
};

export default PatientFilePage;
