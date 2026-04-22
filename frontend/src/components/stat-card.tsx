export function StatCard({
  label,
  value,
  accent = 'emerald',
}: {
  label: string;
  value: string;
  accent?: 'emerald' | 'red' | 'blue';
}) {
  const colorMap = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0b101c] p-4">
      <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[accent]}`}>{value}</p>
    </div>
  );
}
