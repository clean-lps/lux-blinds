# Worker 3 — administración

Leer shared-contract.md, roles-permissions.md, order-state-machine.md, assumptions.md, API y V-18 aprobado. Todo admin es inferido hasta evidencia adicional. Rama propuesta worker/admin.

Propiedad exclusiva: src/app/(admin)/**, src/components/admin/**, tests/admin/**. Prohibido API/server/prisma/client/auth/contracts/raíz/lock/docs. Interfaces: API v1, AdminOrderDTO y permisos comunes; no autorizar solo mediante UI.

| ID | Objetivo/dependencia | Aceptación y pruebas | Referencia/riesgo/resultado |
|---|---|---|---|
| A-01 | Clientes/lista/búsqueda/filtro; P-03 | Navegación teclado, empty/error/loading, paginación, filtro por estado y cliente, enlaces detalle válidos | V-18; listado inferido; entregar rutas responsive |
| A-02 | Detalle/items/files/notes; A-01 | Medidas/procedencia snaps legibles, descargas vía endpoint privado, notas internas identificadas; error y reintento preservan edición | E-05/E-09 + V-18; filtración datos; entregar panel detalle |
| A-03 | Estados/correcciones/quote/audit; A-02 | expectedVersion, conflicto 409 muestra recarga, cancelación exige motivo, quote no inventa impuestos, timeline accesible | A-002/A-003; reglas negocio pendientes; entregar acciones auditables |

Comparar escritorio/móvil con target seleccionado, no inventar un dashboard diferente por sección. Probar UI de operador/admin/cliente-denegado con fixtures; principal verificará autorización real. Entrega estructurada según contrato.
