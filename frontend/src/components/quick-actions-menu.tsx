'use client';

import { Plus, X, type LucideIcon } from 'lucide-react';

export type QuickActionItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export function QuickActionsMenu({
  isOpen,
  onToggle,
  onSelect,
  items,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (actionId: string) => void;
  items: QuickActionItem[];
}) {
  const radius = 132;
  const startAngle = 155;
  const endAngle = 25;

  function itemPosition(index: number) {
    if (items.length === 1) {
      const onlyAngle = 90;
      const rad = (onlyAngle * Math.PI) / 180;
      return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
    }

    const step = (startAngle - endAngle) / (items.length - 1);
    const angle = startAngle - index * step;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu de ações"
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/75"
        />
      )}

      <div className="relative z-50 flex flex-1 justify-center items-center">
        {isOpen && (
          <div className="pointer-events-none fixed bottom-16 left-1/2">
            {items.map((item, index) => {
              const pos = itemPosition(index);

              return (
                <div
                  key={item.id}
                  className="absolute flex flex-col items-center gap-2"
                  style={{
                    transform: `translate(-50%, 0) translate(${pos.x}px, ${-pos.y}px)`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="pointer-events-auto h-14 w-14 rounded-full bg-[#5c5e6d] flex items-center justify-center"
                  >
                    <item.icon size={24} className={item.iconClassName ?? 'text-zinc-200'} />
                  </button>
                  <span className="pointer-events-none text-white text-[11px] leading-none text-center whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
          className="relative -top-3 h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl"
        >
          {isOpen ? <X size={28} /> : <Plus size={28} />}
        </button>
      </div>
    </>
  );
}