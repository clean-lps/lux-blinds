async (page) => {
  const images = "D:/Games/Work/quesadata/FULL Stack SISTEM/docs/evidence/references/screens/";
  const screens = ["admin-orders","admin-detail","admin-customers","admin-customer","admin-audit","admin-notifications","admin-status","admin-quote","admin-conflict","login","register-base","register-tax-exempt","verification-modal","forgot-password","dashboard-empty","dashboard-draft","new-order-empty","new-order-roller","new-order-zebra","new-order-ripple-fold","new-order-pinch-pleat","new-order-roman-shades","new-order-other","new-order-no-track","snaps-suggestion","order-multiple-models","order-review","history-empty","history-filters","profile","profile-sms-prompt","notifications","draft-conflict","form-error"];
  const sizes = [['mobile',375,800],['tablet',768,1024],['desktop',1280,900],['wide',1920,1080]];
  const errors = [];
  const requests = new Set();
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => requests.add(r.url()));
  const records = [];
  for (const screen of screens) {
    for (const [suffix,width,height] of sizes) {
      await page.setViewportSize({width,height});
      await page.goto('http://127.0.0.1:8765/?screen='+screen, {waitUntil:'load'});
      const info = await page.evaluate(() => ({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,title:document.querySelector('h1')?.textContent,synthetic:document.body.innerText.includes('MOCK DATA')}));
      const filename=screen+'-'+suffix+'.png';
      await page.screenshot({path:images+filename,fullPage:false});
      records.push({screen,suffix,file:'screens/'+filename,viewport:info,origin:screen.startsWith('admin')?'INFERRED':'SYNTHETIC',privacy:'synthetic-only'});
    }
  }
  // Full detail pages supplement, never replace, the canonical viewport screenshots.
  for(const screen of ['admin-detail','new-order-ripple-fold','register-tax-exempt']) {
    await page.setViewportSize({width:1280,height:900});
    await page.goto('http://127.0.0.1:8765/?screen='+screen);
    await page.screenshot({path:images+screen+'-desktop-full.png',fullPage:true});
  }
  const report={capturedAt:new Date().toISOString(),records,pageErrors:errors,externalRequests:[...requests].filter(u=>!u.startsWith('http://127.0.0.1:8765/')),overflow:records.filter(r=>r.viewport.scrollWidth>r.viewport.width),note:'Visual reference checks only; not production QA. Canonical dimensions are CSS viewport at DPR 1.'};
  return report;
}

