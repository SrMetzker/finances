'use client';
import { useMemo, useState } from 'react';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function useMonthFilter(initial = new Date()) {
  const [month, setMonth] = useState(fmt(initial));

  const parsed = useMemo(() => {
    const [y, m] = month.split('-');
    return { year: Number(y), month: Number(m) };
  }, [month]);

  return { month, setMonth, parsed };
}
