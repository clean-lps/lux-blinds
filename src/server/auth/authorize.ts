import type { Actor } from '@/contracts/auth';

export type AuthorizationAction =
  | 'profile:read'
  | 'draft:read'
  | 'draft:write'
  | 'order:create'
  | 'order:read'
  | 'order:correct'
  | 'order:status'
  | 'note:write'
  | 'audit:read'
  | 'quote:write'
  | 'tax:review'
  | 'role:change'
  | 'notification:read';

export type AuthorizationResource = { organizationId: string; ownerId?: string };

export class AuthorizationError extends Error {
  readonly status = 403;
  constructor() {
    super('Forbidden');
  }
}

export class ResourceNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('Not found');
  }
}

const CLIENT_ACTIONS = new Set<AuthorizationAction>([
  'profile:read',
  'draft:read',
  'draft:write',
  'order:create',
  'order:read',
  'notification:read',
]);

const OPERATOR_ACTIONS = new Set<AuthorizationAction>([
  'profile:read',
  'order:read',
  'order:correct',
  'order:status',
  'note:write',
  'audit:read',
  'quote:write',
  'notification:read',
]);

export function authorize(actor: Actor, action: AuthorizationAction, resource: AuthorizationResource): void {
  if (actor.role === 'admin') return;

  if (actor.role === 'operator') {
    if (OPERATOR_ACTIONS.has(action)) return;
    throw new AuthorizationError();
  }

  if (resource.organizationId !== actor.organizationId) throw new ResourceNotFoundError();
  if (CLIENT_ACTIONS.has(action)) return;
  throw new AuthorizationError();
}
