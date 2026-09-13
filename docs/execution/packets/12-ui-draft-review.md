# P12 — ui-draft-review

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Conectar constructor a autoguardado, fotos y envío.

Dependencias: 05,06,07,11. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(client)/new-order/page.tsx`
- `src/components/client/order-editor-state.ts`
- `src/components/client/draft-sync.ts`
- `src/components/client/draft-status.tsx`
- `src/components/client/order-uploads.tsx`
- `src/components/client/order-review.tsx`
- `src/components/client/order-api.ts`
- `tests/client/draft-sync.test.ts`
- `tests/client/order-review.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../architecture/file-storage.md`

## Secuencia e interfaces propuestas

1. A: autosave 1200 ms, local por usuario, offline/pending/saved/error y conflicto 409 con comparación; nunca elegir latest por timestamp sin revisión.
2. B tras A: cargas privadas, progreso/cancel/retry y aviso de reselección tras restore.
3. C tras B: modal revisión accesible y submit con key estable durante reintento; éxito muestra pedido confirmado.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Dos pestañas no se pisan; cancelar modal conserva estado; restaurar no inventa fotos; timeout con resultado incierto conserva key; doble clic crea uno; error no borra formulario.

Trazabilidad: F-11,F-12,F-13,F-20; T-10,T-11,T-12,T-18,T-19.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P12-[A/B/C o único].
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

