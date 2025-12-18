import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const fullFlowEnabled =
  process.env.E2E_FULL_FLOW === "1" || process.env.E2E_FULL_FLOW === "true";

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

test.describe("Flujo completo cuentas y transacciones", () => {
  test.skip(
    !email || !password || !fullFlowEnabled,
    "E2E_USER_EMAIL, E2E_USER_PASSWORD y E2E_FULL_FLOW deben estar definidos para correr este test",
  );

  test("login → crear cuenta → crear transacción → ver reflejo", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/accounts");

    await expect(page.getByText(/tus cuentas/i)).toBeVisible({
      timeout: 15000,
    });

    const accountName = `Cuenta E2E ${Date.now()}`;

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

    await page.getByLabel(/balance inicial/i).fill("123.45");

    await page.getByRole("button", { name: /registrar cuenta/i }).click();

    await expect(
      page.getByRole("link", { name: accountName }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole("link", { name: accountName }).click();

    await expect(
      page.getByRole("heading", { name: accountName }),
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
      .fill(description);

    await page
      .getByRole("button", { name: /agregar transacción/i })
      .click();

    await expect(page.getByText(description)).toBeVisible({
      timeout: 20000,
    });

    await page.goto("/");

    await expect(page.getByText(description)).toBeVisible({
      timeout: 20000,
    });
  });
});
