import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

// Crawlable public reference pages, rendered from the same source data as the app.
// Run after the standard build. No special responses for crawlers.
const ORIGIN = 'https://neverwintermastercraft.netlify.app'
const out = path.resolve('dist')
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const slug = x => String(x).toLowerCase().replace(/\+1/g,'plus-1').replace(/[’']/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
const key = x => String(x).normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]/g,'')
const url = p => ORIGIN + p
const ld = data => JSON.stringify(data).replace(/</g,'\\u003c')
const notice = 'Unofficial community reference. Published routes may be historical. Verify current requirements, rewards and prices in Neverwinter.'
const crumb = parts => '<nav class="crumb" aria-label="Breadcrumb"><ol>' + parts.map((p,i)=>'<li>'+(i===parts.length-1?esc(p.name):'<a href="'+esc(p.url)+'">'+esc(p.name)+'</a>')+'</li>').join('')+'</ol></nav>'
const graph = (title,desc,p,parts) => ({'@context':'https://schema.org','@graph':[
  {'@type':'WebPage',name:title,description:desc,url:url(p),isPartOf:{'@type':'WebSite',name:'The Masterwork Vault',url:ORIGIN}},
  ...(parts.length >= 2 ? [{'@type':'BreadcrumbList',itemListElement:parts.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:url(x.url)}))}] : [])
]})
const html = (p,title,desc,body,parts,index=true) => '<!doctype html><html lang="en"><head>'+
 '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="theme-color" content="#0b0d12"><title>'+esc(title)+' | The Masterwork Vault</title>'+
 '<meta name="description" content="'+esc(desc)+'"><meta name="robots" content="'+(index?'index,follow':'noindex,follow')+'">'+
 '<link rel="canonical" href="'+esc(url(p))+'"><link rel="icon" type="image/svg+xml" href="/assets/brand/masterwork-vault-mark.svg">'+
 '<meta property="og:type" content="article"><meta property="og:site_name" content="The Masterwork Vault">'+
 '<meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'">'+
 '<meta property="og:url" content="'+esc(url(p))+'"><meta property="og:image" content="'+ORIGIN+'/social-preview.png">'+
 '<meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/guides/guide.css">'+
 '<script type="application/ld+json">'+ld(graph(title,desc,p,parts))+'</script></head><body>'+
 '<a class="skip" href="#main">Skip to content</a><header class="mast">'+
 '<a class="brand" href="/catalog"><img src="/assets/brand/masterwork-vault-mark.svg" width="38" height="38" alt="">'+
 '<span><b>MASTERWORK</b><small>NEVERWINTER CRAFTING COMPANION</small></span></a>'+
 '<nav aria-label="Primary"><a href="/guides/">Guides</a><a href="/catalog">Interactive catalog</a><a href="/materials">Materials</a></nav>'+
 '</header><main id="main">'+crumb(parts)+body+'</main><footer>'+esc(notice)+
 ' <a href="/guides/">Browse all guides</a></footer></body></html>'
const save = async (p,body) => {const dir=path.join(out,p.slice(1));await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),body)}
const ul = rows => '<ul>'+rows.map(x=>'<li>'+x+'</li>').join('')+'</ul>'

