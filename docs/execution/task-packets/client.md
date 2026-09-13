# Worker 2 — portal cliente

Leer shared-contract.md, functional.md, validation-matrix.md, api-contracts.md y visual-reference-index.md. Bloqueado hasta targets y P-03. Rama propuesta worker/client.

Propiedad exclusiva: src/app/(auth)/**, src/app/(client)/**, src/components/client/**, src/components/auth/**, tests/client/**. Prohibido API/server/prisma/admin/contracts/raíz/lock/docs. Interfaces: schemas/DTO comunes y API adapter; tokens/componentes compartidos del principal. Ningún fallback mock en producción.

| ID | Objetivo/dependencia | Aceptación y pruebas | Referencia/riesgo/resultado |
|---|---|---|---|
| C-01 | Auth/dashboard/historial/perfil; P-03 | Required/error/loading, recuperación genérica, SMS opcional; búsqueda/estado URL, vacío; formulario propio sin permisos fiscales | V-01..07/14..16; PII y login; entregar rutas conectadas |
| C-02 | Builder/draft/fotos/review; C-01 | 6 tipos, suministro yes/no, snaps/procedencia, Qty/editar/quitar, review total; conflicto draft con elección explícita; reelección fotos; doble submit bloqueado | V-08..13; autosave/pérdida datos; entregar flujo completo |
| C-03 | Notificaciones/responsive; C-02 | Lectura explícita, acciones con error; foco modal/restauración/Escape; reduced motion; 375/768/1280/1920 sin overflow | V-17 y toda referencia cliente; fidelidad móvil; entregar evidencia comparada |

Pruebas de componentes sobre reglas compartidas, sin duplicar funciones de dominio. E2E final del principal usa API real local. Fixtures sintéticos señalados. No tomar capturas del perfil original con identidad ni sesiones. Entrega estructurada según contrato.
