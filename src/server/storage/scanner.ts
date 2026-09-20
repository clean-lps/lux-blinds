import { connect } from 'node:net';

export type ScanStatus = 'clean' | 'rejected';

const EICAR = Buffer.from('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');

/** Deterministic local gate: empty files and the EICAR test string are always rejected. */
function localGate(bytes: Buffer): ScanStatus | null {
  if (bytes.length === 0 || bytes.includes(EICAR)) return 'rejected';
  return null;
}

/** Optional ClamAV INSTREAM scan (AV_PROVIDER=clamav, AV_HOST, AV_PORT). Returns null when unavailable. */
function clamavScan(bytes: Buffer): Promise<ScanStatus | null> {
  const host = process.env.AV_HOST ?? '127.0.0.1';
  const port = Number(process.env.AV_PORT ?? 3310);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 8000);
    const socket = connect(port, host, () => {
      socket.write(Buffer.from('zINSTREAM\0'));
      const size = Buffer.alloc(4);
      size.writeUInt32BE(bytes.length, 0);
      socket.write(size);
      socket.write(bytes);
      const end = Buffer.alloc(4);
      socket.write(end);
    });
    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
      if (data.includes('OK')) {
        clearTimeout(timer);
        socket.destroy();
        resolve('clean');
      } else if (data.includes('FOUND')) {
        clearTimeout(timer);
        socket.destroy();
        resolve('rejected');
      }
    });
    socket.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
    socket.on('timeout', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(null);
    });
  });
}

/**
 * Quarantine scanner. AV_PROVIDER=clamav consults a ClamAV daemon first;
 * otherwise (or when the daemon is unreachable) the deterministic local gate
 * applies. Production deployments handling untrusted uploads should set
 * AV_PROVIDER=clamav with a reachable daemon.
 */
export async function scanQuarantinedObject(bytes: Buffer): Promise<ScanStatus> {
  if (process.env.AV_PROVIDER === 'clamav') {
    const verdict = await clamavScan(bytes);
    if (verdict) return verdict;
  }
  return localGate(bytes) ?? 'clean';
}
