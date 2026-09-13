# Seguridad propuesta

No se auditó backend original. Estos son requisitos de la réplica, no garantías de seguridad del sitio investigado.

- Biblioteca de autenticación mantenida, hash de contraseña adecuado y sesiones revocables. Cookie HttpOnly, Secure, SameSite; rotar sesión al autenticar. CSRF/origen en mutaciones; no tokens de sesión en localStorage.
- Verificación y recuperación con token hash, vencimiento y un solo uso; rate limit por cuenta/destino/IP, respuesta genérica para evitar enumeración. En QA proveedor de correo/SMS simulado sin entregas reales.
- Autorización en servicio y consultas por organización, nunca solo middleware/UI. Probar IDOR en pedidos, drafts, versiones, notificaciones, cotizaciones y adjuntos.
- DTO por rol, deny-by-default, no mass assignment. Admin fiscal separado de operador. Reautenticación en cambio de email/password; roles solo admin.
- Validaciones Zod compartidas y autoritativas en servidor; límites de tamaño/longitud; campos no aplicables eliminados; queries parametrizadas; render escapado.
- Archivos privados y cuarentena según file-storage.md. No servir objeto por conocer su clave. CSP compatible con UI, frame-ancestors y headers defensivos.
- Auditoría append-only con actor, cambio, motivo, recurso, requestId y timestamp. Redactar secretos, teléfonos/emails completos y URLs firmadas. No capturar cuerpos de auth en errores.
- Outbox evita pérdida de notificación tras commit. Webhook SMS verifica firma del proveedor y deduplica IDs, procesa STOP antes de futuras entregas. No copiar webhook original ni credenciales.
- Consentimiento SMS opcional, versionado, revocable; respetar opt-out en cada intento, no solo al encolar. Plantillas y texto legal de nuevo negocio deben aprobarse.
- Separar dev/test/prod, fixtures sintéticos, secretos fuera Git. Backups cifrados, restauración probada y runbook de incidentes previo a lanzamiento.

Riesgos abiertos: no hay código backend/export original, límites físicos/comerciales sin confirmar, targets visuales incompletos, proveedores y retención pendientes. No activar SMS/email real ni migrar datos hasta resolver integración y autorización correspondientes.
