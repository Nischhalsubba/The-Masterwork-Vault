/**
 * Reports synthetic/lab results. Lighthouse cannot measure field INP.
 * Requires actual measured CrUX/Search Console data for field CWV.
 */
import {readFile,readdir,writeFile} from 'node:fs/promises'
import path from 'node:path'
const dir=path.resolve(process.argv[2]||'lighthouse-results')
const files=(await readdir(dir)).filter(x=>/-mobile\.json$|-desktop\.json$/.test(x)).sort()
if(files.length<6)throw Error('Expected all 6 mobile/desktop Lighthouse results; found '+files.length)
const metric=(data,id)=>data.audits?.[id]?.numericValue??null
const records=[]
for(const name of files){
 const data=JSON.parse(await readFile(path.join(dir,name),'utf8'))
 if(data.runtimeError?.code)throw Error(name+': '+data.runtimeError.code)
 const record={
  page:name.replace(/-(mobile|desktop)\.json$/,''),
  device:name.includes('-mobile')?'mobile':'desktop',
  performanceScore:Math.round((data.categories?.performance?.score??0)*100),
  seoScore:Math.round((data.categories?.seo?.score??0)*100),
  accessibilityScore:Math.round((data.categories?.accessibility?.score??0)*100),
  lcpMs:metric(data,'largest-contentful-paint'),
  cls:metric(data,'cumulative-layout-shift'),
  tbtMs:metric(data,'total-blocking-time'),
  fcpMs:metric(data,'first-contentful-paint'),
  measuredAt:new Date().toISOString(),
  INP:'Not available from Lighthouse lab runs; collect CrUX/field data',
 }
 if(record.lcpMs===null||record.cls===null)throw Error('Missing LCP or CLS in '+name)
 records.push(record)
 console.log(name+': Performance '+record.performanceScore+', SEO '+record.seoScore+', Accessibility '+record.accessibilityScore+', LCP '+Math.round(record.lcpMs)+'ms, CLS '+record.cls.toFixed(3)+', TBT '+Math.round(record.tbtMs||0)+'ms')
}
await writeFile(path.join(dir,'summary.json'),JSON.stringify({
 kind:'Synthetic Lighthouse lab measurements, NOT real-user field Core Web Vitals',
 note:'INP requires real-user interactions and CrUX/Search Console data; never substitute TBT for a field INP claim.',
 records,
},null,2))
console.log('Lighthouse lab audit completed for '+records.length+' route/device combinations')
