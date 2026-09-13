# P01 — reglas-productos

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Validar modelos y calcular snaps como funciones puras.

Dependencias: 00. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/domain/product-rules.ts`
- `src/server/domain/snaps.ts`
- `tests/server/product-rules.test.ts`
- `tests/server/snaps.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/validation-matrix.md`

## Secuencia e interfaces propuestas

1. Implementar validateOrderItem(input: unknown): ValidationResult<OrderItemInput>, usando el esquema compartido.
2. Implementar suggestSnaps(input: SnapsInput): string | null. Implementar normalizeOrderItem(input: OrderItemInput): NormalizedOrderItem; eliminar campos no aplicables.
4. Cubrir todas las ramas por producto, Other que coincide con un tipo y manual frente a auto.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

100 pulgadas al 100%: 53, 27 / 27, Crazy 54, 28 / 28; 70.5 al 80%: 35,17 / 17,36,18 / 18. Rechazar cantidad fraccional, dimensiones no positivas y números no finitos. No redondear Crazy al par más cercano.

Trazabilidad: F-08,F-09,F-10; T-06,T-07,T-08,T-09.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P01-[A/B/C o único].
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


