# P09 — notificaciones-outbox

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Entregar eventos internos y notificaciones sin envíos reales en QA.

Dependencias: 02,07,08; proveedor simulado fijado en 00. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/notifications/service.ts`
- `src/server/outbox/worker.ts`
- `src/server/outbox/providers.ts`
- `src/app/api/v1/notifications/route.ts`
- `src/app/api/v1/notifications/[id]/route.ts`
- `src/app/api/v1/notifications/read-all/route.ts`
- `src/app/api/v1/notifications/clear-read/route.ts`
- `src/app/api/v1/webhooks/sms/route.ts`
- `tests/server/notifications.test.ts`
- `tests/server/outbox.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/security.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../qa/test-matrix.md`

## Secuencia e interfaces propuestas

1. A: listNotifications/markRead/readAll/clearRead con beforeTimestamp y owner.
2. B separado: processOutboxBatch(now): Promise<BatchResult>; deduplicación, backoff y proveedor mock por defecto.
3. C separado: webhook SMS firmado y STOP idempotente; activación real excluida.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Abrir panel no marca lectura; clear conserva no leídas; evento duplicado no duplica envío; caída proveedor reprograma sin perder; firma inválida rechazada, STOP revoca consentimiento; no logs con destinos/tokens.

Trazabilidad: F-17 y entrega de eventos; T-16,T-17.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P09-[A/B/C o único].
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

