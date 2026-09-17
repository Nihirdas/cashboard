import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  formatPercent,
  formatSigned,
} from "@/lib/format";

const MINUS = "−"; // U+2212 — the sign the app uses, not an ASCII hyphen

describe("formatCurrency", () => {
  it("formats EUR with no decimals by default", () => {
    expect(formatCurrency(1_000)).toBe("€1,000");
    expect(formatCurrency(1_234.56)).toBe("€1,235");
  });
  it("honours a decimal count", () => {
    expect(formatCurrency(1_234.5, "EUR", 2)).toBe("€1,234.50");
  });
  it("accepts other currencies", () => {
    expect(formatCurrency(1_000, "USD")).toContain("1,000");
  });
});

describe("formatSigned", () => {
  it("prefixes a plus for positive amounts", () => {
    expect(formatSigned(1_200)).toBe("+€1,200");
  });
  it("uses a real minus sign (U+2212) for negative amounts", () => {
    expect(formatSigned(-42)).toBe(`${MINUS}€42`);
    expect(formatSigned(-42).codePointAt(0)).toBe(0x2212);
  });
  it("shows no sign for zero", () => {
    expect(formatSigned(0)).toBe("€0");
  });
});

describe("formatPercent", () => {
  it("scales a fraction to a signed percentage", () => {
    expect(formatPercent(0.1234)).toBe("+12.3%");
    expect(formatPercent(-0.05)).toBe(`${MINUS}5.0%`);
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("date formatting", () => {
  it("formats a date as 'DD Mon YYYY'", () => {
    expect(formatDate("2026-06-15")).toMatch(/^\d{2} \w{3} \d{4}$/);
  });
  it("formats a month as 'Mon YY'", () => {
    expect(formatMonth("2026-06-15")).toMatch(/^\w{3} \d{2}$/);
  });
});
