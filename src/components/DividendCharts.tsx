"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DividendMonth } from "@/lib/providers/types";
import { projectDividends } from "@/lib/dividendProjection";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui";

const AXIS = "#8b95a4";

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString("en-IE", {
    month: "short",
    year: "2-digit",
  });
}

function euro0(n: number): string {
  if (Math.abs(n) >= 1000) return `€${Math.round(n / 1000)}k`;
  return `€${Math.round(n)}`;
}

// ---------------------------------------------------------------------------

interface BarTip {
  active?: boolean;
  payload?: { value: number; payload: DividendMonth }[];
}

function BarTooltip({ active, payload }: BarTip) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted">{monthLabel(p.month)}</p>
      <p className="mt-0.5 font-semibold tnum">{formatCurrency(p.dividend, "EUR", 2)}</p>
    </div>
  );
}

export function MonthlyDividendChart({ data }: { data: DividendMonth[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={AXIS} strokeOpacity={0.15} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={monthLabel}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tickFormatter={euro0}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: AXIS, fillOpacity: 0.08 }} />
          <Bar dataKey="dividend" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm text-muted">{label}</label>
        <span className="tnum text-sm font-semibold">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
    </div>
  );
}

interface ProjTip {
  active?: boolean;
  label?: number;
  payload?: { value: number }[];
}

function ProjTooltip({ active, label, payload }: ProjTip) {
  if (!active || !payload?.length) return null;
  const annual = payload[0].value;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-semibold tnum">{formatCurrency(annual)}/yr</p>
      <p className="text-xs text-muted tnum">≈ {formatCurrency(annual / 12)}/mo</p>
    </div>
  );
}

export function DividendProjection({
  startAnnual,
  startYear,
  defaultYieldPct,
}: {
  startAnnual: number;
  startYear: number;
  defaultYieldPct: number;
}) {
  const [monthly, setMonthly] = useState(250);
  const [yieldPct, setYieldPct] = useState(
    Math.min(12, Math.max(2, Math.round(defaultYieldPct))),
  );
  const [dpsGrowth, setDpsGrowth] = useState(5);
  const [reinvest, setReinvest] = useState(true);
  const [years, setYears] = useState(15);

  const data = useMemo(
    () =>
      projectDividends({
        startAnnual,
        monthlyContribution: monthly,
        assumedYieldPct: yieldPct,
        dpsGrowthPct: dpsGrowth,
        reinvest,
        years,
        startYear,
      }),
    [startAnnual, monthly, yieldPct, dpsGrowth, reinvest, years, startYear],
  );
  const last = data[data.length - 1];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={`Projected income by ${last.year}`}
          value={`${formatCurrency(last.monthly)}/mo`}
          hint={`${formatCurrency(last.annual)}/yr`}
        />
        <StatCard
          label="Today's run-rate"
          value={`${formatCurrency(Math.round(startAnnual / 12))}/mo`}
          hint={`${formatCurrency(Math.round(startAnnual))}/yr`}
        />
      </section>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="div" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={AXIS} strokeOpacity={0.15} vertical={false} />
            <XAxis dataKey="year" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tickFormatter={euro0} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ProjTooltip />} />
            <Area type="monotone" dataKey="annual" stroke="#10b981" strokeWidth={2} fill="url(#div)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Slider label="Added per month" value={monthly} display={formatCurrency(monthly)} min={0} max={2000} step={50} onChange={setMonthly} />
        <Slider label="Assumed yield" value={yieldPct} display={`${yieldPct}%`} min={2} max={12} step={0.5} onChange={setYieldPct} />
        <Slider label="Dividend growth / yr" value={dpsGrowth} display={`${dpsGrowth > 0 ? "+" : ""}${dpsGrowth}%`} min={-5} max={15} step={0.5} onChange={setDpsGrowth} />
        <Slider label="Time horizon" value={years} display={`${years} years`} min={5} max={30} step={1} onChange={setYears} />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={reinvest}
          onChange={(e) => setReinvest(e.target.checked)}
          className="h-4 w-4 accent-emerald-500"
        />
        <span>Reinvest dividends (DRIP)</span>
      </label>

      <p className="mt-4 text-xs text-muted">
        Scenario based on your assumptions — a model, not a forecast. Set dividend
        growth negative to see how a cut would hit your income.
      </p>
    </>
  );
}
