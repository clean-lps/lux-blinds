# Decisiones de base — ejecución autorizada

Next.js full-stack + PostgreSQL, TypeScript estricto, Zod, Prisma 6 y Better Auth (auth queda por integrar en P02). Versiones exactas en package-lock.json. No servidor de correo, SMS ni acceso al original. La política de integraciones en src/server/integrations/policy.ts está fijada a mocks.

## Contratos canónicos

Los exports reales están en src/contracts/index.ts y los archivos por dominio. Estos nombres prevalecen sobre firmas textuales previas. Auth: RegisterSchema/LoginSchema/VerifySchema y SafeUser/Actor. Pedidos: CreateOrderSchema, OrderItemSchema, ClientOrderDTO, DashboardDTO. Borradores: SaveDraftSchema, DraftDTO, DraftVersionDTO. Archivos: UploadIntentSchema, AttachmentDTO, DownloadDTO. Administración: ChangeStatusSchema, CorrectOrderSchema, CreateQuoteSchema, ReviewTaxSchema, AdminOrderDTO. Perfil: UpdateProfileSchema/ProfileDTO. Notificaciones: NotificationDTO, ConsentSchema y OutboxEvent.

Decisiones técnicas explícitas:
- amountMinor se transmite como cadena decimal entera, se almacena BigInt; nunca float monetario. Corrige la ambigüedad de la tabla API anterior.
- revision en DTO; expectedVersion/expectedRevision en mutaciones. Creación de draft usa expectedRevision=0; actualización usa revisión actual. schemaVersion numérica 1.
- Session/Account/Verification corresponden al esquema de Better Auth. Session.token es secreto gestionado por biblioteca; no exponerlo ni registrarlo. P02 configura almacenamiento de tokens, sesiones y recuperación según biblioteca, con pruebas. No afirmar que auth esté integrada por instalar dependencia.
- Campos/cantidades/medidas: validación estructural base. P01 implementa matriz condicional, normalización y snaps; no duplicarla en UI.
- Draft builder admite campos incompletos, sin exigir modelo final. DTO no transporta Blob/File. Fixtures son solo de tests.
- Límites técnicos iniciales: 200 modelos/pedido, 20 adjuntos, 10,000,000 bytes por adjunto, notas modelo 4000/caracteres y generales 8000. Son límites de aplicación propuestos, no límites de fábrica observados. P05 refina MIME según propósito; no PDF como foto ni WebP en registro si se conserva regla original.
- Password mínima 12 caracteres como política técnica; verificación 6 dígitos. P02/P03 implementan vencimiento 10 min, máximo 5 intentos/código, reenvío >=60 s y rate limiting; recuperación de un uso 30 min. Sin entregas reales en tests.
- Grafo inicial según order-state-machine.md; sin reaperturas. Completed=Delivered provisional y explícito en DashboardDTO. No producción automática por publicar quote.

## Decisiones comerciales pendientes (no bloquean construcción con fixtures)

Unidad/límites físicos de fabricación, confirmación final de fórmula Crazy Track, interpretación Completed, impuestos/precios/moneda por cliente, plazos de retención, migración y proveedores reales. No convertir la aprobación de bootstrap en confirmación de esos datos del negocio. No desplegar mientras sigan siendo requisitos de lanzamiento.

## Propiedad

Backend Terra: src/server/**, src/app/api/v1/**, prisma/** y tests/server/**. Puede evolucionar migraciones de su módulo. Cliente Luna: src/app/(auth)/**, src/app/(client)/**, src/components/auth/**, src/components/client/**, tests/client/**. Admin Luna: src/app/(admin)/**, src/components/admin/**, tests/admin/**. Contratos/raíz/componentes UI se cambian por coordinador, con commit distribuido; no edición paralela.

Los packets UI pueden empezar presentación contra fixtures/contratos de esta base; integración funcional queda condicionada a endpoints del backend. No llamar READY funcional al módulo entero. P01 es el primer trabajo backend autónomo; los siguientes respetan dependencias existentes.
