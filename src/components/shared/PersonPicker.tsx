// Choosing a beneficiary from a search list (name or number), with a button to clear the choice.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounced } from '@/hooks/useDebounced';
import { PersonRef, personLabel } from '@/lib/beneficiaries';

interface PersonPickerProps {
  id?: string;
  value: PersonRef | null;
  onChange: (value: PersonRef | null) => void;
  /** Finds the people matching the words typed. */
  search: (words: string) => Promise<PersonRef[]>;
  /** Key of the list in the query cache. */
  queryKey: string;
  placeholder: string;
  searchPlaceholder: string;
  empty: string;
  clearLabel: string;
}

export const PersonPicker = ({ id, value, onChange, search, queryKey, placeholder, searchPlaceholder, empty, clearLabel }: PersonPickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState('');
  const term = useDebounced(words);
  const results = useQuery({ queryKey: [queryKey, term], queryFn: () => search(term), enabled: open });

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} className="flex-1 justify-between font-normal">
            <span className="truncate">{value ? personLabel(value) : placeholder}</span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={words} onValueChange={setWords} />
            <CommandList>
              {results.isFetching && !results.data ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : (
                <CommandEmpty>{empty}</CommandEmpty>
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
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} aria-label={clearLabel} title={clearLabel}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PersonPicker;
