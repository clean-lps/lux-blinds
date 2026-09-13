# Worker 1 — backend

Leer shared-contract.md, architecture/*, requirements/validation-matrix.md y roles-permissions.md. No navegar original, no credenciales ni datos reales. Rama propuesta worker/backend; crear únicamente tras aprobación y Git.

Propiedad exclusiva para todas las tareas: prisma/**, src/server/**, src/app/api/**, tests/server/**. Prohibido: layouts/páginas UI, src/contracts/**, package.json/lock/config, docs y archivos de otros workers. Interfaces: API v1 y tipos del principal; pedir cambios de contrato, no redefinirlos.

| ID | Objetivo/dependencia | Aceptación y pruebas | Referencia/riesgo/resultado |
|---|---|---|---|
| B-01 | DB, auth, roles; P-03 | Migración DB vacía y rollback documentado; sesiones, código vencido/usado, recuperación, rate limit, IDOR y escalada de rol | E-01/02/07/08; riesgo auth; entregar migraciones y endpoints auth |
| B-02 | Pedido/draft/reglas; B-01 | Tests parametrizados 6 productos, snaps normal/Crazy, qty y octavos; transacción rollback; key duplicada; stale revision 409; restore no pierde versión | E-05, V-08..13 cuando existan; riesgo pérdida de borrador; entregar servicios transaccionales |
| B-03 | Storage/outbox/consent; B-01 | Rechaza archivo ajeno/MIME falso/oversize; objeto no limpio no descarga; outbox retry deduplicado; opt-out impide envío en cada intento | E-07/09/10/13; riesgo PII; entregar adaptadores mock y contratos reales |
| B-04 | Admin/quote/audit; B-02 | Grafo autorizado, cancelación con motivo, quote versionada, DTO cliente sin notas, evento atómico | A-001/002/003; admin inferido; entregar endpoints operativos |

QA solo entorno local sintético. No afirmar proveedor real verificado con mocks. Entrega: archivos modificados, decisiones, comandos/resultados, problemas, pendientes, riesgos.
