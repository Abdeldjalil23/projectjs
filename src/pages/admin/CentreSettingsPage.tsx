// Settings of the centre, for the administration: the header of printed documents, the rules of
// care coverage, the workers' app and the reports. Each card is saved on its own.
import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ClipboardCheck, FileText, Plus, Printer, Smartphone, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDateFormat } from '@/hooks/useDateFormat';
import { CentreSettings, LIMITS, SettingKey, WorkerContact, fetchCentreSettings, saveCentreSettings } from '@/lib/centreSettings';

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const lines = (text: string) => text.split('\n');

/** A card of settings with its own save button and the date of the last change. */
const SettingsCard = ({
  icon: Icon,
  title,
  description,
  updated,
  saving,
  onSave,
  children,
}: {
  icon: Icon;
  title: string;
  description: string;
  updated?: string;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span className="text-xs text-muted-foreground">{updated ? t('centreSettings.updated', { date: formatDate(updated) }) : ''}</span>
          <Button onClick={onSave} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const NumberField = ({ id, label, hint, value, onChange, limit }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; limit: { min: number; max: number } }) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type="number" inputMode="numeric" min={limit.min} max={limit.max} className="w-32" value={value} onChange={(e) => onChange(e.target.value)} />
    <p className="text-xs text-muted-foreground">{hint}</p>
  </div>
);

