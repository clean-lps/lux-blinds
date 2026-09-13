# Arranque de los tres workers

Base común: `git rev-parse foundation-ready`. Tres worktrees ya asociados a ramas independientes en `.worktrees/backend`, `.worktrees/client`, `.worktrees/admin`. No usar tres tareas Local sobre la carpeta raíz.

En Codex, crea cada tarea dentro de FULL Stack SISTEM, selecciona Worktree y la rama exacta de abajo como punto de partida; no seleccionar rama de otro worker. Si asocias un worktree existente, usa exactamente la carpeta correspondiente. Comprueba antes de editar que HEAD coincide con foundation-ready. No crear una tarea automática desde default branch sin comprobar esta referencia.

| Worker | Modelo | Rama | Packet inicial |
|---|---|---|---|
| Backend | Terra High | worker/backend | 01-reglas-productos.md |
| Portal cliente | Luna Max | worker/client | 10-ui-autenticacion.md |
| Admin | Luna Max | worker/admin | 15-ui-admin-listas.md |

Pega este mensaje, cambiando RESPONSABILIDAD y PACKET por la fila:

> Ejecuta RESPONSABILIDAD desde el commit foundation-ready, en tu worktree independiente. Lee AGENTS.md, docs/execution/runtime-manifest.md, foundation-decisions.md y docs/execution/packets/PACKET. Instala con npm ci; copia .env.example a .env si falta. Empieza por ese packet y continúa los de tu responsabilidad respetando dependencias. No rehagas P00. Usa los contratos reales y fixtures compartidos; no cambies archivos de otros responsables. Los estados SPEC de documentos antiguos quedan subordinados a la autorización de este mensaje y al manifiesto: UI puede construir presentación ahora, pero no afirmar integración funcional sin backend. Backend debe verificar migración local y resolver el hallazgo de auditoría. No inventes reglas comerciales pendientes. No despliegues, no accedas al original y no envíes email/SMS reales. Entrega commits, pruebas ejecutadas y bloqueos concretos. No mezcles ramas de otros workers.

Al terminar los tres, entregar sus hashes al coordinador para integrar según packet 17 y comprobar el sistema completo. Los workers no se arrancaron durante bootstrap.
