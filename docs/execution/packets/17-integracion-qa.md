# P17 — integracion-qa

Estado: SPEC / NO READY. Modelo: **Astra / coordinación**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Integrar evidencias y verificar flujos completos sin prometer perfección.

Dependencias: 01–16 integrados en commits verificables. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `tests/e2e/auth.spec.ts`
- `tests/e2e/order-flow.spec.ts`
- `tests/e2e/admin-flow.spec.ts`
- `tests/e2e/responsive.spec.ts`
- `tests/server/backup-restore.test.ts`
- `tests/server/orphan-cleanup.test.ts`
- `src/server/storage/cleanup.ts`
- `docs/qa/final-report.md`
- `docs/execution/runtime-manifest.md`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../qa/test-matrix.md`
- Ruta desde docs/execution: `../architecture/file-storage.md`

## Secuencia e interfaces propuestas

1. Integrar por dependencia, revisar diffs y verificar commits; no pedir workers que resuelvan conflictos semánticos a ciegas.
2. Ejecutar recorridos auth→draft→review→order→admin→quote/notificación y permisos cruzados.
3. Verificar backup/restore local y limpieza de huérfanos con gracia configurada sin tocar original.
4. Revisar responsive 375/768/1280/1920, consola, teclado, reduced motion, enlaces y estados de formularios.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Build/tipos/pruebas ejecutados y evidenciados con commit; T-01 a T-22 trazados; no errores conocidos; hallazgos corregidos o explícitamente pendientes; proveedores reales/despliegue requieren configuración separada.

Trazabilidad: Todos; no es permiso de despliegue ni de mensajería real..

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P17-[A/B/C o único].
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

