# Matriz funcional

O/C/I/P según registro de fuentes. Todo comportamiento propuesto requiere pruebas en la réplica.

| ID | Requisito | Evidencia | Aceptación |
|---|---|---|---|
| F-01 | Login con email y contraseña, toggle accesible, rutas públicas | O E-01 | Sesión válida entra; inválida muestra error genérico; rutas protegidas verificadas en servidor |
| F-02 | Registro de empresa y contacto, teléfono, tax ID opcional | O E-02 | Campos requeridos y formato validados cliente/servidor; sin crear cuenta activa antes de verificar |
| F-03 | Verificación email o SMS; reenviar y corregir email pendiente | O/C E-02 | Código expira, limita intentos y reenvíos; proveedor simulado en QA; SMS opcional |
| F-04 | Exención requiere certificado; términos obligatorios, SMS separado | O/C E-02 | Selección Yes revela archivo requerido; no preseleccionar consentimientos |
| F-05 | Recuperación por enlace email | O E-03 | Respuesta genérica, token de un uso, expiración y revocación de sesiones probadas |
| F-06 | Dashboard con total/received/in production/completed, borrador y recientes | O E-04 | Vacío y datos sintéticos; definición de Completed pendiente A-006 |
| F-07 | Pedido con sidemark, múltiples modelos, notas generales y fotos | O/C E-05 | Mínimo un modelo válido; sidemark no vacío; revisión antes de envío |
| F-08 | Constructor con reglas por producto | C E-05 | Aplicar validation-matrix.md; eliminar valores de campos no aplicables del payload |
| F-09 | Qty por modelo, edición, eliminación, limpiar constructor | C E-05 | Inicio 1; edición preserva posición; total suma cantidades; confirmación de descarte en réplica |
| F-10 | Snaps automáticos o override manual, guardar procedencia | C E-05 | Fórmula y excepciones versionadas; no recalcular silenciosamente pedidos históricos |
| F-11 | Borrador local y servidor, recuperación y versiones anteriores | O/C E-05 | Debounce observado 1200 ms; conflicto de revisión visible; no sobrescribir versión nueva |
| F-12 | Recuperación exige seleccionar fotos otra vez | O E-05 | Aviso visible; no presentar archivos inexistentes como adjuntos |
| F-13 | Revisión con sidemark, modelos, cantidad total, medidas, fotos y notas | C E-05 | Cancelar conserva estado; doble envío crea un solo pedido mediante idempotencia propuesta |
| F-14 | Historial busca número/sidemark y filtra cinco estados | O E-06 | Filtros persistidos en URL, paginación estable propuesta; vacío general y sin resultados distintos |
| F-15 | Perfil de empresa/contacto/email/teléfono/dirección | O/C E-07 | Campos requeridos, cambios sensibles reautenticados; actualización no afecta roles |
| F-16 | Certificado y estado fiscal controlado por LUX | O E-07 | Cliente adjunta; admin decide exención; registrar decisión y versión documental |
| F-17 | Notificaciones y acciones de lectura/limpieza | O/C E-06 | Apertura no marca automáticamente; lectura explícita; no probar sobre datos reales |
| F-18 | Admin clientes, pedidos, detalle, archivos, notas, auditoría | I E-08/E-09 | Permisos de matriz; nunca exponer notas internas al cliente |
| F-19 | Correcciones y cotización manual antes de producción | O texto E-09, I UX | Versiones auditadas; no inventar cálculo fiscal, precios automáticos o cobros |
| F-20 | Responsive, teclado, foco, reduced motion y estados de red | Requisito usuario | QA a 375/768/1280/1920, CTAs conectados, sin errores de consola |

Autoguardado confirmado por código: localStorage por usuario, servidor con action luxcp_save_order_draft, estado offline/pending, comparación timestamps y revisión, versiones previas. No se realizó una prueba mutante para medir persistencia o conflictos del backend original.
