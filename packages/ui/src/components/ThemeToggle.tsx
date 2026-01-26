"use client";

import { useEffect, useState } from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // avoid hydration mismatch

  const active = (theme === 'system' ? resolvedTheme : theme) ?? 'system';
  const ActiveIcon = options.find((opt) => opt.value === active)?.icon ?? Laptop;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border bg-card text-card-foreground p-2 shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label={`Current theme: ${active}`}
        >
          <ActiveIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-44"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = opt.value === active;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${isActive ? 'bg-muted text-foreground' : 'hover:bg-muted'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
