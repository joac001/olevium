# Frontend test checklist

## Autenticación
- [ ] Login/logout desde la UI (happy path)
  - [x] LoginForm: render básico y submit exitoso
  - [x] Logout desde NavBar/WelcomePanel con feedback visual (NavBar)
  - [x] E2E login básico con Playwright (auth-login.spec)
- [x] Manejo de expiración de sesión y tokens inválidos (redirecciones, mensajes)

## Cuentas y transacciones
- [x] Stores de Zustand: actualización correcta de balances y listas (accounts/transactions)
  - [x] applyBalanceDelta actualiza balances en accounts/accountDetails
  - [x] createTransaction agrega a accountTransactions y ajusta balance
- [x] Formularios de creación/edición de cuentas y transacciones (validaciones, submit exitoso/erróneo)
  - [x] Normalización de CreateAccountForm (accountFormUtils)
  - [x] Normalización de CreateTransactionForm (transactionFormUtils)
- [x] Listados/tablas con filtros por cuenta, rango de fechas y fecha exacta
  - [x] Lógica de signos (toSignedAmount)
  - [x] Render básico de AccountTransactionsTable (vacío y con datos)

## Categorías
- [x] Creación/edición/eliminación de categorías desde la UI (incluyendo validaciones de duplicados)
  - [x] Store: createCategory/updateCategory/deleteCategory actualizan listado
- [x] Refresco correcto de listados y uso de categorías en formularios de transacciones
  - [x] Normalización de payload de transacciones con categorías (transactionFormUtils)

## Recurring transactions
- [x] Crear/listar/eliminar recurrencias desde la UI
  - [x] Normalización de listados (getRecurringTransactions)
  - [x] Mutaciones HTTP (create/update/delete) con manejo de errores
- [ ] Visualización correcta de occurrences pendientes/confirmadas

## Integración con backend
- [x] React Query: queries/mutations llaman a los endpoints correctos y manejan estados loading/error/success
- [x] Manejo de errores HTTP y mensajes de feedback al usuario (toast, banners, etc.)
  - [x] ErrorProcessor: mapeo de códigos HTTP, mensajes de backend y contextos
  - [x] Hooks de error: useErrorHandler, useFormErrorHandler, useAuthErrorHandler integrados con NotificationContext

## E2E (Playwright/Cypress)
- [ ] Flujo completo: login → crear cuenta → crear transacción → ver reflejo en dashboard/balances
  - [x] Configuración de Playwright (playwright.config.ts, script test:e2e)
  - [x] Test de login básico (auth-login.spec) condicionado por variables E2E_USER_*
- [ ] Flujos de error comunes (backend caído, 401, 403, 500) y comportamiento esperado en UI
