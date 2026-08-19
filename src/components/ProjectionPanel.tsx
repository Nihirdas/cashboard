"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { project } from "@/lib/projections";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui";

const AXIS = "#8b95a4";

function compactEuro(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `€${Math.round(n / 1000)}k`;
  return `€${Math.round(n)}`;
}

interface TipProps {
  active?: boolean;
  label?: number;
  payload?: { dataKey: string; value: number }[];
}

function ChartTooltip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.find((p) => p.dataKey === "total")?.value ?? 0;
  const contributed = payload.find((p) => p.dataKey === "contributed")?.value ?? 0;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-semibold tnum">{formatCurrency(total)}</p>
      <p className="text-xs text-muted tnum">
        {formatCurrency(contributed)} in ·{" "}
        <span className="text-emerald-600 dark:text-emerald-400">
          {formatCurrency(total - contributed)} growth
        </span>
      </p>
    </div>
  );
}

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

export function ProjectionPanel({
  currentNetWorth,
  startYear,
}: {
  currentNetWorth: number;
  startYear: number;
}) {
  const [start, setStart] = useState(Math.round(currentNetWorth));
  const [monthly, setMonthly] = useState(1500);
  const [ret, setRet] = useState(6);
  const [years, setYears] = useState(20);

  const data = useMemo(
    () =>
      project({
        startingValue: start,
        monthlyContribution: monthly,
        annualReturnPct: ret,
        years,
        startYear,
      }),
    [start, monthly, ret, years, startYear],
  );

  const last = data[data.length - 1];
  const growth = last.total - last.contributed;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={`Projected net worth by ${last.year}`}
          value={formatCurrency(last.total)}
        />
        <StatCard label="Total you put in" value={formatCurrency(last.contributed)} />
        <StatCard label="Growth from returns" value={formatCurrency(growth)} />
      </section>

      <Card className="mt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            >
              <defs>
                <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={AXIS}
                strokeOpacity={0.15}
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: AXIS, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={compactEuro}
                tick={{ fill: AXIS, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#proj)"
                name="Net worth"
              />
              <Line
                type="monotone"
                dataKey="contributed"
                stroke={AXIS}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Contributed"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted">
          Solid line = projected net worth · dashed = money you put in. The gap is
          compound growth.
        </p>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-semibold">Assumptions</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Slider
            label="Starting net worth"
            value={start}
            display={formatCurrency(start)}
            min={0}
            max={Math.max(500000, Math.round(currentNetWorth * 2))}
            step={1000}
            onChange={setStart}
          />
          <Slider
            label="Added per month"
            value={monthly}
            display={formatCurrency(monthly)}
            min={0}
            max={5000}
            step={50}
            onChange={setMonthly}
          />
          <Slider
            label="Expected annual return"
            value={ret}
            display={`${ret.toFixed(1)}%`}
            min={0}
            max={12}
            step={0.5}
            onChange={setRet}
          />
          <Slider
            label="Time horizon"
            value={years}
            display={`${years} years`}
            min={5}
            max={40}
            step={1}
            onChange={setYears}
          />
        </div>
      </Card>

      <p className="mt-4 text-xs text-muted">
        This is a scenario based on the assumptions above — a modelling tool, not
        financial advice or a guaranteed forecast. Real returns vary and can be
        negative.
      </p>
    </>
  );
}
