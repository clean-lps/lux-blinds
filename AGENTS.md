<!-- Estado actual: leer runtime-manifest.md y foundation-decisions.md antes de instrucciones históricas SPEC. -->
# LUX Blinds — instrucciones de trabajo

Comunicar en español. Leer este archivo antes de trabajar. La base Next.js/PostgreSQL está preparada y verificada según docs/execution/runtime-manifest.md. La autorización actual cubre bootstrap; los workers arrancan con el mensaje de docs/execution/START-WORKERS.md. No pedir de nuevo decisiones técnicas ya documentadas.

## Ruta por responsabilidad y modelo

| Tarea asignada | Modelo previsto | Lectura siguiente |
|---|---|---|
| Base compartida y backend | Terra High | docs/execution/dispatch.md → packets/00-base-y-contratos.md → P01–P09 en orden de dependencias |
| Portal cliente | Luna Max | docs/execution/dispatch.md → packets/P10–P14 (nombres exactos en dispatch) |
| Admin | Luna Max | docs/execution/dispatch.md → packets/P15–P16 |
| Revisión e integración | Coordinador | docs/execution/packets/17-integracion-qa.md |

La asignación explícita de tarea manda, no deducir permisos por el modelo. Un modelo no cambia automáticamente al leer AGENTS.md: el líder lo selecciona en Codex.

## Contexto mínimo

Leer docs/execution/shared-contract.md y SOLO el packet asignado y sus referencias. No repetir toda la investigación. docs/requirements/validation-matrix.md manda sobre reglas observadas; docs/architecture/api-contracts.md define la API propuesta. PRODUCT.md describe intención. docs/evidence/visual-reference-index.md distingue original, sintético e inferido.

## Referencias y privacidad

- Workers: usar únicamente docs/evidence/references/screens/ (MOCK DATA) y docs/evidence/screens/approved/ (originales revisados sin datos personales).
- No abrir ni copiar docs/evidence/screens/*.png: cuatro originales contienen información de cuenta. Están excluidos de Git. No renombrar/mover/borrar originales para corregirlo.
- No usar credenciales ni navegar orderluxblinds.com. No pedidos reales, edición de perfil, SMS, email real ni eliminación de datos.
- HTML de referencias es una maqueta navegable: no copiar sus botones simulados como implementación ni afirmar que prueba backend.

## Ejecución

Base compartida primero; luego worktrees independientes desde commit verificado. No correr tres workers en la misma carpeta Local. Un subpaso revisable por vez; no cambiar contratos, dependencias o migraciones fuera de propiedad sin que el responsable de base publique el cambio.

P00 puede crear contratos/base cuando el líder lo arranque. Los demás packets se promueven de SPEC a READY solo cuando dependencias, imports y comandos existen y pasan. El responsable de base rellena el manifiesto con hechos ejecutados; no esperar que exista antes de bootstrap. No convertir placeholders de preparación en imports ficticios.

Entregar commit, archivos, comandos/resultados, casos adversos, capturas y limitaciones. Comprobar build/typecheck/pruebas pertinentes. No llamar completo lo que solo usa mocks. No push/deploy ni integración externa implícita. No prometer perfección: demostrar criterios de docs/qa/test-matrix.md.

