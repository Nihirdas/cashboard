import type { CategorySpend } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { categoryColor } from "@/components/ui";

export function CategoryBars({ items }: { items: CategorySpend[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No spending recorded this month.</p>;
  }
  const max = Math.max(...items.map((i) => i.amount));

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.category}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${categoryColor(item.category)}`}
              />
              {item.category}
            </span>
            <span className="tnum font-medium">
              {formatCurrency(item.amount)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${categoryColor(item.category)}`}
              style={{ width: `${Math.max(4, (item.amount / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
