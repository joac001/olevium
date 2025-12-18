import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const errorFlowsEnabled =
  process.env.E2E_ERROR_FLOWS === "1" ||
  process.env.E2E_ERROR_FLOWS === "true";

async function login(page: Page) {
  await page.goto("/auth");

  await page.getByLabel(/correo electrónico/i).fill(email!);
  await page.getByLabel(/contraseña/i).fill(password!);

  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 15000,
  });

  await expect(
    page.getByText(/panel de inicio/i).first(),
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
    await login(page);

    await page.goto("/accounts");

    await expect(page.getByText(/tus cuentas/i)).toBeVisible({
      timeout: 15000,
    });

    const accountName = `Cuenta Error E2E ${Date.now()}`;

    await page.getByRole("button", { name: "+" }).first().click();

    await page.getByLabel(/nombre de la cuenta/i).fill(accountName);

    const typeDrop = page.getByRole("button", {
      name: /tipo de cuenta/i,
    });
    await typeDrop.click();
    await page.getByRole("option").first().click();

    const currencyDrop = page.getByRole("button", {
      name: /moneda/i,
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

    const typeTxDrop = page.getByRole("button", {
      name: /tipo de transacción/i,
    });
    await typeTxDrop.click();
    await page.getByRole("option").first().click();

    const categoryDrop = page.getByRole("button", {
      name: /categoría/i,
    });
    await categoryDrop.click();
    await page.getByRole("option").first().click();

    await page
      .getByLabel(/descripción del movimiento/i)
      .fill("Transacción bloqueada por permisos");

    await page
      .getByRole("button", { name: /agregar transacción/i })
      .click();

    await expect(
      page.getByText(/no se pudo crear la transacción/i),
    ).toBeVisible({ timeout: 15000 });
  });
});

