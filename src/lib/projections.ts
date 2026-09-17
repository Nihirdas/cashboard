// Net-worth projection — a compound-growth calculator. This is scenario
// modelling driven by assumptions the user sets, NOT financial advice or a
// guaranteed forecast.

export interface ProjectionInput {
  /** Net worth today. */
  startingValue: number;
  /** Amount added each month (savings + investment contributions). */
  monthlyContribution: number;
  /** Assumed average annual return, as a percentage (e.g. 6 = 6%/yr). */
  annualReturnPct: number;
  /** How many years to project. */
  years: number;
  /** Calendar year the projection starts from. */
  startYear: number;
}

export interface ProjectionPoint {
  year: number;
  /** Projected net worth at year end. */
  total: number;
  /** Cumulative money you put in (starting value + contributions so far). */
  contributed: number;
}

/**
 * Compounds monthly: each month grows the balance by the monthly rate, then
 * adds the contribution. Returns one point per year (including year 0).
 */
export function project(input: ProjectionInput): ProjectionPoint[] {
  const { startingValue, monthlyContribution, annualReturnPct, years, startYear } =
    input;
  const monthlyRate = annualReturnPct / 100 / 12;

  let balance = startingValue;
  let contributed = startingValue;

  const points: ProjectionPoint[] = [
    { year: startYear, total: Math.round(balance), contributed: Math.round(contributed) },
  ];

  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;
    if (month % 12 === 0) {
      points.push({
        year: startYear + month / 12,
        total: Math.round(balance),
        contributed: Math.round(contributed),
      });
    }
  }
  return points;
}

// ---------------------------------------------------------------------------
// Query parsing for the /api/projections endpoint. Kept next to the maths so
// the validation the API enforces is unit-tested in the same place.
// ---------------------------------------------------------------------------

/** Inclusive bounds the API accepts per input. Deliberately wider than the UI
 *  sliders: the sliders are a convenience, the API is the contract. */
export const PROJECTION_BOUNDS = {
  start: { min: 0, max: 100_000_000 },
  monthly: { min: 0, max: 1_000_000 },
  return: { min: -100, max: 100 },
  years: { min: 1, max: 100 },
  startYear: { min: 1900, max: 2200 },
} as const;

/** Applied when a param is missing or blank. */
export const PROJECTION_DEFAULTS = {
  start: 0,
  monthly: 0,
  return: 5,
  years: 10,
} as const;

export interface ProjectionSummary {
  finalYear: number;
  total: number;
  contributed: number;
  growth: number;
}

export interface ProjectionResult {
  input: ProjectionInput;
  points: ProjectionPoint[];
  summary: ProjectionSummary;
}

export type ParsedQuery =
  | { ok: true; input: ProjectionInput }
  | { ok: false; error: string };

/** Anything with a URLSearchParams-style `get` (so tests can pass a plain map). */
type Query = { get(key: string): string | null };

function readNumber(
  query: Query,
  key: string,
  fallback: number,
  bounds: { min: number; max: number },
  integer = false,
): { value: number } | { error: string } {
  const raw = query.get(key);
  if (raw === null || raw.trim() === "") return { value: fallback };
  const n = Number(raw);
  if (!Number.isFinite(n)) return { error: `"${key}" must be a number` };
  if (integer && !Number.isInteger(n)) return { error: `"${key}" must be a whole number` };
  if (n < bounds.min || n > bounds.max) {
    return { error: `"${key}" must be between ${bounds.min} and ${bounds.max}` };
  }
  return { value: n };
}

/**
 * Parse and validate a projection query. Missing/blank params fall back to
 * defaults; anything present but invalid is rejected so the caller can 400.
 */
export function parseProjectionQuery(query: Query): ParsedQuery {
  const fields = [
    readNumber(query, "start", PROJECTION_DEFAULTS.start, PROJECTION_BOUNDS.start),
    readNumber(query, "monthly", PROJECTION_DEFAULTS.monthly, PROJECTION_BOUNDS.monthly),
    readNumber(query, "return", PROJECTION_DEFAULTS.return, PROJECTION_BOUNDS.return),
    readNumber(query, "years", PROJECTION_DEFAULTS.years, PROJECTION_BOUNDS.years, true),
    readNumber(query, "startYear", new Date().getFullYear(), PROJECTION_BOUNDS.startYear, true),
  ];

  for (const f of fields) {
    if ("error" in f) return { ok: false, error: f.error };
  }
  const [start, monthly, ret, years, startYear] = fields.map((f) =>
    "value" in f ? f.value : 0,
  );

  return {
    ok: true,
    input: {
      startingValue: start,
      monthlyContribution: monthly,
      annualReturnPct: ret,
      years,
      startYear,
    },
  };
}

/** Run a projection and package it the way the API and UI both consume. */
export function projectionResult(input: ProjectionInput): ProjectionResult {
  const points = project(input);
  const last = points[points.length - 1];
  return {
    input,
    points,
    summary: {
      finalYear: last.year,
      total: last.total,
      contributed: last.contributed,
      growth: last.total - last.contributed,
    },
  };
}
