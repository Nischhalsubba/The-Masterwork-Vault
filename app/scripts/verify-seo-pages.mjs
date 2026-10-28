import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
const root=path.resolve('dist')
const base='https://neverwintermastercraft.netlify.app'
const xml=await readFile(path.join(root,'sitemap.xml'),'utf8')
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1])
if(urls.length<10)throw Error('Sitemap has too few real reference pages: '+urls.length)
if(new Set(urls).size!==urls.length)throw Error('Duplicate sitemap URLs')
for(const u of urls){
 if(!u.startsWith(base+'/')&&u!==base+'/catalog')throw Error('Unexpected sitemap origin: '+u)
 if(!u.startsWith(base+'/guides/'))continue
 const p=new URL(u).pathname
 const file=path.join(root,p.slice(1),'index.html')
 const html=await readFile(file,'utf8')
 if(!html.includes('<h1>')||!html.includes('rel="canonical" href="'+u+'"')||!html.includes('"@type":"BreadcrumbList"'))throw Error('Missing rendered metadata or heading: '+p)
 if(html.includes('<meta name="robots" content="noindex'))throw Error('Indexable guide marked noindex: '+p)
 if(html.includes('src="/assets/index-'))throw Error('Guide shipped the main React JavaScript: '+p)
}
const guides=await readdir(path.join(root,'guides'))
if(!guides.includes('guide.css')||!guides.includes('materials')||!guides.includes('recipes'))throw Error('SEO directory missing')
for(const p of ['/guides/','/guides/recipes/','/guides/materials/']){
 if(!urls.includes(base+p))throw Error('Missing directory from sitemap: '+p)
}
console.log('SEO validation: '+urls.length+' unique URLs; all generated guide HTML contains title, heading, canonical and BreadcrumbList; no app JavaScript in static guides.')
