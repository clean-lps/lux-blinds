# P08 — operaciones-admin

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Añadir mutaciones administrativas auditadas.

Dependencias: 02,07; grafo y política comercial fijados en 00. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/admin/orders.ts`
- `src/server/admin/customers.ts`
- `src/server/admin/quotes.ts`
- `src/app/api/v1/admin/orders/[id]/route.ts`
- `src/app/api/v1/admin/orders/[id]/status/route.ts`
- `src/app/api/v1/admin/orders/[id]/notes/route.ts`
- `src/app/api/v1/admin/orders/[id]/audit/route.ts`
- `src/app/api/v1/admin/orders/[id]/quotes/route.ts`
- `src/app/api/v1/admin/quotes/[id]/publish/route.ts`
- `src/app/api/v1/admin/customers/route.ts`
- `src/app/api/v1/admin/customers/[id]/route.ts`
- `src/app/api/v1/admin/customers/[id]/tax-review/route.ts`
- `tests/server/admin-orders.test.ts`
- `tests/server/admin-customers.test.ts`
- `tests/server/quotes.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/roles-permissions.md`
- Ruta desde docs/execution: `../requirements/order-state-machine.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`

## Secuencia e interfaces propuestas

1. Ejecutar A solo: listCustomers/getCustomer/reviewTax con DTO por permisos y expectedVersion.
2. Después de A integrado, B: correctOrder/changeOrderStatus/addInternalNote/listAudit; motivo y versión, evento/outbox atómicos.
3. Después de B integrado, C: createQuote/publishQuote; amountMinor entero, moneda explícita, draft/published/superseded sin pago automático.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Cliente no muta; operador no revisa tax; transición ilegal o stale falla; cancelación sin motivo falla; cliente nunca recibe notas/audit; quote draft no visible; publicar conserva historia y no cambia a producción automáticamente.

Trazabilidad: F-18,F-19; T-14,T-15.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P08-[A/B/C o único].
- Commit base: PENDIENTE.
- Rama/worktree aislado: PENDIENTE.
- Contratos/imports exactos y ejemplos JSON: PENDIENTE.
- Esquema/migración aplicada y fixtures concretos: PENDIENTE.
- Decisiones de negocio/seguridad aplicables cerradas: PENDIENTE.
- Para UI: rutas de targets sanitizados, viewport y estados: PENDIENTE.
- Comando focalizado copiado del runtime-manifest y ejecutado en base: PENDIENTE.
- Comandos verificados de tipos/build: PENDIENTE.
- Resultado base y prueba de salida esperada: PENDIENTE.

No inventar npm scripts ni afirmar que estas pruebas ya existen. READY exige todos los campos aplicables completos y revisión del coordinador conforme packet-readiness.md. Un campo PENDIENTE mantiene el paquete bloqueado; el worker devuelve faltantes específicos y no improvisa el contrato.

## Entrega del worker

Indicar ID/subpaso, commit base/final, archivos cambiados, comandos y resultados reales, pruebas adversas, capturas sintéticas cuando aplique, desviaciones y pendientes. No declarar producción lista. Si falla una dependencia o requiere archivos ajenos, reportar al coordinador y continuar solo pruebas/lecturas independientes dentro del alcance.

