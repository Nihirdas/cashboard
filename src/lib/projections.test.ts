import { describe, it, expect } from "vitest";
import {
  parseProjectionQuery,
  project,
  projectionResult,
  PROJECTION_DEFAULTS,
  type ProjectionInput,
} from "@/lib/projections";

const base: ProjectionInput = {
  startingValue: 10_000,
  monthlyContribution: 0,
  annualReturnPct: 12,
  years: 1,
  startYear: 2000,
};

describe("project", () => {
  it("returns one point per year plus year zero", () => {
    expect(project({ ...base, years: 20 })).toHaveLength(21);
    expect(project({ ...base, years: 1 })).toHaveLength(2);
  });

  it("labels years running from startYear", () => {
    const years = project({ ...base, years: 4, startYear: 2030 }).map((p) => p.year);
    expect(years).toEqual([2030, 2031, 2032, 2033, 2034]);
  });

  it("year zero is the starting value", () => {
    expect(project(base)[0]).toEqual({ year: 2000, total: 10_000, contributed: 10_000 });
  });

  it("compounds monthly (golden value: 10k at 12%/yr for 1 year = 10k * 1.01^12)", () => {
    const pts = project(base);
    expect(pts[1].total).toBe(11_268);
    expect(pts[1].contributed).toBe(10_000);
  });

  it("with 0% return, total always equals what was put in", () => {
    const pts = project({
      startingValue: 5_000,
      monthlyContribution: 100,
      annualReturnPct: 0,
      years: 10,
      startYear: 2020,
    });
    for (const p of pts) expect(p.total).toBe(p.contributed);
    expect(pts.at(-1)!.total).toBe(5_000 + 100 * 120);
  });

  it("with no contributions, contributed stays flat while growth accrues", () => {
    const pts = project({ ...base, annualReturnPct: 6, years: 10 });
    expect(pts.every((p) => p.contributed === 10_000)).toBe(true);
    expect(pts.at(-1)!.total).toBeGreaterThan(10_000);
  });

  it("is monotonic and integer-rounded when return and contribution are non-negative", () => {
    const pts = project({
      startingValue: 1_000,
      monthlyContribution: 250,
      annualReturnPct: 7,
      years: 30,
      startYear: 2025,
    });
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].total).toBeGreaterThanOrEqual(pts[i - 1].total);
      expect(pts[i].total - pts[i].contributed).toBeGreaterThanOrEqual(0);
    }
    for (const p of pts) {
      expect(Number.isInteger(p.total)).toBe(true);
      expect(Number.isInteger(p.contributed)).toBe(true);
    }
  });

  it("handles a negative return — money can shrink below contributions", () => {
    const pts = project({ ...base, annualReturnPct: -12 });
    expect(pts[1].total).toBeLessThan(pts[1].contributed);
    expect(Number.isFinite(pts[1].total)).toBe(true);
  });

  it("stays finite over a long horizon", () => {
    const pts = project({ startingValue: 1_000, monthlyContribution: 100, annualReturnPct: 8, years: 100, startYear: 2000 });
    expect(Number.isFinite(pts.at(-1)!.total)).toBe(true);
  });
});

describe("parseProjectionQuery", () => {
  const q = (s: string) => new URLSearchParams(s);

  it("applies defaults for an empty query", () => {
    const r = parseProjectionQuery(q(""));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.input.startingValue).toBe(PROJECTION_DEFAULTS.start);
      expect(r.input.monthlyContribution).toBe(PROJECTION_DEFAULTS.monthly);
      expect(r.input.annualReturnPct).toBe(PROJECTION_DEFAULTS.return);
      expect(r.input.years).toBe(PROJECTION_DEFAULTS.years);
      expect(r.input.startYear).toBe(new Date().getFullYear());
    }
  });

  it("parses a full valid query", () => {
    expect(parseProjectionQuery(q("start=25000&monthly=500&return=6.5&years=25&startYear=2026"))).toEqual({
      ok: true,
      input: {
        startingValue: 25_000,
        monthlyContribution: 500,
        annualReturnPct: 6.5,
        years: 25,
        startYear: 2026,
      },
    });
  });

  it("treats blank params as absent", () => {
    const r = parseProjectionQuery(q("start=&years="));
    expect(r.ok && r.input.startingValue).toBe(PROJECTION_DEFAULTS.start);
  });

  it("rejects a non-numeric value", () => {
    expect(parseProjectionQuery(q("return=abc"))).toEqual({
      ok: false,
      error: '"return" must be a number',
    });
  });

  it("rejects a fractional year count", () => {
    const r = parseProjectionQuery(q("years=1.5"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("whole number");
  });

  it.each([
    ["years=0", "years"],
    ["years=101", "years"],
    ["return=-200", "return"],
    ["return=200", "return"],
    ["start=-1", "start"],
  ])("rejects out-of-range %s", (query, field) => {
    const r = parseProjectionQuery(q(query));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(field);
  });

  it.each(["years=1", "years=100", "return=-100", "return=100", "monthly=0"])(
    "accepts boundary %s",
    (query) => {
      expect(parseProjectionQuery(q(query)).ok).toBe(true);
    },
  );
});

describe("projectionResult", () => {
  it("summarises the final point", () => {
    const r = projectionResult({
      startingValue: 10_000,
      monthlyContribution: 200,
      annualReturnPct: 5,
      years: 15,
      startYear: 2026,
    });
    const last = r.points.at(-1)!;
    expect(r.summary.total).toBe(last.total);
    expect(r.summary.contributed).toBe(last.contributed);
    expect(r.summary.growth).toBe(last.total - last.contributed);
    expect(r.summary.finalYear).toBe(2026 + 15);
  });
});
