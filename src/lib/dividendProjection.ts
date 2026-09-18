// Dividend-income projection — the DRIP snowball. Scenario modelling driven by
// assumptions you set, NOT advice. Dividends can be cut, so DPS growth is
// allowed to be negative.
//
// Each year, next year's income grows from three things:
//   1. DPS growth on the income you already have (can be negative = a cut),
//   2. reinvested dividends buying more income at the assumed yield,
//   3. new contributions buying more income at the assumed yield.

export interface DividendProjectionInput {
  /** Current annual dividend income. */
  startAnnual: number;
  /** Money added to the dividend portfolio each month. */
  monthlyContribution: number;
  /** Assumed portfolio yield, % per year (e.g. 6). */
  assumedYieldPct: number;
  /** Assumed dividend-per-share growth, % per year — can be negative. */
  dpsGrowthPct: number;
  /** Reinvest dividends (DRIP) or take them as cash. */
  reinvest: boolean;
  years: number;
  startYear: number;
}

export interface DividendProjectionPoint {
  year: number;
  annual: number;
  monthly: number;
}

export function projectDividends(
  input: DividendProjectionInput,
): DividendProjectionPoint[] {
  const {
    startAnnual,
    monthlyContribution,
    assumedYieldPct,
    dpsGrowthPct,
    reinvest,
    years,
    startYear,
  } = input;

  const yield_ = assumedYieldPct / 100;
  const g = dpsGrowthPct / 100;
  const contribPerYear = monthlyContribution * 12;

  let income = startAnnual;
  const points: DividendProjectionPoint[] = [
    { year: startYear, annual: Math.round(income), monthly: Math.round(income / 12) },
  ];

  for (let i = 1; i <= years; i++) {
    const reinvested = reinvest ? income : 0;
    income = income * (1 + g) + (reinvested + contribPerYear) * yield_;
    points.push({
      year: startYear + i,
      annual: Math.round(income),
      monthly: Math.round(income / 12),
    });
  }
  return points;
}
