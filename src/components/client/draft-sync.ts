import type { DraftDTO } from '@/contracts';
import { ClientApiError } from './api';

export type DraftSyncStatus = 'idle' | 'pending' | 'saved' | 'offline' | 'conflict' | 'error';
export type DraftChoice = 'local' | 'server' | 'review';

export function draftStorageKey(userId: string) {
  return `lux-blinds:draft:${userId}`;
}

export function storeLocalDraft(userId: string, draft: DraftDTO) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(draftStorageKey(userId), JSON.stringify(draft));
}

export function readLocalDraft(userId: string): DraftDTO | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(draftStorageKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftDTO;
  } catch {
    window.localStorage.removeItem(draftStorageKey(userId));
    return null;
  }
}

export function classifyDraft(local: DraftDTO | null, server: DraftDTO | null): DraftChoice {
  if (!local) return 'server';
  if (!server) return 'local';
  if (local.revision === server.revision && local.updatedAt === server.updatedAt) return 'server';
  return 'review';
}

export function isRevisionConflict(error: unknown) {
  return error instanceof ClientApiError && error.status === 409;
}

export function draftStatusLabel(status: DraftSyncStatus) {
  return status === 'pending' ? 'Saving draft…' : status === 'saved' ? 'Draft saved' : status === 'offline' ? 'Offline · saved on this device' : status === 'conflict' ? 'Draft conflict needs review' : status === 'error' ? 'Could not save draft' : 'Draft preview';
}
