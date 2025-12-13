// components/ui/PhoneInput.tsx
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const countries = [
  { code: '+91', flag: 'IN', label: 'India (+91)' },
  { code: '+1', flag: 'US', label: 'USA (+1)' },
  { code: '+44', flag: 'GB', label: 'UK (+44)' },
  { code: '+61', flag: 'AU', label: 'Australia (+61)' },
  { code: '+81', flag: 'JP', label: 'Japan (+81)' },
  { code: '+49', flag: 'DE', label: 'Germany (+49)' },
  { code: '+33', flag: 'FR', label: 'France (+33)' },
  { code: '+86', flag: 'CN', label: 'China (+86)' },
];

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState('+91');
  const [number, setNumber] = React.useState('');

  React.useEffect(() => {
    if (value) {
      const match = value.match(/^(\+\d{1,3})\s?(.+)?$/);
      if (match) {
        setSelectedCode(match[1]);
        setNumber(match[2] || '');
      }
    }
  }, [value]);

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    onChange(`${code} ${number}`);
    setOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, '').slice(0, 15);
    setNumber(num);
    onChange(`${selectedCode} ${num}`);
  };

  return (
    <div className="flex gap-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[100x] justify-between rounded-r-none border-r-0"
          >
            <span className="truncate">{selectedCode}</span>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  onSelect={() => handleCodeChange(country.code)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCode === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex-1">{country.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        placeholder={placeholder}
        value={number}
        onChange={handleNumberChange}
        className="rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        inputMode="numeric"
      />
    </div>
  );
}