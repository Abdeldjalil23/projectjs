// Choosing the worker a dependent depends on: a search list of matching workers.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounced } from '@/hooks/useDebounced';
import { Category, PersonRef, personLabel, searchHolders } from '@/lib/beneficiaries';

interface HolderPickerProps {
  id?: string;
  category: Category;
  value: PersonRef | null;
  onChange: (value: PersonRef | null) => void;
}

export const HolderPicker = ({ id, category, value, onChange }: HolderPickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const term = useDebounced(search);

  const results = useQuery({
    queryKey: ['holders', category, term],
    queryFn: () => searchHolders(category, term),
    enabled: open,
  });

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} className="flex-1 justify-between font-normal">
            <span className="truncate">{value ? personLabel(value) : t('beneficiaries.form.holderPlaceholder')}</span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={t('beneficiaries.form.holderSearch')} value={search} onValueChange={setSearch} />
            <CommandList>
              {results.isFetching && !results.data ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : (
                <CommandEmpty>{t('beneficiaries.form.holderNone')}</CommandEmpty>
              )}
              <CommandGroup>
                {(results.data ?? []).map((person) => (
                  <CommandItem
                    key={person.id}
                    value={person.id}
                    onSelect={() => {
                      onChange(person);
                      setOpen(false);
                    }}
                  >
                    <Check className={`me-2 h-4 w-4 ${value?.id === person.id ? 'opacity-100' : 'opacity-0'}`} />
                    {personLabel(person)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          aria-label={t('beneficiaries.form.holderClear')}
          title={t('beneficiaries.form.holderClear')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default HolderPicker;
