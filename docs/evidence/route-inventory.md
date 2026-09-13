# Inventario de rutas

Todas las rutas relativas pertenecen a https://orderluxblinds.com. Evidencias E-01 a E-13 en source-register.md.

| Ruta | Acceso observado | Contenido / método | Réplica |
|---|---|---|---|
| /login/ | Público | Email, contraseña, enlaces; login exitoso | Conservar ruta |
| /register/ | Público en contexto aislado | Empresa/contacto/email/teléfono, tax ID opcional, password/confirmación, exención, certificado, términos, SMS | Conservar |
| /forgot-password/ | Público | Formulario email, envío no probado | Conservar |
| /my-panel/ | Cliente | Contadores, borrador, pedidos recientes, CTAs | Conservar |
| /new-order/ | Cliente | POST multipart a la misma URL; constructor y revisión | Conservar UI; API nueva separada |
| /order-history/ | Cliente | Formulario búsqueda y estado; vacío | Conservar |
| /my-profile/ | Cliente | Contacto/certificado/password/SMS | Conservar |
| /admin-orders/ | Cliente redirigido | Admin no visible | Admin operativo inferido |
| /terms-and-conditions/ | Público | Reglas de cuenta, pedidos y SMS | Contenido a aprobar para réplica |
| /privacy-policy/ | Público | Uso, protección y retención | Contenido a aprobar para réplica |
| /robots.txt | Público | Directivas WordPress | No copiar rutas WordPress |
| /wp-sitemap.xml | Público | Índice XML | Sitemap propio solo público |
| /wp-json/ | Público | Índice REST, no CRUD de pedidos descubierto | No reutilizar como contrato nuevo |

Rutas propuestas I: /admin/customers, /admin/orders/[id], /orders/[id], /notifications. Detalle de pedidos no observable porque la cuenta no tiene pedidos. No inferir su URL original.
