# Contrato compartido — propuesta

Asignación: Terra High para backend; Luna Max para cliente/admin; Astra para especificación, decisiones compartidas, revisión e integración. Un subpaquete READY por ejecución, conforme a packet-readiness.md. Los packets generales definen alcance; todavía no sustituyen los subpaquetes con archivos, contratos, fixtures y comandos exactos.

Estado: no aprobado para implementación. Workers leen su packet, este contrato, API y reglas; no repiten investigación ni cambian arquitectura por cuenta propia.

Estructura propuesta:
- src/app/(auth), src/app/(client): Worker cliente.
- src/app/(admin), src/components/admin: Worker admin.
- src/app/api, src/server, prisma, tests/server: Worker backend.
- src/contracts, src/components/ui, src/styles/tokens.css, src/app/layout.tsx, package.json, lockfile, configuración y tests/e2e: principal, preparados antes de workers.
- docs: principal; workers reportan cambios sin reescribir plan.

TypeScript strict, camelCase JSON/TS, PascalCase componentes, kebab-case archivos/rutas; fechas ISO UTC y formatos locales solo UI. Estado interno received/in_production/ready_for_installation/delivered/cancelled. Labels de UI mantienen texto observado. Draft separado. Medidas en octavos con unidad explícita, precios en unidades menores + moneda; nunca float monetario.

Tipos compartidos publicados por principal: OrderStatus, ProductType, OrderItemInput, OrderDTO, ClientOrderDTO, AdminOrderDTO, DraftDTO, AttachmentDTO, NotificationDTO, ApiError, CursorPage<T>. DTO admin jamás importado por render cliente. API y errores según architecture/api-contracts.md. Toda pantalla usa adaptador de API; fixtures solo bajo configuración de test, sin fallback silencioso en producción.

Dependencias propuestas autorizables: Next.js/React/TypeScript, Prisma, Zod, biblioteca auth mantenida, SDK storage S3, Vitest, Playwright, Lucide. No agregar librería UI general/motion ni proveedor externo sin razón documentada. Versiones fijadas por principal al bootstrap.

Variables sin valores: DATABASE_URL, AUTH_SECRET, APP_ORIGIN, STORAGE_ENDPOINT, STORAGE_REGION, STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY, EMAIL_PROVIDER, EMAIL_FROM, EMAIL_API_KEY, SMS_ENABLED=false, SMS_PROVIDER, SMS_ACCOUNT_ID, SMS_AUTH_TOKEN, WEBHOOK_BASE_URL. Solo variables públicas deliberadas con NEXT_PUBLIC_; ninguna credencial. Mocks de email/SMS por defecto en test.

Cada worker en rama/worktree independiente; máximo tres. Git inexistente inicialmente: bootstrap obligatorio. Propiedad de archivo exclusiva; solicitud de cambio compartido al principal. No acceder al sitio original ni recibir credenciales o capturas sin redactar.

Done por packet: criterios cumplidos, pruebas relevantes pasan, build/typecheck de rama, sin cambios ajenos, evidencia breve. Respuesta exclusivamente archivos, decisiones, pruebas, problemas, pendientes, riesgos. Conflictos mecánicos integra principal; semánticos requieren nota de decisión antes de integrar.
