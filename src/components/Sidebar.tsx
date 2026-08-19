"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/accounts", label: "Accounts", icon: "M3 7h18v10H3zM3 11h18" },
  {
    href: "/transactions",
    label: "Transactions",
    icon: "M4 7h16M4 12h16M4 17h10",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
  },
  {
    href: "/projections",
    label: "Projections",
    icon: "M3 17l6-6 4 4 7-7M14 8h7v7",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 border-b border-line bg-surface lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5 lg:block">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-black">
            ₵
          </span>
          <span className="text-lg font-semibold tracking-tight">Cashboard</span>
        </Link>

        <nav className="flex gap-1 lg:mt-8 lg:flex-col">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="hidden h-4.5 w-4.5 sm:block"
                  aria-hidden
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden px-5 py-5 lg:block">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Demo data
        </span>
        <p className="mt-3 text-xs leading-5 text-muted">
          Sample numbers. Connect a real bank &amp; broker via the provider
          layer.
        </p>
      </div>
    </aside>
  );
}
