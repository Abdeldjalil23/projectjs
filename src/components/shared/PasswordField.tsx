import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePassword } from '@/lib/accounts';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** Password chosen by the administrator, with a generator and a copy button. */
export const PasswordField = ({ id, label, value, onChange }: PasswordFieldProps) => {
  const { t } = useTranslation();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('password.copied'));
    } catch {
      toast.error(t('password.copyFailed'));
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          spellCheck={false}
          dir="ltr"
          className="font-mono"
          placeholder={t('password.placeholder')}
        />
        <Button type="button" variant="outline" size="icon" onClick={() => onChange(generatePassword())} title={t('password.generate')} aria-label={t('password.generate')}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={copy} disabled={!value} title={t('password.copy')} aria-label={t('password.copy')}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t('password.hint')}</p>
    </div>
  );
};

export default PasswordField;
