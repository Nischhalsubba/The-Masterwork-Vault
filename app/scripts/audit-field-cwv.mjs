/**
 * Attempt real-user CrUX field metrics through PageSpeed Insights.
 * Lab Lighthouse values are never used as substitutes for field LCP/INP/CLS.
 * Optional PAGESPEED_API_KEY is read from the runner environment only.
 */
import {mkdir, writeFile} from 'node:fs/promises'
import {queryPageSpeedField} from './lib/page-speed-field.mjs'

const origin='https://neverwintermastercraft.netlify.app'
const results=[]
for(const path of ['/catalog','/guides/']){
  for(const strategy of ['mobile','desktop']){
    const record=await queryPageSpeedField({
      target: origin+path,
      strategy,
      apiKey: process.env.PAGESPEED_API_KEY,
      maxRetries: 1,
    })
    results.push(record)
    console.log(JSON.stringify(record))
  }
}
await mkdir('field-vitals-results',{recursive:true})
await writeFile('field-vitals-results/summary.json',JSON.stringify({
  collectedAt:new Date().toISOString(),
  kind:'Public real-user CrUX percentiles when available; NOT Lighthouse lab measurements',
  note:'Rate limiting, insufficient traffic, and access failures remain distinct. PSI CLS percentile units represent score × 100; do not treat the raw percentile as a normalized CLS score. Field INP cannot be inferred from TBT.',
  results,
},null,2)+'\n')
