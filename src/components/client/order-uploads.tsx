'use client';

import { useState, type ChangeEvent } from 'react';
import type { UploadIntentDTO } from '@/contracts';
import { apiErrorMessage } from './api';
import { orderApi } from './order-api';
import styles from './client-ui.module.css';

export type PendingUpload = { id: string; file: File; progress: number; status: 'pending' | 'selected' | 'uploading' | 'uploaded' | 'failed'; intent?: UploadIntentDTO; error?: string };

async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function OrderUploads({ value, onChange, requiresReselection = false }: { value: PendingUpload[]; onChange: (files: PendingUpload[]) => void; requiresReselection?: boolean }) {
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(entry: PendingUpload) {
    onChange(value.map((f) => f.id === entry.id ? { ...f, status: 'uploading', progress: 50 } : f));
    try {
      const sha256 = await sha256Hex(entry.file);
      const intent = await orderApi.createUploadIntent({
        purpose: 'order_photo',
        name: entry.file.name,
        mediaType: (entry.file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp',
        byteSize: entry.file.size,
        sha256,
      });
      const response = await fetch(intent.url, { method: intent.method, headers: intent.headers, body: entry.file });
      if (!response.ok) throw new Error(`Upload failed (${response.status})`);
      await orderApi.completeUpload(intent.attachmentId, sha256);
      onChange(value.map((f) => f.id === entry.id ? { ...f, status: 'uploaded', progress: 100, intent } : f));
    } catch (uploadError) {
      onChange(value.map((f) => f.id === entry.id ? { ...f, status: 'failed', error: apiErrorMessage(uploadError) } : f));
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = Array.from(event.target.files ?? []);
    if (value.length + selected.length > 20) {
      setError('You can attach up to 20 photos to one order.');
      return;
    }
    const next = selected.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${index}`, file, progress: 0, status: 'selected' as const }));
    onChange([...value, ...next]);
    event.target.value = '';
  }

  return (
    <div className={styles.upload}>
      <label className={styles.label} htmlFor="orderPhotos">Photos</label>
      {requiresReselection ? <div className={styles.info}><p>Photos are not stored in the restored draft. Select them again before submitting.</p></div> : null}
      <input id="orderPhotos" className={styles.file} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleChange} />
      {error ? <p className={styles.fieldError}>{error}</p> : null}
      {value.length ? (
        <ul className={styles.list} aria-label="Selected photos">
          {value.map((entry) => (
            <li className={styles.listItem} key={entry.id}>
              <div className={styles.listItemMain}>
                <strong>{entry.file.name}</strong>
                <p className={styles.listItemMeta}>{Math.ceil(entry.file.size / 1024)} KB · {entry.status === 'uploaded' ? 'Uploaded' : entry.status === 'uploading' ? 'Uploading…' : entry.status === 'failed' ? `Failed: ${entry.error ?? 'Unknown error'}` : 'Ready to upload'}</p>
              </div>
              <div className={styles.buttonRow}>
                {entry.status === 'selected' ? <button className={styles.buttonSecondary} type="button" onClick={() => handleUpload(entry)}>Upload</button> : null}
                <button className={styles.buttonSecondary} type="button" onClick={() => onChange(value.filter((file) => file.id !== entry.id))}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
