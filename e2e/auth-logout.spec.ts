import { test, expect } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe("Logout E2E", () => {
  test.skip(
    !email || !password,
    "E2E_USER_EMAIL y E2E_USER_PASSWORD deben estar definidos para correr este test",
  );

  test("logout desde el panel redirige a /auth", async ({ page }) => {
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

    await page.getByRole("button", { name: /cerrar sesión/i }).click();

    await expect(page).toHaveURL(/\/auth(?:\/|$)/, { timeout: 15000 });

    await expect(
      page.getByRole("heading", { name: /gestiona tu acceso/i }),
    ).toBeVisible({ timeout: 15000 });
  });
});
