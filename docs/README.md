# Punto de entrada actual

Leer AGENTS.md y [arranque para Terra/Luna](execution/dispatch.md). Hay 18 packets de preparación, 139 capturas sintéticas y tres originales revisados sin PII. No existe app/Git base: P00 los prepara cuando el líder inicia implementación. El índice visual actualizado distingue lo observado de lo sintético. La sección siguiente conserva el resumen de la investigación inicial; su estado temporal no reemplaza este encabezado.

# LUX Blinds — especificación de réplica

Fecha: 2026-09-13. Estado: investigación sustancial y propuesta técnica; NO implementación ni paquete visual completo.

Se inspeccionaron las 13 rutas únicas solicitadas mediante Chrome DevTools, formularios y JavaScript renderizado. La cuenta autorizada permite el portal cliente, pero /admin-orders/ redirige a /my-panel/. No se enviaron pedidos, formularios de registro, recuperación, perfil ni SMS. Existía un borrador de cero modelos al iniciar la inspección; no se editó ni descartó. No se garantiza ausencia de telemetría o efectos automáticos propios del sitio al navegar.

La carpeta inicial estaba vacía, sin Next.js ni .git. Se aplicaron las instrucciones AGENTS proporcionadas en la conversación. Solo se crean documentos. Inicializar Git antes de workers de implementación, después de aprobar plan y stack.

## Lectura

- [Fuentes](evidence/source-register.md) y [rutas](evidence/route-inventory.md).
- [Referencias visuales y faltantes](evidence/visual-reference-index.md).
- [Funciones](requirements/functional.md), [validaciones](requirements/validation-matrix.md), [roles](requirements/roles-permissions.md), [estados](requirements/order-state-machine.md), [supuestos](requirements/assumptions.md).
- [Stack](architecture/stack-decision.md), [datos](architecture/data-model.md), [API](architecture/api-contracts.md), [archivos](architecture/file-storage.md), [seguridad](architecture/security.md).
- [Plan](execution/implementation-plan.md), [contrato entre workers](execution/shared-contract.md).
- [Pruebas](qa/test-matrix.md) y [estado de verificación](qa/final-report.md).

## Decisiones de alcance que faltan

1. Aprobar Next.js full-stack + PostgreSQL + storage privado; proveedores y despliegue externo quedan separados.
2. Aprobar admin inferido: clientes, detalle, correcciones auditadas, cotización manual y estados. No se observó el admin original.
3. Confirmar transiciones, unidades de fabricación y política de cantidades/medidas inválidas. Mantener la fórmula observada de snaps, incluido Crazy Track, hasta validación del fabricante.
4. Completar el paquete visual antes de autorizar implementación fiel: la herramienta rechazó escritura de PNG en el workspace. Los estados que requieren alterar borradores deben recrearse con fixtures sintéticos aislados.

El prompt del usuario exige confirmación humana del plan y stack antes de crear workers. No interpretar este documento como aprobación ni como sistema implementado.

