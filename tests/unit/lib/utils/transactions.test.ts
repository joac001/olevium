import { describe, expect, it } from "vitest";
import { toSignedAmount } from "@/lib/utils/transactions";

describe("toSignedAmount", () => {
  it("retorna monto negativo para gastos (typeId = 1)", () => {
    expect(toSignedAmount(100, 1)).toBe(-100);
  });

  it("retorna monto positivo para ingresos (typeId = 2)", () => {
    expect(toSignedAmount(100, 2)).toBe(100);
  });

  it("mantiene signo positivo para otros tipos", () => {
    expect(toSignedAmount(50, 999)).toBe(50);
  });
});

