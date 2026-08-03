import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

/** Money value with optional gain/loss colouring. */
export function AmountText({
  children,
  value,
  colored = false,
  className = "",
}: {
  children: ReactNode;
  value: number;
  colored?: boolean;
  className?: string;
}) {
  const tone = !colored
    ? ""
    : value > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : value < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted";
  return <span className={`tnum ${tone} ${className}`}>{children}</span>;
}

// Stable colour per spending category, reused by badges and bars.
const CATEGORY_COLORS: Record<string, string> = {
  Income: "bg-emerald-500",
  Housing: "bg-violet-500",
  Groceries: "bg-sky-500",
  Dining: "bg-amber-500",
  Transport: "bg-cyan-500",
  Utilities: "bg-indigo-500",
  Subscriptions: "bg-pink-500",
  Shopping: "bg-rose-500",
  Health: "bg-teal-500",
  Entertainment: "bg-fuchsia-500",
  Transfers: "bg-zinc-400",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-zinc-400";
}
