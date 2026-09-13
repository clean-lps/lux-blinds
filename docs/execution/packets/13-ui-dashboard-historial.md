# P13 — ui-dashboard-historial

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Presentar dashboard, historial y detalle cliente.

Dependencias: 07; targets específicos anexados. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(client)/my-panel/page.tsx`
- `src/app/(client)/order-history/page.tsx`
- `src/app/(client)/orders/[id]/page.tsx`
- `src/components/client/dashboard.tsx`
- `src/components/client/order-history.tsx`
- `src/components/client/order-detail.tsx`
- `src/components/client/query-api.ts`
- `tests/client/order-history.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/functional.md`
- Ruta desde docs/execution: `../evidence/visual-reference-index.md`

## Secuencia e interfaces propuestas

1. Cards desde DashboardDTO; draft abre constructor; recientes enlazan detalle.
2. q/status/cursor en URL y navegación atrás coherente; estados vacío/sin resultados/error/loading.
3. Detalle solo ClientOrderDTO, fotos autorizadas y cotización publicada; nunca notas internas.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Cinco estados filtran; no resultados distinto de cuenta sin pedidos; fechas locales desde UTC; métricas cumplen decisión Completed; enlaces reales; teclado y cuatro anchos.

Trazabilidad: F-06,F-14,F-19,F-20; T-13,T-18,T-19,T-20.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P13-[A/B/C o único].
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

