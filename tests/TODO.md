# Frontend test checklist

## Autenticación
- [x] Login/logout desde la UI (happy path)
  - [x] LoginForm: render básico y submit exitoso
  - [x] Logout desde NavBar/WelcomePanel con feedback visual (NavBar)
  - [x] E2E login básico con Playwright (auth-login.spec)
  - [x] E2E logout desde el panel (WelcomePanel → botón "Cerrar sesión") redirigiendo a `/auth` (`e2e/auth-logout.spec.ts`)
- [x] Manejo de expiración de sesión y tokens inválidos (redirecciones, mensajes)

## Cuentas y transacciones
- [x] Stores de Zustand: actualización correcta de balances y listas (accounts/transactions)
  - [x] applyBalanceDelta actualiza balances en accounts/accountDetails
  - [x] createTransaction agrega a accountTransactions y ajusta balance
  - [x] updateTransaction y deleteTransaction actualizan listas y balances (misma cuenta y cambio de cuenta)
- [x] Formularios de creación/edición de cuentas y transacciones (validaciones, submit exitoso/erróneo)
  - [x] Normalización de CreateAccountForm (accountFormUtils)
  - [x] Normalización de CreateTransactionForm (transactionFormUtils)
  - [x] EditTransactionForm: inicialización con datos existentes, submit exitoso/erróneo
  - [x] DeleteTransactionForm: muestra resumen correcto y elimina el movimiento actualizando callbacks/feedback
- [x] Listados/tablas con filtros por cuenta, rango de fechas y fecha exacta
  - [x] Lógica de signos (toSignedAmount)
  - [x] Render básico de AccountTransactionsTable (vacío y con datos)
  - [x] E2E de /transactions: creación desde "Nueva transacción" + filtros de búsqueda/categoría en `e2e/transactions-flow.spec.ts` condicionado por `E2E_TRANSACTIONS_FLOW`

## Categorías
- [x] Creación/edición/eliminación de categorías desde la UI (incluyendo validaciones de duplicados)
  - [x] Store: createCategory/updateCategory/deleteCategory actualizan listado
  - [x] Flujos E2E básicos de categorías de usuario (crear/editar/eliminar) en `e2e/categories-flow.spec.ts`, condicionado por `E2E_CATEGORIES_FLOW`
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
- [x] Flujo completo: login → crear cuenta → crear transacción → ver reflejo en dashboard/balances
  - [x] Configuración de Playwright (playwright.config.ts, script test:e2e)
  - [x] Test de login básico (auth-login.spec) condicionado por variables E2E_USER_*
  - [x] Flujo cuentas/transacciones completo (login + creación de cuenta + creación de transacción + ver reflejo en dashboard) en `e2e/accounts-flow.spec.ts`, condicionado por `E2E_FULL_FLOW`
- [x] Flujos de error comunes (backend caído, 401, 403, 500) y comportamiento esperado en UI
  - [x] 500 al cargar cuentas desde `/accounts` muestra notificación de error (`e2e/error-flows.spec.ts`)
  - [x] 401 en endpoint protegido redirige al login (`/auth`) (`e2e/error-flows.spec.ts`)
  - [x] 403 al crear transacción muestra error contextual de creación (`e2e/error-flows.spec.ts`)
