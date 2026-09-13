# Storage privado

I: bucket privado compatible S3, claves aleatorias por organización/recurso, sin nombres personales en paths. Solo backend firma URLs tras autenticar y autorizar. Descarga expira en 60 segundos propuestos, carga en 5 minutos; no incluir URLs en logs ni analytics.

Flujo: intent autorizado → upload a cuarentena → complete verifica bytes/MIME/checksum → antivirus y normalización → estado clean → asociación transaccional al pedido o certificado. Un upload no equivale a archivo disponible. Rechazar referencias ajenas, MIME falso, doble extensión, SVG/HTML ejecutables y objetos ausentes. El navegador muestra progreso, cancelar, error y reintento; no pierde otros campos.

Certificados: PDF/JPG/JPEG/PNG al registro (observado); perfil permite WebP y anuncia 10 MB (observado). Propuesta límite uniforme 10 MiB requiere decisión de producto porque 10 MB es texto original y fotos de pedido no tienen límite verificado. Configurar límite de fotos y total de pedido antes de producción.

Descarga con disposition attachment y nombre sanitizado; previews de imágenes transformadas sin EXIF y dimensiones conocidas. PDF aislado, sin ejecución en origen de app. Certificados solo propio cliente/admin fiscal, no todos los operadores. Cifrado tránsito/reposo, backups y prueba de restauración. No guardar fotos/documentos originales en fixtures.

Draft conserva metadata de archivos pero no File/Blob en localStorage; mostrar aviso de reelección cuando no existe carga persistida. Limpieza de huérfanos solo en entorno nuevo, tarea programada con período de gracia y comprobación de referencias. Plazo de retención y borrado legal pendiente A-010. No limpiar ni borrar borrador/archivos del sitio original.
