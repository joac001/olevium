import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const fullFlowEnabled =
  process.env.E2E_FULL_FLOW === "1" || process.env.E2E_FULL_FLOW === "true";

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

  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 15000,
  });

  await expect(
    page.getByRole("heading", { name: /resumen financiero/i }),
  ).toBeVisible({ timeout: 15000 });
}

test.describe("Flujo completo cuentas y transacciones", () => {
  test.skip(
    !email || !password || !fullFlowEnabled,
    "E2E_USER_EMAIL, E2E_USER_PASSWORD y E2E_FULL_FLOW deben estar definidos para correr este test",
  );

  test("login → crear cuenta → crear transacción → ver reflejo", async ({
    page,
  }) => {
    await login(page);

    const now = new Date().toISOString();
    const accounts: Array<Record<string, unknown>> = [];
    const transactions: Array<Record<string, unknown>> = [];

    await page.route("**/accounts/", async (route) => {
      const method = route.request().method();

      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(accounts),
        });
        return;
      }

      if (method === "POST") {
        const payload = route.request().postDataJSON() as {
          name: string;
          type_id: number;
          currency_id: number;
          balance: number;
        };

        const newAccount = {
          account_id: `acc-e2e-${accounts.length + 1}`,
          name: payload.name,
          type_id: payload.type_id,
          currency_id: payload.currency_id,
          currency: {
            currency_id: payload.currency_id,
            label: "ARS",
            name: "Peso argentino",
          },
          balance: payload.balance,
          created_at: now,
          deleted: false,
          description: null,
        };

        accounts.push(newAccount);

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(newAccount),
        });
        return;
      }

      await route.continue();
    });

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
        category: null,
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

    await page.goto("/accounts");

    await expect(
      page.getByRole("heading", { name: /tus cuentas/i }),
    ).toBeVisible({ timeout: 15000 });

    const accountName = `Cuenta E2E ${Date.now()}`;

    const addAccountButton = page.getByRole("button", { name: "+" }).first();
    await expect(addAccountButton).toBeEnabled({ timeout: 15000 });
    await addAccountButton.click();

    await expect(
      page.getByRole("heading", { name: /registrar nueva cuenta/i }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel(/nombre de la cuenta/i).fill(accountName);

    const currencyDrop = page.getByRole("button", {
      name: /selecciona una moneda/i,
    });
    await currencyDrop.click();
    await page.getByRole("option").first().click();

    await page.getByLabel(/balance inicial/i).fill("123.45");

    await page.getByRole("button", { name: /registrar cuenta/i }).click();

    const targetAccountLink = page
      .getByRole("link")
      .filter({ hasText: /.+/ })
      .first();
    const targetAccountName = await targetAccountLink
      .getByRole("heading")
      .first()
      .innerText();

    await targetAccountLink.click();

    await expect(
      page.getByRole("heading", { name: targetAccountName }),
    ).toBeVisible({ timeout: 20000 });

    const transactionsHeading = page.getByRole("heading", {
      name: /transacciones/i,
    });
    await expect(transactionsHeading).toBeVisible({ timeout: 15000 });

    const transactionsHeader = transactionsHeading.locator(
      "xpath=ancestor::header[1]",
    );
    await transactionsHeader.getByRole("button").first().click();

    const description = `Transacción E2E ${Date.now()}`;

    await page.getByLabel(/^monto$/i).fill("50");

    await page.getByLabel(/^fecha$/i).fill("01012025");

    await page
      .getByLabel(/descripción del movimiento/i)
      .fill(description);

    await page
      .getByRole("button", { name: /agregar transacción/i })
      .click();
  });
});