const server=await createServer({configFile:false,root:process.cwd(),server:{middlewareMode:true},appType:'custom',logLevel:'error'})
let catalog, sources
try {
  const modules=await Promise.all([server.ssrLoadModule('/src/data/catalog.ts'),server.ssrLoadModule('/src/data/materialSources.ts')])
  catalog=modules[0].default
  sources=modules[1]
} finally {await server.close()}
if (!Array.isArray(catalog?.items)||!Array.isArray(catalog?.materials)||!catalog.items.length) throw Error('Source catalog unavailable; refusing empty SEO pages.')
const materials=new Map(catalog.materials.map(x=>[key(x.name),x]))
const recipes=new Map(catalog.recipes.map(x=>[key(x.name),x]))
const itemPath=i=>'/guides/recipes/'+slug(i.campaign||'masterwork')+'/'+String(i.id).replace(/[^a-zA-Z0-9_-]/g,'-')+'/'+slug(i.name)+'/'
const materialPath=m=>'/guides/materials/'+slug(m.name)+'/'
const haveMaterialPage=m=>Boolean(m && (sources.getMaterialSourceGuide(m.name).status!=='unresolved' || recipes.get(key(m.name))?.materials?.length))
const index=['/catalog','/materials','/reference','/journey','/guides/']
const itemLinks=[]
const materialLinks=[]
for(const item of catalog.items){
  if(!item.id||!item.name||!item.materials?.length||item.recipeKnown===false)continue
  const p=itemPath(item),parts=[{name:'Crafting guides',url:'/guides/'},{name:'Recipes',url:'/guides/recipes/'},{name:item.name,url:p}]
  const desc='Direct materials required to craft '+item.name+' in Neverwinter '+(item.campaign||'Masterwork')+', with documented acquisition references.'
  const needs=item.materials.map(n=>{
    const m=materials.get(key(n.name)),guide=sources.getMaterialSourceGuide(n.name),route=guide.routes[0]
    const name=m&&haveMaterialPage(m)?'<a href="'+materialPath(m)+'">'+esc(n.name)+'</a>':esc(n.name)
    const source=route?route.method+' — '+route.location:'Source not verified'
    const status=guide.status==='historical'?'Historical guide; verify in game':guide.status==='documented'?'Published guide; verify in game':'No confirmed source'
    return '<li><div><strong>'+name+'</strong><small>'+esc(source)+'</small><small>'+esc(status)+'</small></div><b>×'+esc(n.required)+'</b></li>'
  }).join('')
  const app='/catalog/'+slug(item.campaign||'sharandar')+'/'+encodeURIComponent(item.id)+'/'+slug(item.name)
  const body='<div class="eyebrow">RECORDED RECIPE · '+esc(item.campaign||'Masterwork')+'</div><h1>'+esc(item.name)+'</h1>'+
    '<p class="lede">'+esc(desc)+'</p><p class="tags"><span>'+esc(item.kind)+'</span><span>'+esc(item.profession||'Profession not captured')+'</span></p>'+
    '<section class="sheet"><h2>Items required</h2><p>Recorded direct ingredients for one craft. For expanded materials and inventory calculations, open the workbench.</p><ul class="ingredients">'+needs+'</ul></section>'+
    '<section class="sheet"><h2>Source and limitations</h2><p>'+esc(item.provenance?.recipe||item.sourceStatus||'Source not verified')+'</p><p>'+esc(notice)+'</p></section>'+
    '<p><a class="action" href="'+esc(app)+'">Open this recipe in the crafting app</a></p>'
  await save(p,html(p,item.name+' — Masterwork recipe',desc,body,parts))
  index.push(p);itemLinks.push({name:item.name,url:p,campaign:item.campaign||'Masterwork'})
}
for(const m of catalog.materials){
  if(!haveMaterialPage(m))continue
  const guide=sources.getMaterialSourceGuide(m.name),recipe=recipes.get(key(m.name))
  const p=materialPath(m),parts=[{name:'Crafting guides',url:'/guides/'},{name:'Materials',url:'/guides/materials/'},{name:m.name,url:p}]
  const desc='Where to find '+m.name+' in Neverwinter Masterwork, including published or historical source routes and recorded uses.'
  const routes=guide.routes.map(r=>'<article class="route"><h3>'+esc(r.method)+' — '+esc(r.location)+'</h3>'+
     '<h4>Before you go</h4>'+ul(r.requirements.map(esc))+'<h4>Steps</h4><ol>'+r.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
     '<p class="muted">'+esc(r.caveats.join(' '))+'</p><p class="sources">'+r.evidence.map(e=>'<a rel="noopener noreferrer" href="'+esc(e.url)+'">'+esc(e.title)+'</a>').join(' · ')+'</p></article>').join('')
  const usedBy=catalog.items.filter(i=>i.materials?.some(n=>key(n.name)===key(m.name))).slice(0,16).map(i=>'<a href="'+itemPath(i)+'">'+esc(i.name)+'</a>')
  const crafting=recipe?.materials?.length?'<section class="sheet"><h2>Crafted component recipe</h2><p>Recorded yield: '+(recipe.quantityExplicit?esc(recipe.outputQuantity):'Not confirmed')+'</p><ul class="ingredients">'+recipe.materials.map(n=>{
    const related=materials.get(key(n.name));return '<li><span>'+(related&&haveMaterialPage(related)?'<a href="'+materialPath(related)+'">'+esc(n.name)+'</a>':esc(n.name))+'</span><b>×'+esc(n.required)+'</b></li>'
  }).join('')+'</ul></section>':''
  const body='<div class="eyebrow">MATERIAL SOURCE · '+esc(m.campaign||'Masterwork')+'</div><h1>'+esc(m.name)+'</h1><p class="lede">'+esc(desc)+'</p>'+
    '<section class="sheet"><h2>Where to obtain it</h2><p>Published material references reviewed '+esc(guide.reviewedAt)+'. Current-game availability is not confirmed.</p>'+
    (routes||'<p>Exact acquisition route is not documented.</p>')+'</section>'+crafting+
    (usedBy.length?'<section><h2>Used by these recipes</h2>'+ul(usedBy)+'</section>':'')+
    '<p><a class="action" href="/materials">View in the interactive materials explorer</a></p>'
  await save(p,html(p,m.name+' — materials and source',desc,body,parts))
  index.push(p);materialLinks.push({name:m.name,url:p,campaign:m.campaign||''})
}
const directory=async(p,title,desc,links)=>{
  const parts=[{name:'Crafting guides',url:'/guides/'}]
  if(p!=='/guides/')parts.push({name:title,url:p})
  const body='<div class="eyebrow">NEVERWINTER MASTERWORK REFERENCE LIBRARY</div><h1>'+esc(title)+'</h1><p class="lede">'+esc(desc)+'</p>'+
    '<div class="directory">'+links.map(x=>'<a href="'+esc(x.url)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.campaign||'Reference')+'</small></a>').join('')+'</div>'
  await save(p,html(p,title,desc,body,parts));index.push(p)
}
await directory('/guides/','Masterwork crafting guides','Explore recorded recipes, materials and source-backed acquisition guides. Published information is not necessarily current in-game.',[
 {name:'Browse recipes',url:'/guides/recipes/'},{name:'Material sources',url:'/guides/materials/'}
])
await directory('/guides/recipes/','Neverwinter recipe index','Direct recipe ingredients from the Vault catalog. Open a recipe to view quantities and related materials.',itemLinks.sort((a,b)=>a.name.localeCompare(b.name)))
await directory('/guides/materials/','Neverwinter material source index','Published and historical acquisition references, with uncertainty made explicit.',materialLinks.sort((a,b)=>a.name.localeCompare(b.name)))
// Static initial metadata for each public SPA route. The main React UI and
// its original interactions stay unchanged; crawlers get the correct first HTML.
const appHtml=await readFile(path.join(out,'index.html'),'utf8')
const shells=[
  ['/catalog','Neverwinter Masterwork crafting catalog','Explore source-backed Neverwinter Sharandar and Underdark Masterwork recipes, items and crafting requirements.',true],
  ['/materials','Neverwinter crafting materials and acquisition','Find Neverwinter Masterwork crafting materials and documented or historical acquisition references.',true],
  ['/reference','Neverwinter Masterwork workshop reference','Explore crafting mechanics and evidence notes in the Masterwork Vault reference.',true],
  ['/journey','Neverwinter Masterwork progression guide','Explore Masterwork professions, milestones and crafting progression.',true],
  ['/plan','Personal crafting planner','Create and manage your private crafting plan in the Masterwork Vault.',false],
  ['/readiness','Personal crafting readiness','Inspect your saved crafting inventory and readiness.',false],
  ['/explore','Advanced crafting explorer','Explore the Masterwork database using advanced filters.',false],
  ['/graph','Crafting dependency graph','Explore interactive recipe relationships and component dependencies.',false],
  ['/data-health','Masterwork research evidence audit','Inspect source evidence coverage and limitations.',false],
]
for(const [route,title,desc,publicRoute] of shells){
  let shell=appHtml
  shell=shell.replace(/<title>[^<]*<\/title>/,'<title>'+esc(title)+' | The Masterwork Vault</title>')
  shell=shell.replace(/<meta name="description" content="[^"]*"/,'<meta name="description" content="'+esc(desc)+'"')
  shell=shell.replace(/<meta name="robots" content="[^"]*"/,'<meta name="robots" content="'+(publicRoute?'index,follow':'noindex,follow')+'"')
  shell=shell.replace(/<link rel="canonical" href="[^"]*"/,'<link rel="canonical" href="'+url(route)+'"')
  shell=shell.replace(/<meta property="og:title" content="[^"]*"/,'<meta property="og:title" content="'+esc(title)+'"')
  shell=shell.replace(/<meta property="og:description" content="[^"]*"/,'<meta property="og:description" content="'+esc(desc)+'"')
  shell=shell.replace(/<meta property="og:url" content="[^"]*"/,'<meta property="og:url" content="'+url(route)+'"')
  const dir=path.join(out,route.slice(1))
  await mkdir(dir,{recursive:true})
  await writeFile(path.join(dir,'index.html'),shell)
}
// Domain-ownership verification is opt-in, supplied by the site owner in the
// hosting environment; do not invent a Search Console verification token.
const verification=process.env.GOOGLE_SITE_VERIFICATION
if(verification && /^[a-zA-Z0-9_-]{8,150}$/.test(verification)){
  const tag='<meta name="google-site-verification" content="'+esc(verification)+'">'
  const {readdir}=await import('node:fs/promises')
  const walk=async dir=>{
    for(const entry of await readdir(dir,{withFileTypes:true})){
      const full=path.join(dir,entry.name)
      if(entry.isDirectory())await walk(full)
      else if(entry.name==='index.html'){
        const content=await readFile(full,'utf8')
        await writeFile(full,content.replace('</head>',tag+'</head>'))
      }
    }
  }
  await walk(out)
}

const unique=[...new Set(index)].sort()
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+unique.map(p=>'  <url><loc>'+esc(url(p))+'</loc></url>').join('\n')+'\n</urlset>\n')
console.log('SEO output: '+itemLinks.length+' recipes, '+materialLinks.length+' materials, '+unique.length+' indexed URLs')
