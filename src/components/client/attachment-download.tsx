'use client';
import { useState } from 'react';
import { requestJson, apiErrorMessage } from './api';
import type { DownloadDTO } from '@/contracts';

export function AttachmentDownload({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function download() {
    setPending(true); setError('');
    try { const result=await requestJson<DownloadDTO>(`/attachments/${encodeURIComponent(id)}/download`); window.location.assign(result.url); }
    catch(cause){setError(apiErrorMessage(cause));}
    finally{setPending(false);}
  }
  return <div><button type="button" disabled={pending} onClick={download}>{pending?'Opening…':name}</button>{error?<p role="alert">{error}</p>:null}</div>;
}
