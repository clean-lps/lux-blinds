# Corrección de integración del despliegue

## Configuración verificada

- Sitio confirmado por el propietario: https://lux-blinds.vercel.app.
- `.env.vercel.example` es un archivo PRIVADO ignorado por Git, aunque su nombre termine en example. No publicarlo.
- Sus URL tenían `lux-blind.vercel.app`: corregidas a `lux-blinds.vercel.app`.
- Su bucket era `lux-uploads`, inexistente en la rama. Neon lista el bucket privado `lux-blind`: corregido en el archivo y en `neon.ts`.
- Lectura remota de tablas y transacción PostgreSQL: comprobadas con la configuración de ese archivo.
- Acceso remoto al bucket y CORS para el origen real: comprobados después de corregir el nombre. No se ha hecho una subida de archivos ni creado pedidos reales como prueba.
- Despliegue anterior: login admin 200 y API admin 200, pero página `/admin-orders` redirige 307 a `/my-panel`. La transmisión incorrecta de cookies en el layout explica esa diferencia.

## Código corregido

- Páginas de cliente sin fixtures ni fallback de demostración; carga/error explícitos.
- Perfil real, PUT conectado, revisiones actualizadas, cambio de contraseña cierra sesión, certificado privado subido desde la cuenta verificada. SMS oculto.
- Borradores con revisión, recuperación de modelos y errores visibles. Se guardan los modelos añadidos, referencia y notas, no un modelo aún sin añadir ni los archivos locales.
- Pedidos con adjuntos propios y validados, consumo del borrador y escrituras atómicas. Neon usa WebSocket y transacciones reales, no una emulación secuencial.
- Consultas con adjuntos, precio publicado, conteos globales y paginación sin saltarse filas.
- Administración: cookies, enlaces a clientes, permiso de revisión fiscal, certificados, correcciones de modelos, auditoría, cambios de estado y cotizaciones con control de revisión. Fixtures inaccesibles en producción.
- Cambios de estado generan notificación y correo pendiente dentro de la transacción. `after()` procesa el correo; el cron diario reintenta pendientes. Resend ya no devuelve éxito ficticio ante errores.
- Los archivos validados se guardan bajo una nueva clave privada para que la URL de subida no pueda sobrescribirlos después de revisarlos.

## Publicar en el sitio existente

1. Vercel → proyecto existente → Settings → Environment Variables → Production. Actualizar `APP_ORIGIN`, `BETTER_AUTH_URL`, `STORAGE_BUCKET` con el archivo privado corregido. Añadir también `CRON_SECRET`, generado en ese mismo archivo, para proteger los reintentos diarios. No cambiar `BETTER_AUTH_SECRET` por este valor.
2. Revisar `git status` y el diff; subir únicamente código/configuración pública, nunca `.env.vercel.example`. Publicar los cambios en la rama conectada al despliegue de producción.
3. Esperar el nuevo build. Un Redeploy del commit viejo no incorpora las correcciones locales.
4. Cerrar sesión y entrar nuevamente en el dominio correcto. Comprobar cliente y administrador en el nuevo despliegue, incluyendo un pedido y foto de prueba autorizados.

## Comprobaciones reproducibles

```powershell
npm run typecheck
npm run build
npx vitest run --maxWorkers=1 --pool=threads
node --env-file=.env.vercel.example --import tsx scripts/check-database.ts
node --env-file=.env.vercel.example --import tsx scripts/check-storage.ts
node --env-file=.env.vercel.example --import tsx scripts/check-deployment.ts
```

`check-deployment` abre y cierra su propia sesión con las credenciales iniciales, solo consulta pantallas/API y no imprime contraseñas ni datos personales. No crea pedidos ni modifica clientes.

## Límites que no equivalen a aprobación de producción

- El despliegue antiguo no cambia hasta publicar el código y actualizar variables en Vercel.
- `AV_PROVIDER=local-gate` NO es un antivirus completo. ClamAV, si se configura, falla cerrado cuando no está disponible. Elegir un servicio de escaneo antes de aceptar documentos no confiables a escala.
- La prueba de bucket/CORS es de lectura, no certifica la subida/descarga desde el nuevo despliegue.
- Resend requiere remitente/dominio autorizado para entregar a clientes; no se enviaron correos reales de prueba.
- El cron diario reintenta fallos de correo, no garantiza entrega inmediata de un correo que haya fallado.
