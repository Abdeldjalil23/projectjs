import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Password copied');
    } catch {
      toast.error('Could not copy. Select the password and copy it by hand.');
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
          className="font-mono"
          placeholder="At least 8 characters"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => onChange(generatePassword())} title="Generate">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={copy} disabled={!value} title="Copy">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Give it to the person directly. They cannot change it themselves yet.
      </p>
    </div>
  );
};

export default PasswordField;
