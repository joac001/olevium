import { test, expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const categoriesFlowEnabled =
  process.env.E2E_CATEGORIES_FLOW === "1" ||
  process.env.E2E_CATEGORIES_FLOW === "true";

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

async function mockCategoryData(page: Page) {
  const now = new Date().toISOString();

  const types = [
    { type_id: 1, name: "Gasto", created_at: now },
    { type_id: 2, name: "Ingreso", created_at: now },
  ];

  const categories = [
    {
      category_id: "cat-e2e-default",
      user_id: null,
      type_id: 1,
      description: "Categoría por defecto E2E",
      color: null,
      created_at: now,
      is_default: true,
      transaction_type: {
        type_id: 1,
        name: "Gasto",
      },
    },
  ];

  await page.route("**/transactions/types", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(types),
    });
  });

  await page.route("**/categories/**", async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === "GET" && url.pathname.endsWith("/categories/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(categories),
      });
      return;
    }

    if (method === "POST" && url.pathname.endsWith("/categories/")) {
      const payload = route.request().postDataJSON() as {
        description: string;
        type_id: number;
        color?: string | null;
      };

      const newCategory = {
        category_id: `cat-e2e-${categories.length + 1}`,
        user_id: "user-e2e",
        type_id: payload.type_id,
        description: payload.description,
        color: payload.color ?? null,
        created_at: now,
        is_default: false,
        transaction_type: types.find((type) => type.type_id === payload.type_id) ?? null,
      };

      categories.push(newCategory);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newCategory),
      });
      return;
    }

    if (method === "PUT" && url.pathname.includes("/categories/")) {
      const parts = url.pathname.split("/");
      const categoryId = parts[parts.length - 1];

      const payload = route.request().postDataJSON() as {
        description: string;
        type_id: number;
        color?: string | null;
        user_id?: string | null;
      };

      const index = categories.findIndex(
        (category) => category.category_id === categoryId,
      );

      if (index === -1) {
        await route.fulfill({ status: 404 });
        return;
      }

      const updated = {
        ...categories[index],
        description: payload.description,
        type_id: payload.type_id,
        color: payload.color ?? null,
        user_id: payload.user_id ?? categories[index].user_id,
        transaction_type: types.find((type) => type.type_id === payload.type_id) ?? null,
      };

      categories[index] = updated;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(updated),
      });
      return;
    }

    if (method === "DELETE" && url.pathname.includes("/categories/")) {
      const parts = url.pathname.split("/");
      const categoryId = parts[parts.length - 1];

      const index = categories.findIndex(
        (category) => category.category_id === categoryId,
      );

      if (index !== -1) {
        categories.splice(index, 1);
      }

      await route.fulfill({
        status: 204,
        contentType: "application/json",
        body: "",
      });
      return;
    }

    await route.continue();
  });
}

async function login(page: Page) {
  await stabilizeSession(page);
  await mockCategoryData(page);

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

    const typeDrop = page
      .locator('label:has-text("Tipo")')
      .locator("xpath=../..")
      .getByRole("button")
      .first();
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

    await expect(updatedRow).toHaveCount(0);
  });
});
