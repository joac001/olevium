import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const categoriesFlowEnabled =
  process.env.E2E_CATEGORIES_FLOW === "1" ||
  process.env.E2E_CATEGORIES_FLOW === "true";

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

test.describe("Categorías E2E", () => {
  test.skip(
    !email || !password || !categoriesFlowEnabled,
    "E2E_USER_EMAIL, E2E_USER_PASSWORD y E2E_CATEGORIES_FLOW deben estar definidos para correr este test",
  );

  test("crear, editar y eliminar categoría de usuario", async ({ page }) => {
    await login(page);

    await page.goto("/categories");

    const categoriesHeading = page.getByRole("heading", {
      name: /tus categorías/i,
    });
    await expect(categoriesHeading).toBeVisible({ timeout: 15000 });

    const categoriesHeader = categoriesHeading.locator(
      "xpath=ancestor::header[1]",
    );
    await categoriesHeader.getByRole("button").first().click();

    const categoryName = `Categoría E2E ${Date.now()}`;
    const updatedName = `${categoryName} editada`;

    await page.getByLabel(/descripcion/i).fill(categoryName);

    const typeDrop = page.getByRole("button", { name: /^tipo$/i });
    await typeDrop.click();
    await page.getByRole("option").first().click();

    await page
      .getByRole("button", { name: /crear categoria/i })
      .click();

    await expect(page.getByText(categoryName)).toBeVisible({
      timeout: 20000,
    });

    const categoryRow = page
      .getByText(categoryName)
      .locator(
        'xpath=ancestor::div[contains(@class,"rounded-2xl")][1]',
      );

    await categoryRow.getByRole("button").first().click();

    await page.getByLabel(/descripción/i).fill(updatedName);

    await page
      .getByRole("button", { name: /guardar cambios/i })
      .click();

    await expect(page.getByText(updatedName)).toBeVisible({
      timeout: 20000,
    });

    const updatedRow = page
      .getByText(updatedName)
      .locator(
        'xpath=ancestor::div[contains(@class,"rounded-2xl")][1]',
      );
    await updatedRow.getByRole("button").nth(1).click();

    await page.getByRole("button", { name: /eliminar/i }).click();

    await expect(page.getByText(updatedName)).not.toBeVisible({
      timeout: 20000,
    });
  });
});

