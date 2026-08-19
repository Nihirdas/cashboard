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
