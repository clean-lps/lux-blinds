# Actualización de arranque

Bootstrap ejecutado. Usar START-WORKERS.md y runtime-manifest.md; las instrucciones de bootstrap siguientes son históricas. No repetir P00.

# Arranque sencillo para el líder

Usar esta guía en lugar de los prompts generales anteriores. La preparación está guardada; no hay Git/app base todavía. No iniciar tres tareas simultáneas ahora.

## 1. Primera tarea: BASE + BACKEND — Terra High

Crear en este proyecto, modo Local inicialmente (todavía no hay repositorio). Pegar:

```text
Empieza la implementación de la base compartida de LUX Blinds. Lee AGENTS.md y docs/execution/dispatch.md. Eres responsable de base y backend, con Terra High.
Ejecuta primero docs/execution/packets/00-base-y-contratos.md. Su estado SPEC significa que no se ha ejecutado, no que debas pedir otra aprobación: este mensaje autoriza bootstrap. Crea Git sin incluir capturas privadas, configura Next.js/TypeScript/PostgreSQL, fija dependencias y auth mantenida, publica contratos compilables y fixtures sintéticos y verifica build/typecheck. No implementes todavía módulos de backend/cliente/admin durante este paso.
Completa docs/execution/runtime-manifest.md con versiones, comandos realmente ejecutados, exports compartidos y commit base. Revisa todas las interfaces de P01–P16 y resuelve inconsistencias antes de declarar la base preparada. Puedes crear schema/migraciones/configuración necesarias para la base aunque la lista inicial del packet no las enumere. No conectes el original, no despliegues ni actives servicios externos.
Al terminar dame el commit base y la instrucción para abrir los dos worktrees de Luna. Después ejecuta P01–P09 por dependencias y subpasos, verificando cada entrega. No hagas que Luna invente contratos o migraciones. Si falta una decisión comercial, conserva la regla como configuración pendiente sin bloquear partes independientes ni presentarla como confirmada.
```

P00 debe proporcionar una base utilizable y revisar la especificación técnica. Los packets son planes de preparación, no código validado. Revisar especialmente límites de archivos, auth concreta, normas fiscales y representación de medidas.

## 2. Tras base verificada: PORTAL CLIENTE — Luna Max

Crear worktree desde el commit base indicado. Pegar:

```text
Implementa el portal cliente de LUX Blinds en este worktree, con Luna Max. Lee AGENTS.md, docs/execution/dispatch.md y runtime-manifest.md. Usa los packets P10–P14, un subpaso por vez y respetando dependencias. Rutas exactas abajo en el mapa. No inventes imports/API; usa contratos del commit base. Si una dependencia backend aún no está integrada, prepara solo trabajo independiente con fixtures de test explícitos y registra lo que falta para conexión real.
Usa referencias aprobadas/sintéticas indicadas en el índice; nunca capturas privadas. Implementa reglas, estados de carga/error/éxito, responsive y accesibilidad según cada packet. No cambies backend, configuración, migraciones o contratos compartidos. Solicita esos cambios al responsable de base. Haz commits por entrega, pruebas reales y reporte breve. No declares terminado un flujo que solo funciona con mocks. No merges/push/deploy.
```

## 3. Tras base verificada: ADMIN — Luna Max

Crear otro worktree desde el mismo commit base. Pegar:

```text
Implementa el admin de LUX Blinds en este worktree, con Luna Max. Lee AGENTS.md, docs/execution/dispatch.md y runtime-manifest.md. Ejecuta P15 y P16 por subpasos/dependencias. Usa el target A de docs/evidence/references/index.html y sus capturas admin-*.png. El admin es inferido, nunca lo presentes como observado.
Conecta listas, detalle, medidas, archivos, notas, estados, cotización manual y auditoría a contratos compartidos. No inventes precios/impuestos/cobros. Prueba permisos de presentación, conflictos 409, loading/error y cuatro tamaños; servidor sigue siendo autoridad. No cambies backend/cliente/contratos/raíz/migraciones. Solicita cambios al responsable de base. Commit y evidencia por entrega. No merges/push/deploy ni éxito de producción con mocks.
```

## 4. Integración

Volver al responsable de base con las ramas/commits de cliente y admin. Pegar:

```text
Integra backend, cliente y admin según docs/execution/packets/17-integracion-qa.md. Lee los commits reales de las tres ramas. Ejecuta build/typecheck/pruebas después de cada integración; valida permisos, datos persistidos, storage, borradores, snaps, notificaciones y responsive contra referencias. Actualiza docs/qa/final-report.md con resultados y faltantes reales. No despliegues. Si hay contradicción de arquitectura o seguridad que no puedas resolver con la documentación, informa el punto exacto para revisión del coordinador.
```

## Mapa de packets

- P00: packets/00-base-y-contratos.md — Terra High, base compartida.
- P01: packets/01-reglas-productos.md — Terra High.
- P02: packets/02-sesion-y-permisos.md — Terra High.
- P03: packets/03-registro-verificacion.md — Terra High.
- P04: packets/04-recuperacion-perfil.md — Terra High.
- P05: packets/05-archivos-privados.md — Terra High.
- P06: packets/06-borradores-versionados.md — Terra High.
- P07: packets/07-pedidos-consultas.md — Terra High.
- P08: packets/08-operaciones-admin.md — Terra High.
- P09: packets/09-notificaciones-outbox.md — Terra High.
- P10: packets/10-ui-autenticacion.md — Luna Max, cliente.
- P11: packets/11-ui-constructor.md — Luna Max, cliente.
- P12: packets/12-ui-draft-review.md — Luna Max, cliente.
- P13: packets/13-ui-dashboard-historial.md — Luna Max, cliente.
- P14: packets/14-ui-perfil-notificaciones.md — Luna Max, cliente.
- P15: packets/15-ui-admin-listas.md — Luna Max, admin.
- P16: packets/16-ui-admin-detalle.md — Luna Max, admin.
- P17: packets/17-integracion-qa.md — responsable de integración; Astra solo si necesita revisión crítica.

No necesitas reenviar el prompt maestro. Los nuevos chats leen el repositorio; no heredan esta conversación. No es posible garantizar ejecución perfecta por modelo o cantidad de documentación: los gates y pruebas detectan lo que falta.

