import { S3Client, HeadBucketCommand, GetBucketCorsCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
const client = new S3Client({ endpoint:process.env.STORAGE_ENDPOINT||process.env.AWS_ENDPOINT_URL_S3,region:process.env.STORAGE_REGION||'us-east-2',forcePathStyle:true,
  credentials:{accessKeyId:process.env.STORAGE_ACCESS_KEY_ID||process.env.AWS_ACCESS_KEY_ID||'',secretAccessKey:process.env.STORAGE_SECRET_ACCESS_KEY||process.env.AWS_SECRET_ACCESS_KEY||''},maxAttempts:1 });
async function main(){
  const buckets = await client.send(new ListBucketsCommand({}));
  console.log('Buckets available on the configured branch:', buckets.Buckets?.map(bucket=>bucket.Name).join(', ') || '(none)');
  await client.send(new HeadBucketCommand({Bucket:process.env.STORAGE_BUCKET}));
  console.log('Storage bucket access: OK');
  const cors=await client.send(new GetBucketCorsCommand({Bucket:process.env.STORAGE_BUCKET}));
  const origin=process.env.APP_ORIGIN;
  const allowed=cors.CORSRules?.some(rule=>rule.AllowedMethods?.includes('PUT')&&rule.AllowedOrigins?.some(value=>value==='*'||value===origin)&&rule.AllowedHeaders?.some(value=>value==='*'||value.toLowerCase()==='content-type'));
  if(!allowed)throw new Error('CORS');
  console.log('Storage CORS allows configured APP_ORIGIN to upload: OK');
}
main().catch(error=>{console.error('Storage check failed:',error.name,'HTTP status:',error.$metadata?.httpStatusCode??'unavailable');process.exitCode=1;}).finally(()=>client.destroy());
