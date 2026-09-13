# P06 — borradores-versionados

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Persistir y restaurar borradores con revisión optimista.

Dependencias: 01,02. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/drafts/service.ts`
- `src/app/api/v1/draft/route.ts`
- `src/app/api/v1/draft/versions/route.ts`
- `src/app/api/v1/draft/restore/route.ts`
- `tests/server/drafts.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../architecture/data-model.md`

## Secuencia e interfaces propuestas

1. saveDraft(actor,input: SaveDraftInput): Promise<DraftDTO>; aceptar estado constructor incompleto conforme contrato de borrador, no schema de pedido final.
2. listDraftVersions(actor,cursor): Promise<CursorPage<DraftVersionDTO>> y restoreDraft(actor,input): Promise<DraftDTO>.
3. Eliminar con expectedRevision; snapshots no contienen File/Blob, secretos ni URLs firmadas.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Dos escritores con revisión 1: uno obtiene 2 y otro 409 sin pérdida; restaurar crea revisión 3 y mantiene historia; un cliente no accede al draft ajeno.

Trazabilidad: F-11,F-12; T-10.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P06-[A/B/C o único].
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

