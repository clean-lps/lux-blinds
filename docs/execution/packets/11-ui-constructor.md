# P11 — ui-constructor

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Implementar editor de modelos y lista local.

Dependencias: 00,01; target constructor y reglas visuales anexados. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(client)/new-order/page.tsx`
- `src/components/client/order-builder.tsx`
- `src/components/client/measure-input.tsx`
- `src/components/client/order-items.tsx`
- `src/components/client/order-editor-state.ts`
- `tests/client/order-builder.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/validation-matrix.md`
- Ruta desde docs/execution: `../evidence/visual-reference-index.md`

## Secuencia e interfaces propuestas

1. Selector de producto con política compartida product-rules; no importar src/server desde cliente.
2. Medidas entero + fracción se convierten a octavos; presentación de snaps usa función compartida publicada por coordinador.
3. Añadir/editar/quitar preserva posición; qty y total; sidemark/notas; separar estado del editor para conexión posterior de 12.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Todos los productos y Other muestran campos correctos; ocultos no se envían; edición conserva posición; eliminar/limpiar confirma cuando descarta trabajo; casos normal/Crazy equivalentes a servidor; sin autosave al original.

Trazabilidad: F-07 a F-10,F-20; T-06 a T-09,T-18,T-19.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P11-[A/B/C o único].
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

