'use client';
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <section><h1>Unable to load the administration panel</h1><p>Please retry in a moment.</p><button onClick={reset}>Retry</button><p><a href="/login">Return to sign in</a></p></section>;
}
