const NEON_URL = process.env.NEON_SQL_URL || 'https://billowing-flower-aml1n57a-pooler.c-5.us-east-1.aws.neon.tech/sql';
const CONN_STR = process.env.DATABASE_URL;
if (!CONN_STR) throw new Error('DATABASE_URL is required (see .env.example)');

async function query(sql) {
  const r = await fetch(NEON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'neon-connection-string': CONN_STR },
    body: JSON.stringify({ query: sql })
  });
  return r.json();
}

const statements = [
  `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`,

  `CREATE TYPE "Role" AS ENUM ('client', 'operator', 'admin');`,
  `CREATE TYPE "OrderStatus" AS ENUM ('received', 'in_production', 'ready_for_installation', 'delivered', 'cancelled');`,

  `CREATE TABLE "User" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "email" TEXT UNIQUE NOT NULL, "emailVerified" BOOLEAN DEFAULT false, "image" TEXT, "role" "Role" DEFAULT 'client', "disabledAt" TIMESTAMPTZ, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());`,

  `CREATE TABLE "Session" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "token" TEXT UNIQUE NOT NULL, "expiresAt" TIMESTAMPTZ NOT NULL, "ipAddress" TEXT, "userAgent" TEXT, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now(), "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE);`,
  `CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");`,

  `CREATE TABLE "Account" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT, "accessTokenExpiresAt" TIMESTAMPTZ, "refreshTokenExpiresAt" TIMESTAMPTZ, "scope" TEXT, "password" TEXT, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("providerId", "accountId"));`,
  `CREATE INDEX "Account_userId_idx" ON "Account"("userId");`,

  `CREATE TABLE "Verification" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL, "expiresAt" TIMESTAMPTZ NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());`,
  `CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");`,

  `CREATE TABLE "Organization" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "companyName" TEXT NOT NULL, "contactName" TEXT NOT NULL, "phone" TEXT NOT NULL, "address" TEXT DEFAULT '', "taxId" TEXT, "taxStatus" TEXT DEFAULT 'pending', "revision" INT DEFAULT 1, "createdAt" TIMESTAMPTZ DEFAULT now());`,

  `CREATE TABLE "Membership" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE RESTRICT, UNIQUE("userId", "organizationId"));`,

  `CREATE TABLE "Draft" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE RESTRICT, "revision" INT DEFAULT 1, "schemaVersion" INT DEFAULT 1, "payload" JSONB NOT NULL, "updatedAt" TIMESTAMPTZ DEFAULT now());`,

  `CREATE TABLE "DraftVersion" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "draftId" TEXT NOT NULL REFERENCES "Draft"(id) ON DELETE RESTRICT, "revision" INT NOT NULL, "snapshot" JSONB NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("draftId", "revision"));`,

  `CREATE TABLE "Order" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "number" TEXT UNIQUE NOT NULL, "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE RESTRICT, "createdBy" TEXT NOT NULL, "sidemark" TEXT NOT NULL, "status" "OrderStatus" DEFAULT 'received', "specialNotes" TEXT DEFAULT '', "revision" INT DEFAULT 1, "submittedAt" TIMESTAMPTZ DEFAULT now());`,
  `CREATE INDEX "Order_org_sub_id" ON "Order"("organizationId", "submittedAt", "id");`,
  `CREATE INDEX "Order_status_sub_id" ON "Order"("status", "submittedAt", "id");`,
  `CREATE INDEX "Order_sidemark_idx" ON "Order"("sidemark");`,

  `CREATE TABLE "OrderItem" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT, "position" INT NOT NULL, "quantity" INT NOT NULL, "productType" TEXT NOT NULL, "productOther" TEXT, "roomArea" TEXT, "fabricName" TEXT NOT NULL, "widthEighths" INT NOT NULL, "heightEighths" INT NOT NULL, "unit" TEXT DEFAULT 'in', "opening" TEXT, "trackSupplied" BOOLEAN NOT NULL, "track" TEXT, "trackOther" TEXT, "fullness" TEXT, "installation" TEXT, "controlSide" TEXT, "operation" TEXT, "notes" TEXT, "snapsManual" TEXT, "snapsSuggested" TEXT, "snapsSource" TEXT, "ruleVersion" TEXT NOT NULL, UNIQUE("orderId", "position"));`,

  `CREATE TABLE "OrderRevision" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT, "revision" INT NOT NULL, "actorId" TEXT NOT NULL, "reason" TEXT NOT NULL, "snapshot" JSONB NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("orderId", "revision"));`,

  `CREATE TABLE "Attachment" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "organizationId" TEXT REFERENCES "Organization"(id) ON DELETE RESTRICT, "orderId" TEXT REFERENCES "Order"(id) ON DELETE RESTRICT, "challengeId" TEXT, "uploadedBy" TEXT, "purpose" TEXT NOT NULL, "name" TEXT NOT NULL, "storageKey" TEXT UNIQUE NOT NULL, "mediaType" TEXT NOT NULL, "byteSize" INT NOT NULL, "sha256" TEXT NOT NULL, "scanStatus" TEXT DEFAULT 'pending', "uploadStatus" TEXT DEFAULT 'pending', "createdAt" TIMESTAMPTZ DEFAULT now());`,
  `CREATE INDEX "Attachment_org_order_idx" ON "Attachment"("organizationId", "orderId");`,

  `CREATE TABLE "Quote" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT, "revision" INT NOT NULL, "currency" TEXT NOT NULL, "amountMinor" BIGINT NOT NULL, "status" TEXT DEFAULT 'draft', "notes" TEXT DEFAULT '', "publishedAt" TIMESTAMPTZ, UNIQUE("orderId", "revision"));`,

  `CREATE TABLE "InternalNote" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT, "authorId" TEXT NOT NULL, "text" TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now());`,

  `CREATE TABLE "AuditEvent" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "actorId" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" TEXT NOT NULL, "action" TEXT NOT NULL, "redactedDiff" JSONB NOT NULL, "requestId" TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now());`,
  `CREATE INDEX "AuditEvent_type_res_id" ON "AuditEvent"("resourceType", "resourceId", "createdAt");`,

  `CREATE TABLE "Notification" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "recipientId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, "orderId" TEXT, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "safeBody" TEXT NOT NULL, "readAt" TIMESTAMPTZ, "hiddenAt" TIMESTAMPTZ, "createdAt" TIMESTAMPTZ DEFAULT now());`,
  `CREATE INDEX "Notification_rec_read_crea" ON "Notification"("recipientId", "readAt", "createdAt");`,

  `CREATE TABLE "Consent" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, "channel" TEXT NOT NULL, "granted" BOOLEAN NOT NULL, "wordingVersion" TEXT NOT NULL, "source" TEXT NOT NULL, "recordedAt" TIMESTAMPTZ DEFAULT now());`,

  `CREATE TABLE "Outbox" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "eventId" TEXT UNIQUE NOT NULL, "channel" TEXT NOT NULL, "payload" JSONB NOT NULL, "status" TEXT DEFAULT 'pending', "attempts" INT DEFAULT 0, "nextAttemptAt" TIMESTAMPTZ DEFAULT now(), "lastErrorCode" TEXT);`,
  `CREATE INDEX "Outbox_status_next" ON "Outbox"("status", "nextAttemptAt");`,

  `CREATE TABLE "IdempotencyRecord" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "actorId" TEXT NOT NULL, "route" TEXT NOT NULL, "key" TEXT NOT NULL, "requestHash" TEXT NOT NULL, "resultResourceId" TEXT NOT NULL, "expiresAt" TIMESTAMPTZ NOT NULL, UNIQUE("actorId", "route", "key"));`,
];

async function main() {
  let ok = 0, fail = 0;
  for (let i = 0; i < statements.length; i++) {
    const s = statements[i];
    try {
      const r = await query(s);
      if (r.error) { console.error(`FAIL #${i+1}: ${r.error}`); fail++; }
      else { ok++; }
    } catch(e) { console.error(`ERR #${i+1}: ${e.message}`); fail++; }
  }
  console.log(`Done: ${ok} ok, ${fail} fail out of ${statements.length}`);
}

main().catch(console.error);
