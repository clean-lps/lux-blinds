'use client';
export default function ClientError({ reset }: { error: Error; reset: () => void }) {
  return <main style={{padding:32}}><h1>We could not load your account</h1><p>No sample data is displayed. Please retry in a moment.</p><button onClick={reset}>Retry</button><p><a href="/login">Return to sign in</a></p></main>;
}
