# Plan de ejecución propuesto

Estrategia de modelos corregida por el usuario: Astra especifica/revisa/integra; backend ejecutado por Terra High; cliente y admin por Luna Max. Las filas de este plan son hitos, no asignaciones completas de un turno. Desglosar cada hito en subpaquetes según packet-readiness.md antes de entregarlo a un worker.

No iniciar workers hasta confirmación humana del plan/stack y targets, según el prompt maestro. La especificación visual sigue incompleta por bloqueo de escritura de capturas. La implementación no se ha iniciado.

| ID | Objetivo | Depende | Dueño | Resultado verificable |
|---|---|---|---|---|
| P-00 | Resolver carpeta autorizada para screenshots y completar referencias con fixtures aislados | — | Principal | Índice con PNG reales/redactados por viewport; ningún pedido real |
| P-01 | Confirmar stack, admin inferido y decisiones A-002/A-004/A-006 | P-00 | Usuario + principal | Decisiones registradas, targets seleccionados |
| P-02 | Inicializar Git, Next.js y checks; fijar dependencias | P-01 | Principal | Build/typecheck base, .gitignore, sin secretos |
| P-03 | Publicar tipos, schemas y tokens; fixtures seguros | P-02 | Principal | Contratos compilan; workers reciben referencia estable |
| B-01 | DB/migraciones/auth/roles | P-03 | Backend | Tests de sesiones, verificación, recuperación e IDOR |
| B-02 | Pedidos/reglas/borradores y concurrencia | B-01 | Backend | Snaps/validación/idempotencia y conflictos probados |
| B-03 | Archivos privados/outbox/consentimientos | B-01 | Backend | Cuarentena y permisos; proveedores mock |
| B-04 | Endpoints admin/cotización/auditoría | B-02 | Backend | Grafo y segregación DTO probados |
| C-01 | Auth, dashboard, historial y perfil | P-03 | Cliente | Rutas, loading/error/empty; API adapter |
| C-02 | Constructor, draft, fotos, revisión | C-01 | Cliente | Reglas compartidas, recuperación y reelección fotos |
| C-03 | Notificaciones y responsive | C-02 | Cliente | Teclado/foco y referencias 4 tamaños |
| A-01 | Clientes y lista pedidos/filtros | P-03 | Admin | Listado y búsqueda accesibles |
| A-02 | Detalle/modelos/archivos/notas | A-01 | Admin | Separación de datos internos y permisos |
| A-03 | Estados/correcciones/cotización/auditoría | A-02 | Admin | Conflictos 409 y estados de guardado visibles |
| I-01 | Integrar backend y contratos | B-01..04 | Principal | Migración limpia, build/typecheck/test |
| I-02 | Integrar portal cliente | I-01,C-03 | Principal | Flujos E2E con API real local |
| I-03 | Integrar admin | I-02,A-03 | Principal | Operación y permisos E2E |
| I-04 | Integraciones/configuración/fixtures | I-03,B-03 | Principal | Entorno de pruebas sin entregas externas |
| Q-01 | QA integral y comparación visual | I-04 | Principal | Matriz QA, capturas, informe con resultados reales |

Backend/cliente/admin pueden trabajar en paralelo tras P-03 sobre adaptadores/contratos estables; no habilitar producción con mocks. Paquetes detallados: task-packets/backend.md, client.md, admin.md. P-00..03 e I/Q tienen propiedad de raíz, contratos y tests/e2e, nunca archivos de worker mientras su rama esté activa.

Después de cada integración: build, typecheck, pruebas relevantes, rutas/permiso, consola y revisión de cambios ajenos. No arrancar siguiente merge si falla. Orden obligatorio backend → cliente → admin → integraciones → fixtures → pruebas. No despliegue ni migración de datos originales implícitos.

Riesgos críticos: fórmula Crazy poco habitual, ausencia de admin original, versiones/consistencia borradores no comprobadas por ejecución, storage y límites de fotos pendientes, referencia visual no exportada. No diluir estos riesgos bajo una marca de tarea terminada.
