# P05 — archivos-privados

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Implementar el ciclo de carga privada aislado.

Dependencias: 02; decisiones de límites, escáner y challenge upload fijadas en 00. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/storage/service.ts`
- `src/server/storage/scanner.ts`
- `src/app/api/v1/uploads/intents/route.ts`
- `src/app/api/v1/uploads/[id]/complete/route.ts`
- `src/app/api/v1/attachments/[id]/download/route.ts`
- `tests/server/uploads.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/file-storage.md`
- Ruta desde docs/execution: `../architecture/security.md`

## Secuencia e interfaces propuestas

1. Subpaso A: createUploadIntent(actorOrPendingChallenge,input: UploadIntentInput): Promise<UploadIntentDTO>.
2. Subpaso B: completeUpload(actorOrPendingChallenge,id,checksum): Promise<AttachmentDTO>; verificar objeto real y cuarentena.
3. Subpaso C: authorizeDownload(actor,id): Promise<DownloadDTO>; privado y expiración definida.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Archivo falso, ausente, demasiado grande y referencia ajena fallan; quarantined no descargable; operador no lee certificado; timeout escáner conserva cuarentena; jamás usar original ni archivo personal como fixture.

Trazabilidad: F-04,F-12,F-16; T-11,T-14.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P05-[A/B/C o único].
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

