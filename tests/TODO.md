# Frontend test checklist

## Autenticación
- [ ] Login/logout desde la UI (happy path)
  - [x] LoginForm: render básico y submit exitoso
  - [x] Logout desde NavBar/WelcomePanel con feedback visual (NavBar)
- [ ] Manejo de expiración de sesión y tokens inválidos (redirecciones, mensajes)

## Cuentas y transacciones
- [ ] Stores de Zustand: actualización correcta de balances y listas (accounts/transactions)
- [ ] Formularios de creación/edición de cuentas y transacciones (validaciones, submit exitoso/erróneo)
- [ ] Listados/tablas con filtros por cuenta, rango de fechas y fecha exacta

## Categorías
- [ ] Creación/edición/eliminación de categorías desde la UI (incluyendo validaciones de duplicados)
- [ ] Refresco correcto de listados y uso de categorías en formularios de transacciones

## Recurring transactions
- [ ] Crear/listar/eliminar recurrencias desde la UI
- [ ] Visualización correcta de occurrences pendientes/confirmadas

## Integración con backend
- [ ] React Query: queries/mutations llaman a los endpoints correctos y manejan estados loading/error/success
- [ ] Manejo de errores HTTP y mensajes de feedback al usuario (toast, banners, etc.)

## E2E (Playwright/Cypress)
- [ ] Flujo completo: login → crear cuenta → crear transacción → ver reflejo en dashboard/balances
- [ ] Flujos de error comunes (backend caído, 401, 403, 500) y comportamiento esperado en UI
