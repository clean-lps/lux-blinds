import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/session';
import { LoginSchema, RoleSchema, type SafeUser } from '@/contracts/auth';
import type { ApiError, ApiResponse } from '@/contracts/api';

function requestId(request: Request): string {
  return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string[]> {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path.join('.') || 'body';
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

function safeUser(user: { id: string; email: string; name: string; emailVerified: boolean; role?: unknown }): SafeUser {
  const role = RoleSchema.safeParse(user.role);
  if (!role.success) throw new Error('Invalid user role');
  return { id: user.id, email: user.email, name: user.name, role: role.data, verified: user.emailVerified };
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  if (code === 'P1001' || code === 'P2021' || code === 'P2022') return true;
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
  return message.includes('Error connecting to database') || message.includes('Can\'t reach database server') || message.includes('does not exist');
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<SafeUser> | ApiError>> {
  const id = requestId(request);
  const payload = await request.json().catch(() => undefined);
  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({
      error: { code: 'INVALID_INPUT', message: 'Invalid request', fieldErrors: fieldErrors(parsed.error.issues), retryable: false },
      requestId: id,
    }, { status: 400 });
  }

  try {
    const result = await auth.api.signInEmail({
      body: parsed.data,
      headers: new Headers(request.headers),
      returnHeaders: true,
    });

    const response = NextResponse.json(
      { data: safeUser(result.response.user), requestId: id },
      { status: 200 }
    );

    const resultHeaders = result.headers as any;
    if (resultHeaders && typeof resultHeaders.getSetCookie === 'function') {
      for (const cookie of resultHeaders.getSetCookie()) {
        response.headers.append('set-cookie', cookie);
      }
    } else if (resultHeaders && typeof resultHeaders.forEach === 'function') {
      resultHeaders.forEach((value: string, key: string) => {
        if (key.toLowerCase() === 'set-cookie') {
          response.headers.append('set-cookie', value);
        }
      });
    }

    return response;
  } catch (error: any) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Authentication service is temporarily unavailable', retryable: true },
        requestId: id,
      }, { status: 503 });
    }
    return NextResponse.json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', retryable: false },
      requestId: id,
    }, { status: 401 });
  }
}
