# P07 — pedidos-consultas

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Crear pedido idempotente y consultar recursos propios.

Dependencias: 01,02,05,06. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/orders/create.ts`
- `src/server/orders/queries.ts`
- `src/app/api/v1/orders/route.ts`
- `src/app/api/v1/orders/[id]/route.ts`
- `src/app/api/v1/dashboard/route.ts`
- `tests/server/orders.test.ts`
- `tests/server/order-queries.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../requirements/order-state-machine.md`

## Secuencia e interfaces propuestas

1. Subpaso A: createOrder(actor,input: CreateOrderInput,key: string): Promise<ClientOrderDTO> en transacción con adjuntos, borrador y outbox.
2. Subpaso B: listOrders(actor,query): Promise<CursorPage<ClientOrderDTO>>, getOrder(actor,id) y getDashboard(actor).
3. Buscar número/sidemark; ordenar fecha DESC + id, cursor estable; Completed solo según decisión registrada.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Misma key/mismo cuerpo devuelve mismo pedido; diferente cuerpo 409; fallo intermedio no deja pedido parcial; draft stale 409; adjunto ajeno falla; cinco filtros correctos; datos otra organización nunca retornan.

Trazabilidad: F-06,F-07,F-13,F-14; T-12,T-13,T-14.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P07-[A/B/C o único].
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

