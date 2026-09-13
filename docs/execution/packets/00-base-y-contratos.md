Estado actualizado: base compilada y comprobada. Ver ../runtime-manifest.md para límites (DB pendiente y auditoría). Este packet conserva la especificación original como referencia.

# P00 — base-y-contratos

Estado: SPEC / NO READY. Modelo: **Terra High / responsable de base**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Crear después de la autorización de implementación una base reproducible y congelar las interfaces.

Dependencias: Ninguna; esta fase actual solo prepara documentación.. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `.env.example`
- `src/app/layout.tsx`
- `src/styles/tokens.css`
- `src/contracts/api.ts`
- `src/contracts/auth.ts`
- `src/contracts/orders.ts`
- `src/contracts/drafts.ts`
- `src/contracts/uploads.ts`
- `src/contracts/admin.ts`
- `src/contracts/notifications.ts`
- `src/contracts/profile.ts`
- `src/contracts/product-rules.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/dialog.tsx`
- `tests/fixtures/catalog.ts`
- `tests/fixtures/roles.ts`
- `tests/fixtures/orders.ts`
- `tests/fixtures/files.ts`
- `docs/execution/runtime-manifest.md`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `shared-contract.md`
- Ruta desde docs/execution: `../architecture/stack-decision.md`
- Ruta desde docs/execution: `../requirements/assumptions.md`

## Secuencia e interfaces propuestas

1. Elegir versiones y biblioteca auth mantenida, fijar lock y DB/storage de test aislados.
2. Publicar todos los DTO, esquemas Zod, errores y adaptadores declarados por los demás paquetes; reconciliar firmas, no solo copiar esta especificación.
3. Publicar tokens, componentes y fixtures contra referencias sanitizadas; registrar rutas reales de targets y contratos.
4. Crear Git y commit base solo al ejecutar este paquete; verificar scripts reales, build, tipos y migración vacía; registrar comandos y commit.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Base instala de forma reproducible; contratos compilan; fixtures solo sintéticos; secretos ausentes; runtime-manifest registra comandos exactos y decisiones resueltas.

Trazabilidad: Todos los paquetes; no crea módulos de negocio completos..

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P00-[A/B/C o único].
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



