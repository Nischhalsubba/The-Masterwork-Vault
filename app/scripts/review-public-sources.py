"""Temporary anonymous capture of scoped public recipe sources; no credentials."""
import json, pathlib, re, urllib.request, urllib.parse
from datetime import datetime, timezone
OUT=pathlib.Path('research-public'); OUT.mkdir(exist_ok=True)
manifest=[]
def read(url, filename, body=None):
    entry={'url':url,'file':filename,'retrievedAt':datetime.now(timezone.utc).isoformat()}
    try:
        headers={'User-Agent':'MasterworkVaultResearch/1.0 (public crafting reference)','Accept':'application/json,text/html,*/*'}
        data=None
        if body is not None:
            data=json.dumps(body).encode(); headers['Content-Type']='application/json'
        with urllib.request.urlopen(urllib.request.Request(url,data=data,headers=headers),timeout=25) as response:
            raw=response.read(10000001)
            if len(raw)>10000000: raise ValueError('Research size limit')
            entry['status']=response.status; text=raw.decode('utf-8')
        (OUT/filename).write_text(text); manifest.append(entry); return text
    except Exception as error:
        entry['error']=str(error); manifest.append(entry); return None
page='fc4c4cfb-8027-42ff-b99a-4f51c330a143'; base='https://neverwinterdata.notion.site'
read(base+'/'+page.replace('-',''),'notion-page.html')
chunk=read(base+'/api/v3/loadPageChunk','notion-chunk.json',{'pageId':page,'limit':100,'cursor':{'stack':[]},'chunkNumber':0,'verticalColumns':False})
if chunk:
    try:
        records=json.loads(chunk).get('recordMap',{})
        collections=records.get('collection',{}); views=records.get('collection_view',{})
        summary={'recordCounts':{key:len(value) if isinstance(value,(dict,list)) else value for key,value in records.items()},'collections':collections,'views':views}
        (OUT/'notion-summary.json').write_text(json.dumps(summary,indent=2))
        for cid in list(collections)[:1]:
            for vid in list(views)[:1]:
                read(base+'/api/v3/queryCollection','notion-query.json',{'collectionId':cid,'collectionViewId':vid,'loader':{'type':'reducer','reducers':{'collection_group_results':{'type':'results','limit':2000}},'searchQuery':'','userTimeZone':'UTC'},'query':{}})
    except Exception as error:
        (OUT/'notion-parse-error.txt').write_text(str(error))
home=read('https://neverwinter.nyvaril.com/','nyvaril-index.html')
if home:
    scripts=re.findall(r'<script[^>]+src=[\"\']([^\"\']+)',home)
    for index,src in enumerate(scripts[:12]):
        url=urllib.parse.urljoin('https://neverwinter.nyvaril.com/',src)
        if urllib.parse.urlparse(url).hostname!='neverwinter.nyvaril.com': continue
        script=read(url,f'nyvaril-script-{index}.js')
        if script:
            for number,path in enumerate(re.findall(r'[\"\']([^\"\'\n]+\.json)[\"\']',script)[:8]):
                target=urllib.parse.urljoin('https://neverwinter.nyvaril.com/',path)
                if urllib.parse.urlparse(target).hostname=='neverwinter.nyvaril.com': read(target,f'nyvaril-data-{index}-{number}.json')
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)); print(json.dumps(manifest))
