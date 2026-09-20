import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/contracts/api';
import { auth } from '@/server/auth/session';

function requestId(request: Request): string {
  return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

function json(body: ApiResponse<{ success: true }>, headers?: Headers): NextResponse<ApiResponse<{ success: true }>> {
  const response = NextResponse.json(body, { status: 200 });
  headers?.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') response.headers.set(key, value);
  });
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] } | undefined)?.getSetCookie;
  for (const cookie of getSetCookie?.call(headers) ?? []) response.headers.append('set-cookie', cookie);
  return response;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ success: true }>>> {
  const id = requestId(request);
  try {
    const result = await auth.api.signOut({ headers: request.headers, returnHeaders: true });
    return json({ data: { success: true }, requestId: id }, result.headers);
  } catch {
    // Logout is deliberately idempotent and does not expose whether a session existed.
    return json({ data: { success: true }, requestId: id });
  }
}
