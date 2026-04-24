import { type ReactNode } from 'react';

export function MobileListItem({
  leading,
  title,
  subtitle,
  value,
  valueClassName,
  trailing,
}: {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  value?: ReactNode;
  valueClassName?: string;
  trailing?: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between rounded-2xl bg-[#1e2235] px-4 py-3">
      <div className="flex items-center gap-3">
        {leading}
        <div>
          <p className="font-medium text-sm">{title}</p>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        {value !== undefined && (
          <p className={`font-semibold text-sm ${valueClassName ?? ''}`.trim()}>{value}</p>
        )}
        {trailing}
      </div>
    </li>
  );
}