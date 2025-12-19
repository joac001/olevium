import { describe, expect, it } from "vitest";
import {
  formatAccountName,
  formatCurrency,
  formatDate,
  formatDateWithTime,
  formatSignedCurrency,
} from "@/lib/format";

describe("formatCurrency", () => {
  it("formats positive values in ARS by default", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("$");
  });

  it("handles zero and falsy values as 0", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatSignedCurrency", () => {
  it("prefixes positive values with +", () => {
    const result = formatSignedCurrency(100);
    expect(result.startsWith("+")).toBe(true);
  });

  it("prefixes negative values with - and uses absolute value", () => {
    const result = formatSignedCurrency(-100);
    expect(result.startsWith("-")).toBe(true);
  });
});

describe("formatDate", () => {
  it("returns the original value when the date is invalid", () => {
    const input = "invalid-date";
    const result = formatDate(input);
    expect(result).toBe(input);
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-01-15T12:00:00.000Z");
    expect(result).toBeTypeOf("string");
  });
});

describe("formatDateWithTime", () => {
  it("returns the original value when the date is invalid", () => {
    const input = "invalid-date";
    const result = formatDateWithTime(input);
    expect(result).toBe(input);
  });
});

describe("formatAccountName", () => {
  it("includes currency symbol when name is empty", () => {
    const result = formatAccountName("   ", "ars");
    expect(result).toBe("(ARS)");
  });

  it("combines trimmed name and uppercased currency", () => {
    const result = formatAccountName("  Caja de ahorro  ", "usd");
    expect(result).toBe("Caja de ahorro (USD)");
  });
});
