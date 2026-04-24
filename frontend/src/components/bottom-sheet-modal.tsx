'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function BottomSheetModal({
  title,
  onClose,
  children,
  headerRight,
  zIndexClassName = 'z-[70]',
  panelClassName = 'max-h-[92vh] bg-[#161825]',
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#161825] px-5 py-3">
          <div>{title}</div>
          <div className="flex items-center gap-3">
            {headerRight}
            <button type="button" onClick={onClose} className="text-zinc-400" aria-label={closeAriaLabel}>
              <X size={22} />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
