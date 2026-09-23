import { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = process.env.STORAGE_BUCKET;
const isNeonStorage = process.env.STORAGE_PROVIDER === 'neon';
const region = process.env.STORAGE_REGION ?? (isNeonStorage ? 'us-east-2' : process.env.AWS_REGION ?? 'us-east-1');
const endpoint = process.env.STORAGE_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || undefined;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

let client: S3Client | null = null;

export function isS3Configured(): boolean {
  return (
    (process.env.STORAGE_PROVIDER === 's3' || isNeonStorage) &&
    !!bucket &&
    !!accessKeyId &&
    !!secretAccessKey
  );
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region,
      endpoint,
      forcePathStyle: !!endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }
  return client;
}

export async function presignPut(storageKey: string, mediaType: string, expiresInSeconds = 300): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: bucket!, Key: storageKey, ContentType: mediaType }),
    { expiresIn: expiresInSeconds }
  );
}

export async function presignGet(storageKey: string, expiresInSeconds = 60): Promise<string> {
  return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: bucket!, Key: storageKey }), {
    expiresIn: expiresInSeconds,
  });
}

export async function headObject(storageKey: string): Promise<{ byteSize: number; mediaType?: string } | null> {
  try {
    const out = await getClient().send(new HeadObjectCommand({ Bucket: bucket!, Key: storageKey }));
    return { byteSize: out.ContentLength ?? -1, mediaType: out.ContentType };
  } catch {
    return null;
  }
}

/** Download an object (bounded) so the malware scanner can inspect real bytes. */
export async function getObjectBytes(storageKey: string, maxBytes = 25 * 1024 * 1024): Promise<Buffer | null> {
  try {
    const out = await getClient().send(new GetObjectCommand({ Bucket: bucket!, Key: storageKey }));
    const body = out.Body as unknown as AsyncIterable<Uint8Array> | undefined;
    if (!body || typeof (body as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] !== 'function') return null;
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      total += chunk.length;
      if (total > maxBytes) return null;
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}
