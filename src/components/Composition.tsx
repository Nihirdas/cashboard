import { formatCurrency } from "@/lib/format";

export interface Segment {
  label: string;
  value: number;
  color: string; // Tailwind bg-* class
}

export function Composition({ segments }: { segments: Segment[] }) {
  const positive = segments.filter((s) => s.value > 0);
  const total = positive.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
        {positive.map((s) => (
          <div
            key={s.label}
            className={s.color}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${formatCurrency(s.value)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {positive.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
            <span className="text-muted">{s.label}</span>
            <span className="tnum font-medium">{formatCurrency(s.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
