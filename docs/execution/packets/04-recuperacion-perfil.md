# P04 — recuperacion-perfil

Estado: SPEC / NO READY. Modelo: **Terra High**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Añadir recuperación y cambios propios de perfil con reautenticación.

Dependencias: 02,05. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/server/auth/recovery.ts`
- `src/server/profile/service.ts`
- `src/app/api/v1/auth/forgot-password/route.ts`
- `src/app/api/v1/auth/reset-password/route.ts`
- `src/app/api/v1/me/route.ts`
- `src/app/api/v1/me/change-email/route.ts`
- `src/app/api/v1/me/change-password/route.ts`
- `src/app/api/v1/me/consents/route.ts`
- `tests/server/recovery.test.ts`
- `tests/server/profile.test.ts`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../architecture/api-contracts.md`
- Ruta desde docs/execution: `../requirements/roles-permissions.md`

## Secuencia e interfaces propuestas

1. Subpaso A: forgot/reset con token hash de un uso y respuesta genérica.
2. Subpaso B, después de verificar A: getMe(actor): Promise<ProfileDTO>, updateMe(actor,input: UpdateProfileInput): Promise<ProfileDTO>.
3. Subpaso C: cambio email verificado, password reautenticada y eventos de consentimiento; no editar taxStatus desde cliente.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Correo existente/no existente responde igual; token usado/expirado falla; reset revoca sesiones; conflicto perfil 409; mass assignment de role/taxStatus rechazado.

Trazabilidad: F-05,F-15,F-16; T-05,T-14.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P04-[A/B/C o único].
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

