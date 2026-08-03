import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string;
  /** e.g. "+3.2% MoM" — coloured by `changePositive`. */
  change?: string;
  hint?: string;
  changePositive?: boolean;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tnum">{value}</p>
      {(change || hint) && (
        <p className="mt-1 text-xs text-muted">
          {change && <span className="tnum">{change}</span>}
          {change && hint && " · "}
          {hint}
        </p>
      )}
    </Card>
  );
}

/** Variant that colours the change line green/red. */
export function StatCardWithDelta({
  label,
  value,
  deltaText,
  positive,
  hint,
}: {
  label: string;
  value: string;
  deltaText: string;
  positive: boolean;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tnum">{value}</p>
      <p className="mt-1 text-xs">
        <span
          className={`tnum font-medium ${
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {deltaText}
        </span>
        {hint && <span className="text-muted"> · {hint}</span>}
      </p>
    </Card>
  );
}
