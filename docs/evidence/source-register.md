# Registro de fuentes

Fecha de acceso: 2026-09-13. O = observado en UI; C = confirmado por DOM/código/índice REST; I = inferido/propuesto; P = pendiente. C no significa comprobación del backend ni ejecución exitosa del endpoint.

| ID | Fuente | Evidencia y límite |
|---|---|---|
| E-01 | https://orderluxblinds.com/login/ | O: email/password, mostrar contraseña, Sign In, enlaces registro/recuperación/legales. Login autorizado llega al dashboard. |
| E-02 | https://orderluxblinds.com/register/ | O/C: campos, consentimiento separado, certificado condicional. Modal de verificación existe en DOM/código; no se envió registro. |
| E-03 | https://orderluxblinds.com/forgot-password/ | O: email requerido, Send Reset Link. No se envió correo. |
| E-04 | https://orderluxblinds.com/my-panel/ | O: cuatro contadores, historial vacío y borrador previo de cero modelos. No guardar identidad de la cuenta en fixtures. |
| E-05 | https://orderluxblinds.com/new-order/ | O/C: formulario multipart POST a misma ruta, seis productos, campos, validación, snaps, cantidad por modelo, revisión y autoguardado en JS. No submit. |
| E-06 | https://orderluxblinds.com/order-history/ | O: búsqueda número/sidemark y cinco estados; historial vacío. Captura inline escritorio y móvil. |
| E-07 | https://orderluxblinds.com/my-profile/ | O/C: campos de perfil, cambio de contraseña, certificado, SMS. Datos de valores omitidos del informe. No guardar. |
| E-08 | https://orderluxblinds.com/admin-orders/ | O: sin sesión redirige a login; con cuenta cliente redirige a dashboard. No prueba de inexistencia del admin. |
| E-09 | https://orderluxblinds.com/terms-and-conditions/ | O: vigencia 2026-09-09; permite revisar, cotizar y corregir pedidos antes de producción/instalación. Detalles sujetos a confirmación. SMS opcional. |
| E-10 | https://orderluxblinds.com/privacy-policy/ | O: datos de cuenta/pedidos/documentos; consentimiento SMS voluntario; retención por necesidades empresariales/legales, sin plazo concreto. |
| E-11 | https://orderluxblinds.com/robots.txt | C: Disallow /wp-admin/, Allow /wp-admin/admin-ajax.php, sitemap indicado. |
| E-12 | https://orderluxblinds.com/wp-sitemap.xml | C: generado por WordPress, cuatro submapas (posts/pages/category/users). No enumerar usuarios. |
| E-13 | https://orderluxblinds.com/wp-json/ | C: namespaces WordPress, fluent-smtp, Hostinger, luxo/v1; POST /luxo/v1/twilio/inbound registrado. No se invocó webhook. |

Tecnología confirmada: WordPress por sitemap, wp-includes, wp-content y REST; formularios PHP/WordPress y admin-ajax en cliente. Servidor PHP interno, esquema SQL, cookies HttpOnly/SameSite y proveedores SMTP efectivos no auditados. Namespace Twilio indica integración prevista, no prueba entrega SMS.

Los tres scouts fueron lanzados. Web rechazó aperturas públicas y búsquedas devolvieron cero resultados; en scouts Chrome tuvo conflicto de perfil. La investigación autenticada y pública final la efectuó el principal. No confundir bloqueo de una herramienta con bloqueo del sitio. Búsquedas solicitadas de LUX Blinds, admin-orders, new-order y los dos estados sin resultados útiles.

Documentación técnica consultada para propuesta, no evidencia del sistema original:
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://www.postgresql.org/docs/current/ddl-constraints.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
