import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const errorFlowsEnabled =
  process.env.E2E_ERROR_FLOWS === "1" ||
  process.env.E2E_ERROR_FLOWS === "true";

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

test.describe("Flujos de error comunes", () => {
  test.skip(
    !email || !password || !errorFlowsEnabled,
    "E2E_USER_EMAIL, E2E_USER_PASSWORD y E2E_ERROR_FLOWS deben estar definidos para correr estos tests",
  );

  test("500 al cargar cuentas muestra notificación de error", async ({
    page,
  }) => {
    await stabilizeSession(page);
    await login(page);

    await page.route("**/accounts/", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Error interno en cuentas" }),
      });
    });

    await page.goto("/accounts");

    await expect(
      page.getByText(/no se pudo cargar las cuentas/i),
    ).toBeVisible({ timeout: 15000 });
  });

  test("401 en endpoint protegido redirige al login", async ({ page }) => {
    await login(page);

    await page.route("**/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Refresh token inválido" }),
      });
    });

    await page.route("**/accounts/", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Sesión expirada" }),
      });
    });

    await page.goto("/accounts");

    await expect(page).toHaveURL(/\/auth(?:\/|$)/, { timeout: 15000 });
  });

  test("403 al crear transacción muestra error de creación", async ({
    page,
  }) => {
    await stabilizeSession(page);
    await login(page);

    await page.goto("/accounts");

    const accountsHeading = page.getByRole("heading", {
      name: /tus cuentas/i,
    });
    await expect(accountsHeading).toBeVisible({ timeout: 15000 });

    const accountName = `Cuenta Error E2E ${Date.now()}`;

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

    await page.getByLabel(/balance inicial/i).fill("100");

    await page.getByRole("button", { name: /registrar cuenta/i }).click();

    await expect(
      page.getByRole("link", { name: accountName }),
    ).toBeVisible({ timeout: 20000 });

    await page.route("**/transactions/", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ detail: "No tienes permiso para crear transacciones" }),
      });
    });

    await page.getByRole("link", { name: accountName }).click();

    const transactionsHeading = page.getByRole("heading", {
      name: /transacciones/i,
    });
    await expect(transactionsHeading).toBeVisible({ timeout: 15000 });

    const transactionsHeader = transactionsHeading.locator(
      "xpath=ancestor::header[1]",
    );
    await transactionsHeader.getByRole("button").first().click();

    await page.getByLabel(/^monto$/i).fill("50");

    await page.getByLabel(/^fecha$/i).fill("01012025");

    const categoryDrop = page
      .locator('label:has-text("Categoría")')
      .locator("xpath=../..")
      .getByRole("button")
      .first();
    await categoryDrop.click();
    await page.getByRole("option").first().click();

    await page
      .getByLabel(/descripción del movimiento/i)
      .fill("Transacción bloqueada por permisos");

    await page
      .getByLabel(/nombre de la nueva categoría/i)
      .fill("Categoría bloqueada E2E");

    await page
      .getByLabel(/descripción de la nueva categoría/i)
      .fill("Descripción bloqueada E2E");

    await page
      .getByRole("button", { name: /agregar transacción/i })
      .click();

    await expect(
      page.getByText(/no se pudo crear la transacción/i),
    ).toBeVisible({ timeout: 15000 });
  });
});
