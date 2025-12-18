import { test, expect } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe("Auth E2E", () => {
  test.skip(
    !email || !password,
    "E2E_USER_EMAIL y E2E_USER_PASSWORD deben estar definidos para correr este test",
  );

  test("login exitoso redirige al dashboard", async ({ page }) => {
    await page.goto("/auth");

    await page.getByLabel(/correo electrónico/i).fill(email!);
    await page.getByLabel(/contraseña/i).fill(password!);

    await page.getByRole("button", { name: /iniciar sesión/i }).last().click();

    // Esperar a que dejemos la pantalla de auth
    await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
      timeout: 15000,
    });

    // Validar que aparece algo característico del dashboard
    await expect(
      page.getByRole("heading", { name: /resumen financiero/i }),
    ).toBeVisible({ timeout: 15000 });
  });
});
