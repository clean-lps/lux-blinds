# P16 — ui-admin-detalle

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Construir detalle operativo, correcciones, estado y cotización.

Dependencias: 08-B,08-C,15; target administrativo completo anexado. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(admin)/admin-orders/[id]/page.tsx`
- `src/components/admin/order-detail.tsx`
- `src/components/admin/order-correction.tsx`
- `src/components/admin/status-control.tsx`
- `src/components/admin/quote-editor.tsx`
- `src/components/admin/audit-timeline.tsx`
- `src/components/admin/order-detail-api.ts`
- `tests/admin/admin-order.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/order-state-machine.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../evidence/visual-reference-index.md`

## Secuencia e interfaces propuestas

1. A: resumen/modelos/archivos + notas internas/timeline; AdminOrderDTO confinado a rutas staff.
2. B tras A: corrección con motivo, diff y versión; transiciones permitidas y conflicto recargar/comparar.
3. C tras B: cotización manual draft/publicar/versiones; moneda y unidades menores; no automatizar impuestos/cobros.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Motivo requerido donde contrato indica; stale 409 no sobreescribe; terminales sin acciones inválidas; publicar tiene confirmación y muestra nueva versión; medidas/fracciones correctas; contraste, foco y cuatro tamaños.

Trazabilidad: F-18,F-19,F-20; T-14,T-15,T-18,T-19,T-20.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P16-[A/B/C o único].
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

