import { type ReactNode } from 'react';

export function MobileListItem({
  leading,
  title,
  subtitle,
  value,
  valueClassName,
  trailing,
  onClick,
}: {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  value?: ReactNode;
  valueClassName?: string;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
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
    </>
  );

  return (
    <li className="rounded-2xl bg-[#1e2235]">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center justify-between px-4 py-3">{content}</div>
      )}
    </li>
  );
}