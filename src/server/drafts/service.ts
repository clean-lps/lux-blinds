import { Prisma } from '@prisma/client';
import type { Actor } from '@/contracts/auth';
import type { CursorPage } from '@/contracts/api';
import { RestoreDraftSchema, SaveDraftSchema, type DraftDTO, type DraftVersionDTO, type RestoreDraftInput, type SaveDraftInput } from '@/contracts/drafts';
import { authorize } from '@/server/auth/authorize';
import { db } from '@/server/db';

type DraftPayload = Pick<SaveDraftInput, 'schemaVersion' | 'sidemark' | 'items' | 'builder' | 'specialNotes'>;
type DraftRecord = Awaited<ReturnType<typeof db.draft.findFirstOrThrow>>;

export class DraftConflictError extends Error {
  readonly status = 409;
  constructor() {
    super('Draft revision conflict');
  }
}

export class DraftValidationError extends Error {
  readonly status = 422;
  constructor() {
    super('Invalid draft snapshot');
  }
}

export class DraftNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('Draft version not found');
  }
}

function payload(input: DraftPayload): DraftPayload {
  return {
    schemaVersion: input.schemaVersion,
    sidemark: input.sidemark,
    items: input.items,
    builder: input.builder,
    specialNotes: input.specialNotes,
  };
}

function jsonPayload(value: DraftPayload): Prisma.InputJsonValue {
  // The shared Zod contract admits only JSON-compatible builder state. Serializing
  // here deliberately drops undefined fields and prevents File/Blob-like values.
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toDraftDto(draft: DraftRecord): DraftDTO {
  const parsed = SaveDraftSchema.safeParse({
    ...(draft.payload as object),
    expectedRevision: 0,
  });
  if (!parsed.success) throw new DraftValidationError();
  return {
    ...payload(parsed.data),
    id: draft.id,
    revision: draft.revision,
    updatedAt: draft.updatedAt.toISOString(),
    requiresPhotoReselection: true,
  };
}

function toVersionDto(version: { id: string; draftId: string; revision: number; createdAt: Date; snapshot: unknown }): DraftVersionDTO {
  const snapshot = version.snapshot as DraftDTO;
  const parsed = SaveDraftSchema.safeParse({
    schemaVersion: snapshot.schemaVersion,
    sidemark: snapshot.sidemark,
    items: snapshot.items,
    builder: snapshot.builder,
    specialNotes: snapshot.specialNotes,
    expectedRevision: 0,
  });
  if (!parsed.success) throw new DraftValidationError();
  return {
    id: version.id,
    draftId: version.draftId,
    revision: version.revision,
    createdAt: version.createdAt.toISOString(),
    snapshot: {
      ...payload(parsed.data),
      id: snapshot.id,
      revision: snapshot.revision,
      updatedAt: snapshot.updatedAt,
      requiresPhotoReselection: true,
    },
  };
}

function scope(actor: Actor) {
  authorize(actor, 'draft:read', { organizationId: actor.organizationId, ownerId: actor.userId });
  return { userId: actor.userId, organizationId: actor.organizationId };
}

export async function getDraft(actor: Actor): Promise<DraftDTO | null> {
  const owner = scope(actor);
  const draft = await db.draft.findFirst({ where: owner });
  return draft ? toDraftDto(draft) : null;
}

export async function saveDraft(actor: Actor, input: SaveDraftInput): Promise<DraftDTO> {
  authorize(actor, 'draft:write', { organizationId: actor.organizationId, ownerId: actor.userId });
  const parsed = SaveDraftSchema.safeParse(input);
  if (!parsed.success) throw new DraftValidationError();
  const cleanInput = parsed.data;
  const owner = { userId: actor.userId, organizationId: actor.organizationId };

  try {
    return await db.$transaction(async (tx) => {
      let draft: DraftRecord;
      if (cleanInput.expectedRevision === 0) {
        const existing = await tx.draft.findFirst({ where: owner, select: { id: true } });
        if (existing) throw new DraftConflictError();
        draft = await tx.draft.create({
          data: { ...owner, revision: 1, schemaVersion: cleanInput.schemaVersion, payload: jsonPayload(payload(cleanInput)) },
        });
      } else {
        const existing = await tx.draft.findFirst({ where: owner, select: { id: true } });
        if (!existing) throw new DraftConflictError();
        const updated = await tx.draft.updateMany({
          where: { id: existing.id, revision: cleanInput.expectedRevision },
          data: { revision: { increment: 1 }, schemaVersion: cleanInput.schemaVersion, payload: jsonPayload(payload(cleanInput)) },
        });
        if (updated.count !== 1) throw new DraftConflictError();
        draft = await tx.draft.findUniqueOrThrow({ where: { id: existing.id } });
      }

      const dto = toDraftDto(draft);
      await tx.draftVersion.create({ data: { draftId: draft.id, revision: draft.revision, snapshot: jsonPayload(dto) } });
      return dto;
    });
  } catch (error) {
    if (error instanceof DraftConflictError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new DraftConflictError();
    throw error;
  }
}

function decodeCursor(cursor: string | undefined): { createdAt: Date; id: string } | undefined {
  if (!cursor) return undefined;
  const separator = cursor.lastIndexOf(':');
  const createdAt = new Date(cursor.slice(0, separator));
  const id = cursor.slice(separator + 1);
  if (separator < 0 || Number.isNaN(createdAt.valueOf()) || !id) throw new DraftValidationError();
  return { createdAt, id };
}

export async function listDraftVersions(actor: Actor, query: { cursor?: string; limit: number }): Promise<CursorPage<DraftVersionDTO>> {
  const owner = scope(actor);
  const cursor = decodeCursor(query.cursor);
  const versions = await db.draftVersion.findMany({
    where: {
      draft: owner,
      ...(cursor ? { OR: [{ createdAt: { lt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { lt: cursor.id } }] } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
  });
  const page = versions.slice(0, query.limit).map(toVersionDto);
  const next = versions[query.limit];
  return { data: page, page: { nextCursor: next ? `${next.createdAt.toISOString()}:${next.id}` : null }, requestId: '' };
}

export async function restoreDraft(actor: Actor, input: RestoreDraftInput): Promise<DraftDTO> {
  authorize(actor, 'draft:write', { organizationId: actor.organizationId, ownerId: actor.userId });
  const parsed = RestoreDraftSchema.safeParse(input);
  if (!parsed.success) throw new DraftValidationError();
  const version = await db.draftVersion.findFirst({
    where: { id: parsed.data.versionId, draft: { userId: actor.userId, organizationId: actor.organizationId } },
  });
  if (!version) throw new DraftNotFoundError();
  const snapshot = toVersionDto(version).snapshot;
  return saveDraft(actor, { ...payload(snapshot), expectedRevision: parsed.data.expectedRevision });
}

export async function deleteDraft(actor: Actor, expectedRevision: number): Promise<void> {
  authorize(actor, 'draft:write', { organizationId: actor.organizationId, ownerId: actor.userId });
  await db.$transaction(async (tx) => {
    const draft = await tx.draft.findFirst({ where: { userId: actor.userId, organizationId: actor.organizationId }, select: { id: true } });
    if (!draft) throw new DraftConflictError();
    const reserved = await tx.draft.updateMany({ where: { id: draft.id, revision: expectedRevision }, data: { revision: { increment: 1 } } });
    if (reserved.count !== 1) throw new DraftConflictError();
    await tx.draftVersion.deleteMany({ where: { draftId: draft.id } });
    await tx.draft.delete({ where: { id: draft.id } });
  });
}
