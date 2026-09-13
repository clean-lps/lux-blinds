# Contratos de API propuestos v1

I: endpoints de la réplica, no endpoints descubiertos en WordPress. JSON camelCase, UTC ISO-8601, UUID opacos, cookie de sesión segura; no confiar en ownerId/role suministrado por cliente. Respuestas privadas Cache-Control: no-store.

Éxito: {data:T,requestId}. Lista: {data:T[],page:{nextCursor:string|null},requestId}. Error: {error:{code,message,fieldErrors?:Record<string,string[]>,retryable:boolean},requestId}. No devolver stack traces. HTTP 400 formato, 401 sesión, 403 permiso, 404 no visible, 409 conflicto/idempotencia, 413 tamaño, 422 reglas, 429 límite, 503 dependencia temporal.

| Método/ruta /api/v1 | Entrada | Salida / autorización |
|---|---|---|
| POST /auth/register | companyName,contactName,email,phone,password,confirmPassword,taxId?,taxExempt,certificateId?,termsVersion,smsConsent,verificationMethod | 202 challengeId; público limitado; no activar cuenta |
| POST /auth/verify | challengeId,code | 200 user seguro; código de un uso |
| POST /auth/resend | challengeId | 202 genérico; cooldown y límite |
| POST /auth/pending-email | challengeId,newEmail | 202; revoca código previo |
| POST /auth/login | email,password | 200 sesión cookie + user seguro |
| POST /auth/logout | vacío | 200; revoca sesión |
| POST /auth/forgot-password | email | 202 genérico tanto si existe como si no |
| POST /auth/reset-password | token,newPassword,confirmation | 200; token hash de un uso y revocación |
| GET /me | — | DTO propio, permisos calculados |
| PATCH /me | expectedVersion,companyName,contactName,phone,address | 200; cambios email/password por flujo autenticado separado |
| POST /me/change-password | currentPassword,newPassword,confirmation | 200; reautenticación y revocación demás sesiones |
| POST /me/change-email | currentPassword,newEmail | 202 verificación nuevo destino |
| POST /me/consents | channel,granted,wordingVersion | 201 evento; SMS jamás implícito |
| GET /dashboard | — | métricas, recientes, resumen borrador propio |
| GET /draft | — | DraftDTO o null |
| PUT /draft | expectedRevision,schemaVersion,sidemark,items,builder,specialNotes | 200 nueva revision; 409 no sobrescribe |
| GET /draft/versions | cursor?,limit<=50 | versiones propias |
| POST /draft/restore | versionId,expectedRevision | 200 nueva revisión, no borrado histórico |
| DELETE /draft | expectedRevision | 200 descartar en réplica; no ejecutar en original |
| POST /orders | draftId?,expectedDraftRevision?,sidemark,items,specialNotes,attachmentIds | 201 OrderDTO; cliente; Idempotency-Key requerido |
| GET /orders | q?,status?,cursor?,limit<=50 | lista propia; staff filtra alcance autorizado |
| GET /orders/:id | — | detalle seguro según rol |
| PATCH /admin/orders/:id | expectedVersion,items?,sidemark?,reason | 200 revisión; staff |
| POST /admin/orders/:id/status | expectedVersion,status,reason? | 200; grafo validado |
| GET /admin/customers | q?,cursor?,limit<=50 | staff, DTO sin certificado por defecto |
| GET /admin/customers/:id | — | staff, permisos por campo |
| POST /admin/customers/:id/tax-review | expectedVersion,status,certificateId,reason | 200; admin |
| POST /admin/orders/:id/notes | text | 201 nota interna; staff |
| GET /admin/orders/:id/audit | cursor? | auditoría; staff |
| POST /admin/orders/:id/quotes | expectedVersion,currency,amountMinor,notes | 201 draft quote; staff |
| POST /admin/quotes/:id/publish | expectedVersion | 200 versión visible cliente; staff |
| POST /uploads/intents | purpose,resourceId?,name,mediaType,byteSize,sha256 | 201 attachmentId,url temporal; autorización del propósito |
| POST /uploads/:id/complete | checksum | 202 escaneo; verificar objeto real |
| GET /attachments/:id/download | — | 200 URL temporal si limpio/autorizado |
| GET /notifications | cursor?,unread? | propias |
| PATCH /notifications/:id | read:true | 200 propia |
| POST /notifications/read-all | beforeTimestamp | 200 propias |
| POST /notifications/clear-read | beforeTimestamp | 200 oculta solo leídas propias |

OrderItemInput: productType enum Roller/Zebra/Ripple Fold/Pinch Pleat/Roman Shades/Other, productOther?, roomArea?, fabricName, quantity, widthEighths,heightEighths,opening?,trackSupplied,track?,trackOther?,fullness?,installation?,controlSide?,operation?,snapsManual?,notes?. Server calcula snapsSuggested/snapsSource/ruleVersion; no aceptar del navegador como autoridad.

Concurrencia: required expectedVersion en cambios. Idempotency-Key repetida + mismo hash devuelve mismo recurso; misma key distinto hash devuelve 409. Reintentar GET/PUT idempotentes con backoff/jitter; POST solo con key conservada. No reintentar 401/403/422 automáticamente.

Registro certificado: intent temporal asociado a desafío de registro, límites estrictos y cuarentena, no listado ni lectura pública. Al completar verificación se reclama dentro de transacción. Workers deben resolver este flujo sin otorgar sesión activa a cuentas no verificadas.

Endpoints originales C, NO llamar para pruebas: POST /wp-admin/admin-ajax.php con actions luxcp_save_order_draft, luxcp_delete_order_draft, luxp_resend_code, luxp_change_pending_email, luxo_notify_mark_one_read, luxo_notify_mark_read, luxo_notify_clear_read; POST /new-order/ multipart; REST registrado POST /wp-json/luxo/v1/twilio/inbound. Nonces/valores de sesión omitidos. Implementación de servidor y códigos HTTP de estos endpoints no verificados.
