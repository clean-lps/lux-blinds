# P10 — ui-autenticacion

Estado: SPEC / NO READY. Modelo: **Luna Max**. Documento de preparación; no autoriza implementación en esta sesión.

## Objetivo

Construir formularios públicos fieles al target saneado.

Dependencias: 00,02,03,04,05. Se consideran cumplidas solo después de integración y pruebas, no por existir este documento.

## Propiedad de archivos propuesta

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/verify/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/components/auth/auth-forms.tsx`
- `src/components/auth/api.ts`
- `tests/client/auth-forms.test.tsx`

Esta lista queda congelada al promover a READY. Solo estos archivos; cambios en contratos, Prisma, package.json, lock, tokens o componentes compartidos corresponden a coordinación (salvo 00). Si hacen falta migraciones, coordinación las entrega en el commit base antes del subpaso afectado. No crear caminos alternativos ni editar archivos de otro paquete. Nunca conectar con orderluxblinds.com.

## Lectura mínima

- `docs/execution/dispatch.md`
- `docs/execution/shared-contract.md`
- `docs/execution/packet-readiness.md`
- Ruta desde docs/execution: `../requirements/functional.md`
- Ruta desde docs/execution: `../evidence/visual-reference-index.md`

## Secuencia e interfaces propuestas

1. A: login + forgot/reset con errores genéricos, toggle accesible y estados de envío.
2. B tras A integrado: registro condicional, certificado y consentimientos independientes.
3. C tras B: verificación, cooldown, reenviar y corregir email; usar únicamente DTO auth compartidos.

Los nombres de función/tipo aquí son especificación, no imports existentes. El coordinador debe adjuntar antes de READY el módulo compilable exacto, sus exports y JSON completos válido/inválido. Las rutas API son las de api-contracts.md. Errores usan el envelope compartido; ninguna UI interpreta texto de error para decidir reglas. Si hay A/B/C, se entrega **un solo subpaso por turno**, con commit nuevo tras revisión.

## Casos de aceptación

Loading evita doble submit; error preserva entradas no secretas; exención revela requisito; código expira; teclado/foco; cada ruta enlazada; capturas 375/768/1280/1920 contra target identificado.

Trazabilidad: F-01 a F-05,F-20; T-02 a T-05,T-18,T-19,T-20.

## Ficha que coordinación debe completar antes de ejecutar

- Subpaso autorizado: P10-[A/B/C o único].
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

