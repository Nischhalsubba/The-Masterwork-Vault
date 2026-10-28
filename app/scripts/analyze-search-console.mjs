/**
 * Simple offline Search Console performance export analyst.
 * Usage: node scripts/analyze-search-console.mjs /path/to/Pages.csv
 * Prints real supplied metrics only; never invents search traffic.
 */
import { readFile } from 'node:fs/promises'
const filename=process.argv[2]
if(!filename) {
  console.error('Provide a Google Search Console Performance > Pages CSV export.')
  process.exit(2)
}
const text=await readFile(filename,'utf8')
const parse=(source)=>{
  const rows=[];let row=[],cell='',quoted=false
  for(let i=0;i<source.length;i++){
    const c=source[i]
    if(quoted){
      if(c==='"'&&source[i+1]==='"'){cell+='"';i++}
      else if(c==='"')quoted=false
      else cell+=c
    }else if(c==='"')quoted=true
    else if(c===','){row.push(cell);cell=''}
    else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}
    else cell+=c
  }
  if(cell||row.length){row.push(cell);rows.push(row)}
  return rows
}
const rows=parse(text.replace(/^\uFEFF/,''))
if(!rows.length)throw Error('CSV is empty')
const header=rows.shift().map(x=>x.trim().toLowerCase())
const column=name=>header.findIndex(x=>x===name)
const pageCol=Math.max(column('top pages'),column('pages'),column('page'))
const clicksCol=column('clicks'),impCol=column('impressions')
const ctrCol=column('ctr'),positionCol=column('position')
if(pageCol<0||clicksCol<0||impCol<0)throw Error('Expected Pages, Clicks, Impressions columns from Search Console.')
const number=x=>Number(String(x||'').replace(/[,%]/g,''))||0
const data=rows.filter(r=>r.length>=3&&/^https?:\/\//.test(r[pageCol]||'')).map(r=>({
  page:r[pageCol], clicks:number(r[clicksCol]), impressions:number(r[impCol]),
  ctr:ctrCol>=0?number(r[ctrCol]):null, position:positionCol>=0?number(r[positionCol]):null,
}))
const totals=data.reduce((acc,x)=>({clicks:acc.clicks+x.clicks,impressions:acc.impressions+x.impressions}),{clicks:0,impressions:0})
const areas=[['Recipe guides','/guides/recipes/'],['Material guides','/guides/materials/'],['Catalog','/catalog'],['Other pages','']]
for(const [label,prefix] of areas){
 const group=data.filter(x=>prefix?x.page.includes(prefix):!areas.slice(0,3).some(a=>x.page.includes(a[1])))
 const clicks=group.reduce((a,b)=>a+b.clicks,0),impressions=group.reduce((a,b)=>a+b.impressions,0)
 console.log(label+': '+group.length+' URLs, '+impressions+' impressions, '+clicks+' clicks, '+(impressions?((clicks/impressions)*100).toFixed(2):'0.00')+'% CTR')
}
console.log('Reported total: '+totals.impressions+' impressions / '+totals.clicks+' clicks')
const opportunities=data.filter(x=>x.impressions>=20).sort((a,b)=>b.impressions-a.impressions).slice(0,10)
console.log('\nHigh-impression pages to examine:')
for(const x of opportunities)console.log(String(x.impressions).padStart(7)+' impr · '+String(x.clicks).padStart(5)+' clicks · '+x.page)
console.log('\nThis is an analysis of the supplied export only; date filters, anonymization and Search Console sampling still apply.')
