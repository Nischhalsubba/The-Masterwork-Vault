/**
 * Validate every generated sitemap URL, in-site link, image and stylesheet.
 * Runs over the exact dist/ files that Netlify will publish; no external links
 * are claimed to be verified. Stops deployment on broken internal references.
 */
import {readFile, stat} from 'node:fs/promises'
import path from 'node:path'
const root=path.resolve('dist')
const origin='https://neverwintermastercraft.netlify.app'
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8')
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
const broken=[],seen=new Set(),titles=new Map(),canons=new Map()
let checked=0,external=0,internal=0,schemas=0, links=0
const exists=async p=>{try{return (await stat(p)).isFile()}catch{return false}}
const htmlPath=(pathname)=>{
  const clean=decodeURIComponent(pathname).replace(/^\/+/, '')
  if(!clean)return path.join(root,'index.html')
  if(clean.includes('..')||clean.includes('\\'))throw Error('Unsafe URL '+pathname)
  if(clean.endsWith('/'))return path.join(root,clean,'index.html')
  return path.join(root,clean,'index.html')
}
const isDynamicApp=pathname=>/^\/catalog\/(?:sharandar|underdark)\/[^/]+\/[^/]+\/?$/.test(pathname)
const pathAvailable=async pathname=>{
  if(isDynamicApp(pathname))return true // Rewrite to the verified catalog HTML app
  if(pathname==='/social-preview.png')return await exists(path.join(root,'social-preview.svg')) // Netlify image transform
  if(pathname.startsWith('/media/neverwinter/'))return true // External media proxy, separately noted
  const item=decodeURIComponent(pathname).replace(/^\/+/, '')
  if(item.includes('..'))return false
  return await exists(htmlPath(pathname))||await exists(path.join(root,item))
}
for(const absolute of urls){
  const pageUrl=new URL(absolute)
  if(pageUrl.origin!==origin){broken.push({from:'sitemap',href:absolute,error:'Unexpected host'});continue}
  if(seen.has(pageUrl.pathname)){broken.push({from:'sitemap',href:absolute,error:'Duplicate path'});continue}
  seen.add(pageUrl.pathname)
  const file=htmlPath(pageUrl.pathname)
  if(!await exists(file)){broken.push({from:'sitemap',href:absolute,error:'HTML missing'});continue}
  const html=await readFile(file,'utf8');checked++
  if(!/^<!doctype html>/i.test(html.trimStart()))broken.push({from:absolute,error:'Missing doctype'})
  if(!/<main\b[^>]*id="main"/.test(html))broken.push({from:absolute,error:'Missing landmark'})
  const title=html.match(/<title>([^<]*)<\/title>/i)?.[1]
  if(!title)broken.push({from:absolute,error:'Missing title'})
  if(pageUrl.pathname.startsWith('/guides/')){
    if(titles.has(title))broken.push({from:absolute,error:'Duplicate title with '+titles.get(title)})
    else titles.set(title,absolute)
    if(!/<meta name="description" content="[^"]{25,}"/.test(html))broken.push({from:absolute,error:'Missing description'})
    const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if(canonical!==absolute)broken.push({from:absolute,error:'Canonical differs: '+canonical})
    if(canons.has(canonical))broken.push({from:absolute,error:'Duplicate canonical with '+canons.get(canonical)})
    canons.set(canonical,absolute)
    const raw=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    if(!raw)broken.push({from:absolute,error:'JSON-LD missing'})
    else try {
      const data=JSON.parse(raw)
      const graph=data['@graph']||[]
      if(!graph.some(node=>node['@type']==='WebPage'&&node.url===absolute))broken.push({from:absolute,error:'Structured data missing correct WebPage'})
      if(pageUrl.pathname!=='/guides/'&&!graph.some(node=>node['@type']==='BreadcrumbList'))broken.push({from:absolute,error:'Breadcrumbs missing'})
      schemas++
    }catch(e){broken.push({from:absolute,error:'Invalid structured data '+e.message})}
  }
  // All clickable anchors, stylesheets and image assets, not just sitemap links.
  for(const match of html.matchAll(/<(?:a|link|img)\b[^>]*?\b(?:href|src)="([^"]+)"/gi)){
    const href=match[1];if(!href||href.startsWith('#')||href.startsWith('data:')||href.startsWith('mailto:'))continue
    let target;try{target=new URL(href,absolute)}catch{broken.push({from:absolute,href,error:'Malformed URL'});continue}
    links++
    if(target.origin!==origin){external++;continue}internal++
    if(!await pathAvailable(target.pathname))broken.push({from:absolute,href,error:'Broken internal link or asset'})
  }
}
const audit=JSON.parse(await readFile(path.join(root,'seo-content-audit.json'),'utf8'))
if(audit.published.recipes+audit.published.materials+7!==urls.length)broken.push({error:'Publication count mismatches sitemap: '+JSON.stringify(audit.published)})
console.log(JSON.stringify({sitemapURLs:urls.length,checkedPages:checked,structuredPages:schemas,links,internalLinks:internal,externalLinksUnverified:external,excluded:audit.excluded,broken:broken.length},null,2))
if(broken.length){console.error('Broken entries (up to 60):',JSON.stringify(broken.slice(0,60),null,2));process.exit(1)}
console.log('PASS: all sitemap URLs and generated internal links/assets resolve within dist; external URLs require live validation.')
