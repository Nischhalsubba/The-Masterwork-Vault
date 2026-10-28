/**
 * Attempt public CrUX field CWV retrieval using the PageSpeed Insights API.
 * Report absence of field data explicitly; never substitute Lighthouse/TBT.
 * API can be rate limited without a key.
 */
import {mkdir,writeFile} from 'node:fs/promises'
const origin='https://neverwintermastercraft.netlify.app'
const paths=['/catalog','/guides/']
const results=[]
const metrics=['LARGEST_CONTENTFUL_PAINT_MS','INTERACTION_TO_NEXT_PAINT','CUMULATIVE_LAYOUT_SHIFT_SCORE']
for(const path of paths)for(const strategy of ['mobile','desktop']){
 const target=origin+path
 const params=new URLSearchParams({url:target,strategy,category:'performance'})
 let record={url:target,strategy,source:'CrUX/PageSpeed Insights',status:'unavailable',metrics:{}}
 try{
  const response=await fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?'+params,{signal:AbortSignal.timeout(30000)})
  if(!response.ok)throw Error('API HTTP '+response.status)
  const json=await response.json()
  const field=json.loadingExperience?.metrics || json.originLoadingExperience?.metrics || null
  if(field){
   record.status='field-data'
   record.scope=json.loadingExperience?.metrics?'URL-level if available':'origin-level'
   for(const name of metrics)record.metrics[name]=field[name]?.percentile??null
  }else record.status='insufficient-public-field-data'
 }catch(e){record.status='unavailable';record.reason=e.message}
 results.push(record)
 console.log(JSON.stringify(record))
}
await mkdir('field-vitals-results',{recursive:true})
await writeFile('field-vitals-results/summary.json',JSON.stringify({note:'Real-user CrUX field data if available. If absent, no field metric is asserted.',results},null,2))
