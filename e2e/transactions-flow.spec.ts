import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const transactionsFlowEnabled =
  process.env.E2E_TRANSACTIONS_FLOW === "1" ||
  process.env.E2E_TRANSACTIONS_FLOW === "true";

async function stabilizeSession(page: Page) {
  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "e2e-access-token",
        refresh_token: "e2e-refresh-token",
        token_type: "bearer",
        user: {
          id: 1,
          email: email ?? "e2e@example.com",
          name: "E2E User",
        },
      }),
    });
  });
}

async function mockAccountTypes(page: Page) {
  await page.route("**/accounts/types", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          type_id: 1,
          name: "Banco",
          created_at: new Date().toISOString(),
        },
        {
          type_id: 2,
          name: "Billetera virtual",
          created_at: new Date().toISOString(),
        },
      ]),
    });
  });

  await page.route("**/currencies/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          currency_id: 1,
          label: "ARS",
          name: "Peso argentino",
        },
      ]),
    });
  });
}

async function login(page: Page) {
  await stabilizeSession(page);
  await mockAccountTypes(page);

  await page.goto("/auth");

  await page.getByLabel(/correo electrónico/i).fill(email!);
  await page.getByLabel(/contraseña/i).fill(password!);

  await page.getByRole("button", { name: /iniciar sesión/i }).last().click();

  await page.waitForURL((url: URL) => !url.pathname.startsWith("/auth"), {
    timeout: 15000,
  });

  await expect(
    page.getByRole("heading", { name: /resumen financiero/i }),
  ).toBeVisible({ timeout: 15000 });
}

test.describe("Transacciones - filtros y creación desde /transactions", () => {
  test.skip(
    !email || !password || !transactionsFlowEnabled,
    "E2E_USER_EMAIL, E2E_USER_PASSWORD y E2E_TRANSACTIONS_FLOW deben estar definidos para correr este test",
  );

  test("crea una transacción desde /transactions y aplica filtros de búsqueda/categoría", async ({
    page,
  }) => {
    await login(page);

    const now = new Date().toISOString();
    const transactions: Array<Record<string, unknown>> = [];

    await page.route("**/transactions/", async (route) => {
      const method = route.request().method();

      if (method !== "POST") {
        await route.continue();
        return;
      }

      const payload = route.request().postDataJSON() as {
        account_id: string;
        amount: number;
        date: string;
        type_id: number;
        category_id?: string;
        category?: Record<string, unknown> | null;
        description?: string;
      };

      const newTransaction = {
        transaction_id: `tx-e2e-${transactions.length + 1}`,
        user_id: "user-e2e",
        account_id: payload.account_id,
        amount: payload.amount,
        type_id: payload.type_id,
        date: payload.date,
        category_id: payload.category_id ?? null,
        category: payload.category ?? null,
        transaction_type: {
          type_id: payload.type_id,
          name: payload.type_id === 1 ? "Gasto" : "Ingreso",
        },
        type_name: payload.type_id === 1 ? "Gasto" : "Ingreso",
        description: payload.description ?? null,
        created_at: now,
      };

      transactions.push(newTransaction);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newTransaction),
      });
    });

    const accountName = `Cuenta TxPage ${Date.now()}`;
    const txDescription = `Tx desde /transactions ${Date.now()}`;

    await page.goto("/accounts");

    await expect(
      page.getByRole("heading", { name: /tus cuentas/i }),
    ).toBeVisible({ timeout: 15000 });

    const addAccountButton = page.getByRole("button", { name: "+" }).first();
    await expect(addAccountButton).toBeEnabled({ timeout: 15000 });
    await addAccountButton.click();

    await expect(
      page.getByRole("heading", { name: /registrar nueva cuenta/i }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/nombre de la cuenta/i).fill(accountName);

    const currencyDropAccount = page.getByRole("button", {
      name: /selecciona una moneda/i,
    });
    await currencyDropAccount.click();
    await page.getByRole("option").first().click();

    await page.getByLabel(/balance inicial/i).fill("0");

    await page
      .getByRole("button", { name: /registrar cuenta/i })
      .click();

    await expect(
      page.getByRole("link", { name: accountName }),
    ).toBeVisible({ timeout: 20000 });

    await page.goto("/transactions");

    await expect(
      page.getByRole("heading", { name: /transacciones/i }),
    ).toBeVisible({ timeout: 15000 });

    const newTxButton = page.getByRole("button", {
      name: /nueva transacción/i,
    });
    await newTxButton.click();

    await expect(
      page.getByRole("heading", { name: /registrar transacción/i }),
    ).toBeVisible({ timeout: 15000 });

    const accountDrop = page
      .locator('label:has-text("Cuenta")')
      .locator("xpath=../..")
      .getByRole("button")
      .first();
    await accountDrop.click();
    await page.getByRole("option", { name: accountName }).click();

    await page.getByLabel(/^monto$/i).fill("25");

    await page.getByLabel(/fecha/i).fill("2025-01-01");

    await page
      .getByLabel(/descripción/i)
      .fill(txDescription);

    const categoryDrop = page.getByRole("button", {
      name: /elegí una categoría/i,
    });
    await categoryDrop.click();
    await page.getByRole("option").first().click();

    await page
      .getByRole("button", { name: /registrar transacción/i })
      .click();

    await expect(
      page.getByText(/transacción creada/i),
    ).toBeVisible({ timeout: 20000 });

    const allRows = page.getByRole("row");
    const dataRow = allRows.nth(1);
    const descriptionCell = dataRow.getByRole("cell").nth(1);
    const descriptionText = (await descriptionCell.innerText()).trim();

    const searchInput = page.getByLabel(/buscar/i);
    await searchInput.fill(descriptionText);

    await expect(
      page.getByRole("cell", { name: descriptionText }),
    ).toBeVisible({ timeout: 15000 });

    const row = page
      .getByRole("row", { name: new RegExp(descriptionText, "i") })
      .first();
    const categoryCell = row.getByRole("cell").nth(2);
    const categoryText = (await categoryCell.innerText()).trim();

    const categoryFilterDrop = page
      .getByText(/^categoría$/i)
      .locator("xpath=../..")
      .getByRole("button")
      .first();
    await categoryFilterDrop.click();
    await page.getByRole("option", { name: categoryText }).click();

    await expect(
      page.getByRole("cell", { name: descriptionText }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /limpiar filtros/i }).click();

    await expect(searchInput).toHaveValue("");
  });
});
