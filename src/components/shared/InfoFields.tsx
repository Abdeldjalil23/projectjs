// src/components/shared/InfoFields.tsx
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const InfoTextareaField = ({
  label = '',
  value = '',
  readOnly = true,
  placeholder = ''
}) => (
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
