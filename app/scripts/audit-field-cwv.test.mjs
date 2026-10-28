import test from 'node:test'
import assert from 'node:assert/strict'
import {auditFieldVitals} from './audit-field-cwv.mjs'
const response=(status,data={},headers={})=>({ok:status===200,status,headers:{get:key=>headers[key]??null},json:async()=>data})
const audit=(fetchImpl,extras={})=>auditFieldVitals({paths:['/catalog'],strategies:['mobile'],maxAttempts:1,fetchImpl,...extras})
test('reports URL-level p75 without borrowing missing metrics from origin',async()=>{
 const report=await audit(async()=>response(200,{loadingExperience:{id:'test-url',metrics:{LARGEST_CONTENTFUL_PAINT_MS:{percentile:2300}}},originLoadingExperience:{metrics:{INTERACTION_TO_NEXT_PAINT:{percentile:180}}}}))
 const result=report.results[0]
 assert.equal(result.status,'available')
 assert.equal(result.scope,'url')
 assert.equal(result.metrics.LARGEST_CONTENTFUL_PAINT_MS,2300)
 assert.equal(result.metrics.INTERACTION_TO_NEXT_PAINT,null)
})
test('uses explicitly labeled origin-level fallback',async()=>{
 const result=(await audit(async()=>response(200,{loadingExperience:{metrics:{}},originLoadingExperience:{id:'test-origin',metrics:{INTERACTION_TO_NEXT_PAINT:{percentile:190}}}}))).results[0]
 assert.equal(result.scope,'origin')
 assert.equal(result.metrics.INTERACTION_TO_NEXT_PAINT,190)
})
test('reports insufficient data rather than zero',async()=>{
 assert.equal((await audit(async()=>response(200))).results[0].status,'insufficient-data')
})
test('bounded retry on 429, then recover',async()=>{
 let calls=0
 const delays=[]
 const result=(await audit(async()=>++calls===1?response(429,{}, {'retry-after':'2'}):response(200),{maxAttempts:2,sleepImpl:async ms=>delays.push(ms)})).results[0]
 assert.equal(result.status,'insufficient-data')
 assert.equal(result.attempts,2)
 assert.deepEqual(delays,[2000])
})
test('persistent rate limiting remains explicit',async()=>{
 const result=(await audit(async()=>response(429),{maxAttempts:2,sleepImpl:async()=>{}})).results[0]
 assert.equal(result.status,'rate-limited')
 assert.equal(result.httpStatus,429)
})
test('API key is not written to diagnostic result',async()=>{
 const report=await audit(async endpoint=>{assert.match(endpoint,/key=secret-value/);throw Error('request failed')},{apiKey:'secret-value'})
 assert.doesNotMatch(JSON.stringify(report),/secret-value/)
})
