# Decisión de stack — propuesta pendiente de aprobación

Recomendación: Next.js App Router full-stack, TypeScript, PostgreSQL, Prisma para migraciones/ORM, Zod para contratos, biblioteca de autenticación mantenida (selección concreta al preparar dependencias), storage privado compatible S3 y outbox SQL para email/SMS. Monolito modular con módulos de dominio; rutas web y API misma procedencia. No instalar ni fijar versiones sin revisión de compatibilidad al iniciar implementación.

| Criterio | Next.js full-stack + PostgreSQL | Next.js + NestJS/Express | Next.js + backend original |
|---|---|---|---|
| Tiempo inicial | Menor integración; un contrato TS | Mayor: dos servicios y auth entre ellos | Indeterminado: acceso y CRUD no disponibles |
| Coste | Un servicio web + DB + storage + jobs | Dos servicios y mayor operación | Hosting original más puente/mantenimiento |
| Mantenibilidad | Módulos y migraciones compartidos | Límites fuertes; más despliegues | Dependencia de plugins/código legado |
| Seguridad | Mismo origen, permisos en dominio | CORS/tokens internos adicionales | Hereda seguridad original no auditada |
| Storage | S3 privado independiente | Igual | Modelo original no verificado |
| Auth | Biblioteca mantenida + sesiones DB | Servicio auth central | Reutilización no autorizada ni especificada |
| Email/SMS | Outbox + adaptadores | Worker dedicado fácil | Integraciones visibles pero sin contratos fiables |
| Migración | Importador explícito posterior | Igual, más capas | Menos migración inicial; acoplamiento alto |
| Despliegue | Web Node, DB y job runner | Web/API/job runner | Necesita acceso PHP/WordPress |
| Riesgo cliente | Menor para este alcance | Justificado solo por varios consumidores/equipos | Alto sin acceso y garantías de API |

Evaluación cualitativa, no cotización ni calendario prometido. Importes dependen de usuarios, archivos y tráfico no suministrados. No contratar servicios en esta fase.

Prisma/Zod/auth son elecciones de diseño, no tecnología observada. Propuesta de pruebas: Vitest para dominio/contratos y Playwright para flujos en fixtures. Usar CSS propio fiel a evidencia y una familia Lucide. QA responsive separada de implementación.

Fuentes primarias consultadas: [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) para endpoints en App Router; [constraints PostgreSQL](https://www.postgresql.org/docs/current/ddl-constraints.html) para integridad; [URLs prefirmadas S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) para acceso temporal. Las URLs firmadas funcionan como credenciales temporales y deben mantenerse fuera de logs.
