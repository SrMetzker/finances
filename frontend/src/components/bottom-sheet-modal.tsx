'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function BottomSheetModal({
  title,
  onClose,
  children,
  headerRight,
  zIndexClassName = 'z-[70]',
  panelClassName = 'brand-panel max-h-[92vh] border border-white/5',
  closeAriaLabel = 'Fechar modal',
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  headerRight?: ReactNode;
  zIndexClassName?: string;
  panelClassName?: string;
  closeAriaLabel?: string;
}) {
  return (
    <div className={`fixed inset-0 ${zIndexClassName}`}>
      <button
        type="button"
        aria-label={closeAriaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />

      <div
        className={`absolute inset-x-0 bottom-0 overflow-y-auto rounded-t-3xl shadow-2xl ${panelClassName}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[rgba(39,38,37,0.95)] px-5 py-3 backdrop-blur-xl">
          <div>{title}</div>
          <div className="flex items-center gap-3">
            {headerRight}
            <button type="button" onClick={onClose} className="text-zinc-300" aria-label={closeAriaLabel}>
              <X size={22} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
