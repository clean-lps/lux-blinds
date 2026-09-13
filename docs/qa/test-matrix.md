# Matriz de pruebas planificada

Pruebas de la réplica NO ejecutadas: todavía no existe código. Ejecutar sobre DB/storage/proveedores locales con datos sintéticos. No enviar pedidos o correos/SMS reales al original.

| ID | Caso | Nivel | Criterio |
|---|---|---|---|
| T-01 | Build/typecheck | CI | Ambos exit 0; migraciones aplican a DB vacía |
| T-02 | Login correcto/incorrecto/logout/sesión expirada | integración/E2E | Cookie segura y acceso denegado sin sesión |
| T-03 | Registro email/SMS opcional/exención | integración/E2E | Certificado condicional; consentimiento no obligatorio |
| T-04 | Código/reenviar/cambiar email pendiente | integración | Expiración, uso único, rate limit, revocar código previo |
| T-05 | Recuperación | integración/E2E | Respuesta genérica, enlace válido/expirado/usado |
| T-06 | Matriz 6 productos + Other igual tipo existente | unit/E2E | Campos requeridos/deshabilitados y payload según matriz |
| T-07 | Medidas enteras/octavos/0/negativo/NaN/extra grande | unit/API | Positivas y finitas, límites configurados; no float persistido |
| T-08 | Snaps normal/Crazy × O/W/C/O × 3 fullness | unit | Fórmula literal; forceEven(26)=28, forceOdd(26)=27; cero/vacío; overrides |
| T-09 | Qty 1/múltiple/0/negativa/fracción, edición/quitar | unit/E2E | Server entero>=1, total correcto, revisión coherente |
| T-10 | Draft debounce/offline/reload/versiones/multitab | integración/E2E | No overwrite stale, 409 explícito, recuperación segura |
| T-11 | Fotos/certificados | integración/E2E | MIME/bytes/permisos/cuarentena; error/progreso y reselección tras restore |
| T-12 | Review/cancel/submit doble/red interrumpida | integración/E2E | Un pedido con key; transacción consistente |
| T-13 | Historial/search/status/página/vacío | integración/E2E | Filtro correcto y recursos propios únicamente |
| T-14 | Admin cliente/operador/admin y IDOR | API/E2E | Deny by default; notas internas nunca cliente |
| T-15 | Estados/correcciones/quote/audit | integración/E2E | Grafo, motivo, versión, outbox atómico; sin cobro implícito |
| T-16 | Notificaciones/read-all/clear-read | integración/E2E | Solo propias, no perder no leídas |
| T-17 | Outbox/email/SMS STOP/reintentos | integración | Dedup, firma webhook, opt-out; mocks no entregan mensajes |
| T-18 | Teclado/foco/modal/Escape/reduced motion | E2E/manual | Flujo completo sin ratón, foco visible/restaurado |
| T-19 | 375×800,768×1024,1280×900,1920×1080 | visual/manual | Verificar innerWidth/innerHeight antes de captura; sin overflow; comparar targets |
| T-20 | Todas las rutas/CTAs/formularios | E2E | Success/error/loading y links operativos, imágenes con dimensiones |
| T-21 | Consola/red/privacidad | E2E | Sin errores conocidos, logs sin secretos, páginas privadas no cacheadas |
| T-22 | Backup/restore y limpieza huérfanos | integración | Restauración verificada; no elimina archivo referenciado |

Fixtures mínimos: dos organizaciones, dos clientes, operador, admin, pedidos en cinco estados, 6 productos, varios modelos/cantidades, draft desfasado, notificaciones leídas/no leídas y archivos sintéticos limpios/rechazados. Cambios mutantes únicamente en la réplica.

Evidencia final por prueba: commit, comando, entorno, resultado, screenshot relativo si aplica, limitación. No sustituir pruebas de backend por lectura de JS original ni llamar QA final a esta investigación.
