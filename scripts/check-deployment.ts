/** Read-only application smoke test. Creates and closes only its own login session. */
async function main() {
  const origin = process.env.APP_ORIGIN;
  if (!origin || !process.env.INITIAL_ADMIN_EMAIL || !process.env.INITIAL_ADMIN_PASSWORD) throw new Error('Deployment configuration missing');
  const response=await fetch(`${origin}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email:process.env.INITIAL_ADMIN_EMAIL,password:process.env.INITIAL_ADMIN_PASSWORD}),signal:AbortSignal.timeout(30000)});
  console.log('Deployed admin login HTTP:',response.status);
  if(!response.ok){process.exitCode=1;return;}
  const cookie=response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  if(!cookie)throw new Error('Login returned no session cookie');
  try {
    for(const path of ['/admin-orders','/api/v1/admin/orders','/api/v1/admin/customers']) {
      const result=await fetch(`${origin}${path}`,{headers:{Cookie:cookie},redirect:'manual',signal:AbortSignal.timeout(30000)});
      const isJson=result.headers.get('content-type')?.includes('application/json');
      const data=isJson?await result.json():null;
      console.log(path,'HTTP:',result.status,'records:',Array.isArray(data?.data)?data.data.length:'n/a','redirect:',result.headers.get('location')??'none');
      if(!result.ok)process.exitCode=1;
    }
  } finally {
    await fetch(`${origin}/api/v1/auth/logout`,{method:'POST',headers:{Cookie:cookie,Origin:origin},signal:AbortSignal.timeout(30000)});
  }
}
main().catch(()=>{console.error('Deployment verification could not finish; no credentials were logged.');process.exitCode=1;});
