import { createElement, useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  alphaHex,
  getIconComponent,
  type VisualIconName,
} from '@/lib/visual-options';

export function IconColorPicker({
  selectedIcon,
  selectedColor,
  onChangeIcon,
  onChangeColor,
}: {
  selectedIcon: string;
  selectedColor: string;
  onChangeIcon: (icon: VisualIconName) => void;
  onChangeColor: (color: string) => void;
}) {
  const [openSection, setOpenSection] = useState<'color' | 'icon' | null>(null);

  const selectedIconLabel = useMemo(() => {
    return ICON_OPTIONS.find((option) => option.id === selectedIcon)?.label ?? 'Selecionado';
  }, [selectedIcon]);

  function toggleSection(section: 'color' | 'icon') {
    setOpenSection((current) => (current === section ? null : section));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/60">
        <button
          type="button"
          onClick={() => toggleSection('color')}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
          aria-expanded={openSection === 'color'}
        >
          <span className="text-sm text-zinc-200">Cor</span>
          <span className="flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-full border"
              style={{
                backgroundColor: alphaHex(selectedColor, '22'),
                borderColor: selectedColor,
              }}
            />
            <ChevronDown
              size={16}
              className={`text-zinc-400 transition-transform ${openSection === 'color' ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {openSection === 'color' && (
          <div className="border-t border-zinc-800 px-3 py-3">
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChangeColor(color)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: alphaHex(color, '22'),
                    borderColor: color,
                  }}
                  aria-label={`Selecionar cor ${color}`}
                >
                  {selectedColor === color && <Check size={14} style={{ color }} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-900/60">
        <button
          type="button"
          onClick={() => toggleSection('icon')}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
          aria-expanded={openSection === 'icon'}
        >
          <span className="text-sm text-zinc-200">Icone</span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{selectedIconLabel}</span>
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md border"
              style={{
                backgroundColor: alphaHex(selectedColor, '22'),
                borderColor: selectedColor,
              }}
            >
              {createElement(getIconComponent(selectedIcon), {
                size: 14,
                style: { color: selectedColor },
              })}
            </span>
            <ChevronDown
              size={16}
              className={`text-zinc-400 transition-transform ${openSection === 'icon' ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {openSection === 'icon' && (
          <div className="border-t border-zinc-800 px-3 py-3">
            <div className="grid max-h-44 grid-cols-6 gap-2 overflow-y-auto pr-1">
              {ICON_OPTIONS.map((option) => {
                const isSelected = selectedIcon === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChangeIcon(option.id)}
                    className="flex h-10 items-center justify-center rounded-lg border transition-colors"
                    style={{
                      backgroundColor: isSelected ? alphaHex(selectedColor, '22') : '#18181B',
                      borderColor: isSelected ? selectedColor : '#3F3F46',
                    }}
                    aria-label={`Selecionar icone ${option.label}`}
                    title={option.label}
                  >
                    {createElement(getIconComponent(option.id), {
                      size: 18,
                      style: { color: selectedColor },
                    })}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
