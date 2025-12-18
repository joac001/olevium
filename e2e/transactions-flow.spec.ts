import { test, expect } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const transactionsFlowEnabled =
  process.env.E2E_TRANSACTIONS_FLOW === "1" ||
  process.env.E2E_TRANSACTIONS_FLOW === "true";

async function login(page: any) {
  await page.goto("/auth");

  await page.getByLabel(/correo electrónico/i).fill(email!);
  await page.getByLabel(/contraseña/i).fill(password!);

  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  await page.waitForURL((url: URL) => !url.pathname.startsWith("/auth"), {
    timeout: 15000,
  });

  await expect(
    page.getByText(/panel de inicio/i).first(),
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

    const accountName = `Cuenta TxPage ${Date.now()}`;
    const txDescription = `Tx desde /transactions ${Date.now()}`;

    await page.goto("/accounts");

    await expect(page.getByText(/tus cuentas/i)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: "+" }).first().click();

    await page.getByLabel(/nombre de la cuenta/i).fill(accountName);

    const typeDropAccount = page.getByRole("button", {
      name: /tipo de cuenta/i,
    });
    await typeDropAccount.click();
    await page.getByRole("option").first().click();

    const currencyDropAccount = page.getByRole("button", {
      name: /moneda/i,
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

    const accountDrop = page.getByRole("button", {
      name: /cuenta/i,
    });
    await accountDrop.click();
    await page.getByRole("option", { name: accountName }).click();

    const typeDrop = page.getByRole("button", {
      name: /^tipo$/i,
    });
    await typeDrop.click();
    await page.getByRole("option").first().click();

    await page.getByLabel(/^monto$/i).fill("25");

    await page.getByLabel(/fecha/i).fill("01012025");

    const categoryModeNew = page.getByRole("button", {
      name: /nueva/i,
    });
    await categoryModeNew.click();

    await page
      .getByLabel(/descripción/i)
      .fill("Categoría TxPage");

    await page
      .getByRole("button", { name: /registrar transacción/i })
      .click();

    await expect(
      page.getByText(/transacción creada/i),
    ).toBeVisible({ timeout: 20000 });

    await expect(
      page.getByRole("cell", { name: txDescription }).first(),
    ).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByLabel(/buscar/i);
    await searchInput.fill(txDescription);

    await expect(
      page.getByRole("cell", { name: txDescription }),
    ).toBeVisible({ timeout: 15000 });

    const row = page
      .getByRole("row", { name: new RegExp(txDescription, "i") })
      .first();
    const categoryCell = row.getByRole("cell").nth(2);
    const categoryText = await categoryCell.innerText();

    const categoryDrop = page.getByRole("button", {
      name: /categoría/i,
    });
    await categoryDrop.click();
    await page.getByRole("option", { name: categoryText }).click();

    await expect(
      page.getByRole("cell", { name: txDescription }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /limpiar filtros/i }).click();

    await expect(searchInput).toHaveValue("");
  });
});

