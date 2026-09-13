# Roles y permisos

Propuesta I salvo acceso cliente observado E-01/E-08 y control fiscal por LUX E-07. Admin original no inspeccionado. El servidor debe filtrar por propietario aunque la UI esconda acciones.

| Operación | Visitante | Cliente | Operador | Administrador |
|---|---|---|---|---|
| Registro/login/recuperación | Sí | Sí | Sí | Sí |
| Perfil | No | Propio | Propio y lectura clientes | Clientes |
| Borrador | No | Propio | No por defecto | No por defecto |
| Crear pedido | No | Propio | En nombre de cliente solo si se aprueba | Igual |
| Ver pedidos/archivos de pedido | No | Propios | Todos operativos | Todos |
| Corregir pedido enviado | No | Solicitar cambio | Sí, con motivo y versión | Sí |
| Cambiar estado | No | No | Grafo autorizado | Grafo + excepción auditada |
| Notas internas/auditoría operativa | No | No | Sí | Sí |
| Cotización manual | No | Ver versión publicada | Preparar/publicar | Sí |
| Certificado fiscal | No | Propio | Sin acceso por defecto | Sí |
| Aprobar exención / cambiar roles | No | No | No | Sí |
| Notificaciones | No | Propias | Propias | Propias |

Crear primer administrador mediante comando de bootstrap en entorno propio. Nunca elevar privilegios en el sitio original. Rechazar mass assignment de role, ownerId, status, taxStatus. DTO cliente excluye notas internas, metadatos de seguridad y storage keys. Un 404 uniforme en recursos ajenos evita enumeración; 403 para función prohibida conocida.
