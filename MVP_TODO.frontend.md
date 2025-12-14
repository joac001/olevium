# MVP Frontend Checklist

Este archivo agrupa las tareas del MVP para la app web (Next.js). La idea es ir marcando `[x]` a medida que se completan.

## 1. Cuentas compartidas / amigos

- [ ] **Diseño UX:** Definir cómo se ven las cuentas compartidas en el dashboard (badge, avatar de amigos, etc.).
- [ ] **Selector de visibilidad:** En el formulario de creación/edición de cuenta, agregar campo “Compartida con…” (lista de contactos o emails).
- [ ] **Listado filtrado:** Permitir filtrar cuentas por “Solo mías” / “Compartidas”.
- [ ] **Detalle de cuenta compartida:** Mostrar claramente qué usuarios participan y sus roles (owner / viewer) usando datos que exponga el backend.
- [ ] **Estados vacíos:** Diseñar copy/ilustración cuando todavía no hay cuentas compartidas.

## 2. Tarjeta de crédito

- [ ] **Tipo “Tarjeta” en UI:** Agregar opción de tipo de cuenta “Tarjeta de crédito” en el formulario de cuentas (reutilizando el tipo que venga del backend).
- [ ] **Detalle de tarjeta:** Crear vista que muestre: consumos del período actual, total a pagar, fecha de cierre/vencimiento (si el backend lo expone).
- [ ] **Etiqueta de transacciones de tarjeta:** Marcar visualmente las transacciones que pertenecen a una tarjeta (badge o color específico).
- [ ] **Resumen del mes:** Agregar sección “Resumen tarjeta” en la vista de cuenta con: monto gastado, pagos realizados y saldo.

## 3. Suscripciones

- [ ] **Listado de suscripciones:** Construir una vista “Suscripciones” que consuma las recurrencias del backend y las muestre como suscripciones (nombre, monto, frecuencia, próxima fecha).
- [ ] **Acciones rápidas:** Botones para pausar / reactivar / cancelar una suscripción (cambios sobre la recurrencia).
- [ ] **Indicadores visuales:** Diferenciar suscripciones semanales/mensuales/anuales con iconos o chips.
- [ ] **Integración con transacciones:** Desde el detalle de una suscripción, mostrar las últimas transacciones generadas por esa recurrencia.

## 4. Export CSV

- [x] **Botón de exportar:** En la vista principal de transacciones, agregar botón “Exportar CSV”.
- [ ] **Filtros de exportación:** Respetar los mismos filtros que la tabla (fecha, cuenta, categoría) y enviarlos al endpoint de export.
- [x] **Descarga de archivo:** Implementar descarga real (`Content-Disposition: attachment`) usando el endpoint backend.
- [x] **Feedback de carga:** Mostrar spinner o estado “Generando CSV…” mientras se espera la respuesta.

## 5. Ruedita de configuraciones

- [ ] **Icono de settings:** Agregar rueda de configuraciones en el header (desktop y mobile).
- [ ] **Página de ajustes:** Crear página/modal de “Configuración” con secciones mínimas: Perfil, Preferencias, Integraciones.
- [ ] **Preferencias básicas:** Implementar al menos 2 settings reales que impacten la UI (ej: moneda por defecto, idioma/locale).
- [ ] **Persistencia local:** Guardar algunas preferencias en `localStorage` y/o consumirlas desde el backend cuando exista el endpoint.

## 6. Presupuestos por categoría

- [ ] **Vista de presupuestos:** Agregar sección “Presupuestos” donde se vean categorías con su límite mensual y gasto actual.
- [ ] **Formulario de presupuesto:** Form para crear/editar presupuesto por categoría (monto, mes, moneda).
- [ ] **Indicadores de progreso:** Barra o chip que muestre % utilizado y resalte cuando se supera el límite.
- [ ] **Integración con dashboard:** Mostrar un resumen rápido de “categorías al límite” en el home.

## 7. Feedback in-app (bugs & ideas)

- [x] **Botón/entry point:** Agregar un botón fijo o item de menú “Enviar feedback / Reportar problema”.
- [x] **Modal de feedback:** Form simple con tipo (`Bug`, `Idea`, `Otro`) y textarea para el mensaje.
- [x] **Contexto automático:** Incluir automáticamente `page_path` y algunos metadatos (navegador, idioma) al llamar al backend.
- [x] **Flujo de éxito:** Mostrar mensaje de agradecimiento y limpiar el form cuando el envío fue exitoso.
- [x] **Manejo de errores:** Si el endpoint falla, mostrar un mensaje claro y permitir reintentar.
