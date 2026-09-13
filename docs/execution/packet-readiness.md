# Paquetes para Terra High y Luna Max

Corrección de estrategia solicitada por el líder: Astra prepara especificación, contratos y revisión; Terra High ejecuta backend; Luna Max ejecuta portal y admin. Un chat por área puede mantenerse, pero recibe un solo subpaquete por turno. Máximo tres workers simultáneos y propiedad de archivos exclusiva.

## Estado actual

backend.md, client.md y admin.md son resúmenes de alcance, NO instrucciones suficientemente cerradas para ejecutar módulos enteros. No hay app base, contratos compilables, comandos verificados ni referencias visuales completas. Ningún subpaquete está READY todavía. No afirmar documentación perfecta o lista solo por tener muchos archivos.

## Condiciones para marcar un subpaquete READY

El coordinador debe proporcionar:

1. ID, modelo/razonamiento, objetivo único y lista explícita de lo excluido.
2. Commit base real y dependencias ya verificadas; worktree/rama de destino.
3. Lista exacta de archivos a crear/modificar, sin comodines de módulo; archivos compartidos prohibidos.
4. Contratos compilables: imports, nombres de funciones/tipos, parámetros, retornos, errores y ejemplos JSON completos de entrada/salida. No basta una tabla de endpoints.
5. Reglas resueltas: datos válidos/inválidos, límites, permisos, concurrencia y comportamiento ante fallos. Si una decisión de negocio pendiente afecta esta tarea, la tarea no está READY.
6. Fixtures reales en el repositorio y resultados esperados. Para snaps: tablas calculadas y verificadas; para permisos: usuario/rol/recurso y código HTTP esperado; para drafts: secuencia de revisiones y conflicto esperado.
7. Para UI: imágenes existentes con viewport/estado, tokens y componentes ya definidos, layout y comportamiento móvil; loading/error/empty/success, foco y navegación descritos. No pedir al worker elegir dirección visual.
8. Secuencia concreta de implementación, puntos de conexión y una implementación de referencia compatible cuando exista. No imponer código de producción completo disfrazado de especificación.
9. Comandos exactos, comprobados sobre el commit base: pruebas focalizadas, typecheck y build pertinentes. Identificar resultado inicial esperado y criterio de salida. No inventar scripts antes de crear package.json.
10. Criterios de aceptación binarios con evidencia requerida. Pruebas deben comprobar comportamiento y casos adversos, no copiar la implementación.
11. Condiciones de escalamiento: contrato insuficiente, decisión nueva de seguridad/negocio, cambio fuera de propiedad. Informar al coordinador sin pedir al usuario decisiones técnicas menores; continuar solo trabajo independiente.
12. Formato de entrega: commit, archivos, pruebas/comandos/resultados, evidencia visual si aplica, desviaciones, bloqueos y riesgos.

## Granularidad propuesta

Estos son candidatos para desglosar, no paquetes READY ni una secuencia de dependencias ya verificada:

| Área/modelo | Unidades de trabajo separadas |
|---|---|
| Backend / Terra High | Migración de entidades; integración de auth elegida; guards de permisos; calculador de snaps; validación de modelos; guardado de borrador con revision; restauración de versión; creación idempotente de pedido; consulta paginada; upload intent; verificación/escaneo; descarga autorizada; transición de estado; cotización versionada; outbox y consentimiento |
| Cliente / Luna Max | Formulario login; registro y certificado; recuperación; resumen dashboard; fila de modelo; selector medidas; reglas de campos por producto; lista de modelos/cantidades; indicador y conflicto draft; carga de fotos; modal revisión; historial/filtros; perfil; notificaciones |
| Admin / Luna Max | Lista clientes; lista pedidos/filtros; resumen detalle; tabla medidas; panel archivos; notas internas; control transición; conflicto de versión; cotización manual; timeline auditoría |

Cada unidad puede dividirse más si exige decisiones independientes. No programar todas en paralelo: dependencias, propiedad de archivo y disponibilidad del contrato mandan. Luna usa las reglas publicadas, no decide por su cuenta cómo calcularlas. Terra usa la política de auth/storage elegida, no tiene que diseñar una nueva.

## Revisión y promoción

READY → ejecución del worker → revisión de evidencia y diff por coordinador → integración verificada → siguiente paquete con nuevo commit base indicado. Si falla, reenviar el mismo paquete con fallo reproducible y alcance de reparación. No elevar el modelo automáticamente: primero corregir instrucciones/contratos o reducir alcance. Astra interviene para resolver la ambigüedad o revisar decisiones críticas.

Los prompts de leader-guide.md son envoltorios reutilizables; siempre adjuntar la ruta de UN subpaquete READY. Los tres paquetes generales no cumplen por sí solos esta condición.
