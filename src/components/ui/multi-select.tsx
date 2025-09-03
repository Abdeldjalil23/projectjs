import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MultiSelectProps = {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
};

export const MultiSelect = ({ options, selected, onChange, placeholder }: MultiSelectProps) => {
  const [value, setValue] = useState(selected);

  const handleChange = (newValue: string) => {
    const updated = value.includes(newValue)
      ? value.filter(v => v !== newValue)
      : [...value, newValue];
    setValue(updated);
    onChange(updated);
  };

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label} {value.includes(option.value) ? '(Selected)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};