/**
 * Live HTTP audit of deployed indexable pages.
 * SEO_LIVE_URL sets the live origin; this deliberately cannot be satisfied
 * by checking dist/ alone. Google indexing/ownership remain separate.
 */
const base=new URL(process.env.SEO_LIVE_URL||'https://neverwintermastercraft.netlify.app')
const origin=base.origin
const timeout=15000
const errors=[],observed=[]
const fetchText=async (p,retries=2)=>{
 for(let attempt=0;attempt<=retries;attempt++){
  try{
   const res=await fetch(origin+p,{redirect:'follow',signal:AbortSignal.timeout(timeout),headers:{'User-Agent':'MasterworkVault-SEO-validation/1.0'}})
   const body=await res.text()
   if(res.status>=500&&attempt<retries)continue
   return {res,body}
  }catch(e){
   if(attempt===retries)throw e
   await new Promise(resolve=>setTimeout(resolve,(attempt+1)*1000))
  }
 }
 throw Error('Request not completed: '+p)
}
const check=async (p,indexable=true)=>{
 try {
  const {res,body}=await fetchText(p)
  if(res.status!==200)errors.push({path:p,status:res.status})
  if(!res.headers.get('content-type')?.includes('text/html'))errors.push({path:p,error:'Non-HTML content type'})
  if(indexable && !body.includes('<h1>') && p.startsWith('/guides/'))errors.push({path:p,error:'Missing heading'})
  if(p.startsWith('/guides/')){
   const canonical=body.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
   if(canonical!==origin+p)errors.push({path:p,error:'Canonical mismatch '+canonical})
   if(!body.includes('application/ld+json'))errors.push({path:p,error:'Missing structured data'})
   if(/<meta name="robots" content="noindex/.test(body))errors.push({path:p,error:'Guide unexpectedly noindex'})
  }
  observed.push(p)
 } catch(e){errors.push({path:p,error:e.message})}
}
const xml=await fetchText('/sitemap.xml')
if(xml.res.status!==200||!xml.body.includes('<urlset'))throw Error('Live sitemap missing or inaccessible: HTTP '+xml.res.status)
const paths=[...xml.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname)
if(paths.length<180)throw Error('Live sitemap does not contain expected generated guides; saw '+paths.length)
const dedup=new Set(paths)
if(dedup.size!==paths.length)throw Error('Duplicate live sitemap URLs')
const concurrent=8
for(let i=0;i<paths.length;i+=concurrent){
 await Promise.all(paths.slice(i,i+concurrent).map(p=>check(p)))
}
for(const p of ['/robots.txt','/not-a-real-masterwork-page-404']){
 try{
  const {res,body}=await fetchText(p)
  if(p==='/robots.txt'&&(!body.includes('Sitemap:')||res.status!==200))errors.push({path:p,error:'robots.txt missing live sitemap'})
  if(p.includes('404')&&res.status!==404)errors.push({path:p,error:'Unknown URL is a soft 404; received '+res.status})
 }catch(e){errors.push({path:p,error:e.message})}
}
const result={origin,checked:observed.length,liveSitemapUrls:paths.length,failed:errors.length,errors:errors.slice(0,75),checkedAt:new Date().toISOString(),note:'HTTP audit, not Google Search Console indexing or CrUX field data'}
console.log(JSON.stringify(result,null,2))
if(errors.length)process.exit(1)