export const CentreSettingsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['centre-settings'], queryFn: fetchCentreSettings });
  const [header, setHeader] = useState('');
  const [validity, setValidity] = useState('');
  const [singleUse, setSingleUse] = useState(true);
  const [reasons, setReasons] = useState('');
  const [codeDays, setCodeDays] = useState('');
  const [contacts, setContacts] = useState<WorkerContact[]>([]);
  const [childAge, setChildAge] = useState('');

  // Fill the forms once the values are read (and again after each save).
  useEffect(() => {
    const v = settings.data?.values;
    if (!v) return;
    setHeader(v.print_header.join('\n'));
    setValidity(String(v.care_request_validity_days));
    setSingleUse(v.care_request_single_use);
    setReasons(v.care_request_refusal_reasons.join('\n'));
    setCodeDays(String(v.worker_invitation_days));
    setContacts(v.worker_contacts);
    setChildAge(String(v.report_child_max_age));
  }, [settings.data]);

  const save = useMutation({
    mutationFn: (changes: Partial<CentreSettings>) => saveCentreSettings(changes),
    onSuccess: () => {
      toast.success(t('centreSettings.saved'));
      for (const key of ['centre-settings', 'care-settings', 'print-header']) queryClient.invalidateQueries({ queryKey: [key] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t('common.requestFailed')),
  });
  const savingGroup = save.isPending ? (Object.keys(save.variables ?? {})[0] as SettingKey) : null;
  const updated = (key: SettingKey) => settings.data?.updatedAt[key];
  const setContact = (index: number, field: keyof WorkerContact, value: string) =>
    setContacts((list) => list.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  return (
    <AppLayout title={t('centreSettings.title')}>
      {settings.isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : settings.isError ? (
        <p className="py-8 text-center text-sm text-destructive">{settings.error instanceof Error ? settings.error.message : t('common.requestFailed')}</p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SettingsCard
            icon={Printer}
            title={t('centreSettings.print.title')}
            description={t('centreSettings.print.description')}
            updated={updated('print_header')}
            saving={savingGroup === 'print_header'}
            onSave={() => save.mutate({ print_header: lines(header) })}
          >
            <div className="grid gap-2">
              <Label htmlFor="set-header">{t('centreSettings.print.lines')}</Label>
              <Textarea id="set-header" dir="auto" rows={5} value={header} onChange={(e) => setHeader(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('centreSettings.print.hint')}</p>
            </div>
            <div dir="auto" className="rounded-md border bg-white p-3 text-[11px] leading-tight text-black" aria-label={t('centreSettings.print.preview')}>
              {lines(header)
                .filter((l) => l.trim())
                .map((line, i) => (
                  <p key={i} className={i === 0 ? 'font-semibold uppercase' : ''}>
                    {line}
                  </p>
                ))}
            </div>
          </SettingsCard>

          <SettingsCard
            icon={ClipboardCheck}
            title={t('centreSettings.care.title')}
            description={t('centreSettings.care.description')}
            updated={updated('care_request_validity_days')}
            saving={savingGroup === 'care_request_validity_days'}
            onSave={() =>
              save.mutate({
                care_request_validity_days: Number(validity),
                care_request_single_use: singleUse,
                care_request_refusal_reasons: lines(reasons),
              })
            }
          >
            <NumberField
              id="set-validity"
              label={t('centreSettings.care.validity')}
              hint={t('centreSettings.care.validityHint', LIMITS.care_request_validity_days)}
              value={validity}
              onChange={setValidity}
              limit={LIMITS.care_request_validity_days}
            />
            <label className="flex items-start gap-3">
              <Switch checked={singleUse} onCheckedChange={setSingleUse} className="mt-0.5" />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">{t('centreSettings.care.singleUse')}</span>
                <span className="block text-xs text-muted-foreground">{t('centreSettings.care.singleUseHint')}</span>
              </span>
            </label>
            <div className="grid gap-2">
              <Label htmlFor="set-reasons">{t('centreSettings.care.reasons')}</Label>
              <Textarea id="set-reasons" dir="auto" rows={5} value={reasons} onChange={(e) => setReasons(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('centreSettings.care.reasonsHint')}</p>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Smartphone}
            title={t('centreSettings.worker.title')}
            description={t('centreSettings.worker.description')}
            updated={updated('worker_contacts')}
            saving={savingGroup === 'worker_contacts'}
            onSave={() => save.mutate({ worker_contacts: contacts, worker_invitation_days: Number(codeDays) })}
          >
            <div className="space-y-3">
              <Label>{t('centreSettings.worker.contacts')}</Label>
              {contacts.length === 0 && <p className="text-sm text-muted-foreground">{t('centreSettings.worker.noContact')}</p>}
              {contacts.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_9rem_auto]" data-contact={i}>
                  <Input aria-label={t('centreSettings.worker.label')} placeholder={t('centreSettings.worker.label')} maxLength={80} dir="auto" value={c.label} onChange={(e) => setContact(i, 'label', e.target.value)} />
                  <Input aria-label={t('centreSettings.worker.phone')} placeholder={t('centreSettings.worker.phone')} maxLength={30} dir="ltr" inputMode="tel" value={c.phone} onChange={(e) => setContact(i, 'phone', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setContacts((list) => list.filter((_, j) => j !== i))} aria-label={t('centreSettings.worker.remove')} title={t('centreSettings.worker.remove')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Input
                    aria-label={t('centreSettings.worker.hours')}
                    placeholder={t('centreSettings.worker.hours')}
                    maxLength={80}
                    className="sm:col-span-3"
                    value={c.hours}
                    onChange={(e) => setContact(i, 'hours', e.target.value)}
                  />
                </div>
              ))}
              {contacts.length < 10 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setContacts((list) => [...list, { label: '', phone: '', hours: '' }])}>
                  <Plus className="me-1 h-4 w-4" />
                  {t('centreSettings.worker.add')}
                </Button>
              )}
            </div>
            <NumberField
              id="set-code-days"
              label={t('centreSettings.worker.codeDays')}
              hint={t('centreSettings.worker.codeDaysHint', LIMITS.worker_invitation_days)}
              value={codeDays}
              onChange={setCodeDays}
              limit={LIMITS.worker_invitation_days}
            />
          </SettingsCard>

          <SettingsCard
            icon={FileText}
            title={t('centreSettings.reports.title')}
            description={t('centreSettings.reports.description')}
            updated={updated('report_child_max_age')}
            saving={savingGroup === 'report_child_max_age'}
            onSave={() => save.mutate({ report_child_max_age: Number(childAge) })}
          >
            <NumberField
              id="set-child-age"
              label={t('centreSettings.reports.childAge')}
              hint={t('centreSettings.reports.childAgeHint', LIMITS.report_child_max_age)}
              value={childAge}
              onChange={setChildAge}
              limit={LIMITS.report_child_max_age}
            />
          </SettingsCard>
        </div>
      )}
    </AppLayout>
  );
};

export default CentreSettingsPage;
