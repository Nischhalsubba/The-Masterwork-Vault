/** Collect real-user CrUX field metrics; never substitute Lighthouse/TBT for field INP. */
import {mkdir,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
const origin='https://neverwintermastercraft.netlify.app'
const metrics=['LARGEST_CONTENTFUL_PAINT_MS','INTERACTION_TO_NEXT_PAINT','CUMULATIVE_LAYOUT_SHIFT_SCORE']
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
export async function auditFieldVitals({paths=['/catalog','/guides/'],strategies=['mobile','desktop'],fetchImpl=fetch,sleepImpl=sleep,maxAttempts=3,apiKey=process.env.PAGESPEED_API_KEY}={}){
 const results=[]
 for(const pathname of paths)for(const strategy of strategies){
  const url=new URL(pathname,origin).href
  const params=new URLSearchParams({url,strategy,category:'performance'})
  if(apiKey)params.set('key',apiKey)
  const record={url,strategy,source:'PageSpeed Insights / CrUX',status:'unavailable',scope:null,metrics:{},attempts:0}
  for(let attempt=1;attempt<=maxAttempts;attempt++){
   record.attempts=attempt
   try{
    const response=await fetchImpl('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?'+params,{signal:AbortSignal.timeout(30000)})
    if(!response.ok){
     record.httpStatus=response.status
     record.status=response.status===429?'rate-limited':response.status===403?'access-denied':'http-error'
     if((response.status===429||response.status>=500)&&attempt<maxAttempts){
      const retryAfter=Number(response.headers?.get?.('retry-after'))
      await sleepImpl(Number.isFinite(retryAfter)&&retryAfter>0?Math.min(retryAfter*1000,15000):Math.min(1000*2**(attempt-1),4000))
      continue
     }
     break
    }
    const json=await response.json()
    const urlMetrics=json.loadingExperience?.metrics
    const originMetrics=json.originLoadingExperience?.metrics
    const field=urlMetrics&&Object.keys(urlMetrics).length?urlMetrics:originMetrics&&Object.keys(originMetrics).length?originMetrics:null
    if(field){
     record.status='available'
     record.scope=field===urlMetrics?'url':'origin'
     record.metrics=Object.fromEntries(metrics.map(name=>[name,field[name]?.percentile??null]))
     record.fieldId=field===urlMetrics?json.loadingExperience?.id??null:json.originLoadingExperience?.id??null
    }else record.status='insufficient-data'
    delete record.httpStatus
    break
   }catch(error){
    record.status=error?.name==='TimeoutError'||error?.name==='AbortError'?'timeout':'network-error'
    record.reason=String(error?.message??error).slice(0,200)
    if(attempt<maxAttempts){await sleepImpl(Math.min(1000*2**(attempt-1),4000));continue}
   }
  }
  results.push(record)
 }
 return {source:'CrUX field data via PageSpeed Insights',collectedAt:new Date().toISOString(),note:'Field data may be absent or origin-level. TBT is a lab metric and never replaces INP.',results}
}
async function main(){
 const report=await auditFieldVitals()
 await mkdir('field-vitals-results',{recursive:true})
 await writeFile('field-vitals-results/summary.json',JSON.stringify(report,null,2)+'\n')
 for(const result of report.results)console.log(JSON.stringify(result))
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error);process.exitCode=1})
