import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireActor, UnauthorizedError } from './session';

export async function pageActor() {
  try { return await requireActor({ headers: await headers() }); }
  catch (error) { if (error instanceof UnauthorizedError) redirect('/login'); throw error; }
}
