// src/components/InfoTextareaField.tsx
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InfoTextareaFieldProps {
  label?: string;
  value?: string;
  readOnly?: boolean;
  placeholder?: string;
}

const InfoTextareaField = ({
  label = '',
  value = '',
  readOnly = true,
  placeholder = ''
}: InfoTextareaFieldProps) => (
  <div className="space-y-1 md:col-span-2 lg:col-span-3">
    <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
    <Textarea
      id={label.toLowerCase().replace(/\s/g, '-')}
      value={value ?? ''}
      readOnly={readOnly}
      placeholder={placeholder || label}
      className="w-full min-h-[80px]"
    />
  </div>
);

export default InfoTextareaField;
