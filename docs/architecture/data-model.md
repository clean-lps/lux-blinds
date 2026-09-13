# Modelo de datos propuesto

Todo el esquema es I, no extracción de DB original. UUID como PK, timestamps UTC, owner/organization explícitos y FKs con restricción de borrado por defecto.

| Entidad | Campos principales / restricciones |
|---|---|
| User | id, emailNormalized unique, authIdentity, role enum, verifiedAt, disabledAt |
| Organization | id, companyName, contactName, phone, address, taxId privado, taxStatus pending/approved/rejected |
| Membership | userId + organizationId unique, role; MVP un miembro cliente |
| Session | idHash, userId, expiresAt, revokedAt; índices usuario/expiración |
| VerificationChallenge | purpose, user/pendingRegistration, destination cifrada, tokenHash, expiresAt, attempts, consumedAt |
| Consent | userId, channel, granted, wordingVersion, recordedAt, source; append-only |
| Draft | id, userId, organizationId, revision >=1, schemaVersion, payload JSON, updatedAt; único activo por usuario |
| DraftVersion | draftId + revision unique, snapshot JSON, createdAt; sin binarios |
| Order | id, number unique, organizationId, createdBy, sidemark, status, notes, revision, submittedAt |
| OrderItem | id, orderId, position, quantity int >=1, roomArea, productType, productOther, fabricName, widthEighths/heightEighths int >0, unit=in propuesta, opening, trackSupplied bool, track, trackOther, fullness nullable, installation, controlSide, operation, notes, snapsManual, snapsSuggested, snapsSource, ruleVersion |
| OrderRevision | orderId + revision unique, snapshot JSON, actorId, reason, createdAt |
| Attachment | id, organizationId, uploadedBy, purpose, orderId/taxOrganizationId, storageKey unique, mediaType, byteSize, sha256, scanStatus, uploadStatus, createdAt |
| Quote | id, orderId, revision, currency, amountMinor bigint >=0, status, notes, publishedAt; impuestos desglosados solo con definición |
| InternalNote | id, orderId, authorId, text, createdAt; solo staff |
| AuditEvent | id, actorId, organizationId, resourceType/id, action, redactedDiff, requestId, createdAt; append-only |
| Notification | id, recipientId, orderId nullable, type, title, safeBody, readAt, hiddenAt, createdAt |
| Outbox | id, eventId unique, channel, payload mínimo, status, attempts, nextAttemptAt, lastErrorCode |
| IdempotencyRecord | actorId + route + key unique, requestHash, resultResourceId, expiresAt |

Relaciones: organización 1:N pedidos; pedido 1:N modelos/revisiones/notas/adjuntos/cotizaciones; usuario 1:N sesiones/desafíos/notificaciones/consentimientos; borrador 1:N versiones. Attachment pertenece exactamente a un propósito autorizado y su organización coincide con recurso padre.

Índices: Order(organizationId,submittedAt DESC,id), Order(status,submittedAt DESC,id), búsqueda number/sidemark normalizados; OrderItem(orderId,position) unique; Attachment(orderId), Notification(recipientId,readAt,createdAt), AuditEvent(resourceType,resourceId,createdAt), Outbox(status,nextAttemptAt). No indexar taxId sin necesidad.

Guardar octavos enteros evita errores binarios al persistir medidas. Mostrar entero+fracción; convertir a decimal únicamente en cálculo. Guardar sugerencia y versión de regla protege historia. JSON solo para snapshots/drafts, no sustituye restricciones de entidades operativas.

Transacciones: crear pedido + items + reclamar adjuntos + evento/outbox + consumir borrador; cambiar estado + revisión + evento/outbox; publicar cotización + evento. Concurrencia optimista: UPDATE WHERE revision=expectedVersion; cero filas =>409. No exponer credenciales, hash de contraseña o tokens mediante DTO.
