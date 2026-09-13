# P15 — ui-admin-listas

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Construir navegación administrativa, listas y revisión fiscal.

Dependencias: 07,08-A; target administrativo inferido identificado y aprobado. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/admin-orders/page.tsx`
- `src/app/(admin)/admin-customers/page.tsx`
- `src/app/(admin)/admin-customers/[id]/page.tsx`
- `src/components/admin/order-list.tsx`
- `src/components/admin/customer-list.tsx`
- `src/components/admin/customer-detail.tsx`
- `src/components/admin/admin-api.ts`
- `tests/admin/admin-lists.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/roles-permissions.md`
- Ruta desde docs/execution: `../evidence/visual-reference-index.md`

## Secuencia e interfaces propuestas

1. A: shell y listado pedidos usando alcance staff de GET /orders y filtros URL.
2. B separado: clientes y detalle desde AdminCustomerDTO; no dar certificados a operador.
3. C separado: revisión fiscal admin con motivo, versión y conflicto; usar download autorizado.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Cliente no puede cargar ruta; operador no ve revisión fiscal; servidor sigue siendo autoridad; loading/empty/error; 409 preserva comentario; cuatro tamaños según target inferido sin afirmar fidelidad al admin original.

Trazabilidad: F-16,F-18,F-20; T-14,T-18,T-19,T-20.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P15-[A/B/C o único].
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

