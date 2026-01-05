import { describe, expect, it, vi, beforeEach } from "vitest";
import { getRecurringTransactions } from "@/features/recurring-transactions/queries";
import { apiRequest } from "@/lib/http";

vi.mock("@/lib/http", () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = apiRequest as unknown as vi.Mock;

describe("getRecurringTransactions", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("normaliza correctamente los datos cuando la respuesta es OK", async () => {
    apiRequestMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          recurring_transaction_id: "rt-1",
          user_id: "user-1",
          account_id: "acc-1",
          category_id: "cat-1",
          type_id: 2,
          amount: "150",
          description: "Test",
          frequency: "WEEKLY",
          interval: "2",
          weekday: "3",
          day_of_month: null,
          start_date: "2024-01-01",
          end_date: null,
          next_run_date: null,
          last_run_date: null,
          require_confirmation: false,
          is_active: false,
        },
      ],
    });

    const result = await getRecurringTransactions();

    expect(apiRequestMock).toHaveBeenCalledWith("/recurring-transactions/");
    expect(result.isMock).toBe(false);
    expect(result.data).toHaveLength(1);

    const item = result.data[0];
    expect(item.recurring_transaction_id).toBe("rt-1");
    expect(item.frequency).toBe("weekly");
    expect(item.interval).toBe(2);
    expect(item.weekday).toBe(3);
    expect(item.day_of_month).toBeNull();
    expect(item.require_confirmation).toBe(false);
    expect(item.is_active).toBe(false);
  });

  it("devuelve isMock=true y data vacía cuando hay error en la respuesta", async () => {
    apiRequestMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    });

    const result = await getRecurringTransactions();

    expect(result.isMock).toBe(true);
    expect(result.data).toEqual([]);
  });
});

