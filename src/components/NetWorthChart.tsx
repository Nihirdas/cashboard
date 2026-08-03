"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NetWorthPoint } from "@/lib/providers/types";
import { formatCurrency, formatMonth } from "@/lib/format";

const AXIS = "#8b95a4";

function compact(n: number): string {
  if (Math.abs(n) >= 1000) return `€${Math.round(n / 1000)}k`;
  return `€${n}`;
}

interface TipProps {
  active?: boolean;
  payload?: { value: number; payload: NetWorthPoint }[];
}

function ChartTooltip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted">{formatMonth(point.date)}</p>
      <p className="mt-0.5 font-semibold tnum">
        {formatCurrency(point.netWorth)}
      </p>
    </div>
  );
}

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="date"
            tickFormatter={formatMonth}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={compact}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={["dataMin - 2000", "dataMax + 2000"]}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: AXIS, strokeOpacity: 0.3 }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#nw)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
