"""Temporary anonymous capture of public crafting references; no credentials."""
import json, pathlib, urllib.request
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

def unwrap(row):
    while isinstance(row,dict) and 'value' in row: row=row['value']
    return row
base='https://neverwinterdata.notion.site'
for label,page in [('professions','fc4c4cfb-8027-42ff-b99a-4f51c330a143'),('materials','aa8b1b48-a43c-46c1-bb18-02caa07a634e')]:
    chunk=read(base+'/api/v3/loadPageChunk',label+'-chunk.json',{'pageId':page,'limit':100,'cursor':{'stack':[]},'chunkNumber':0,'verticalColumns':False})
    if not chunk: continue
    try:
        records=json.loads(chunk).get('recordMap',{})
        collections=records.get('collection',{}); views=records.get('collection_view',{})
        for cid in list(collections)[:1]:
            for vid in list(views)[:1]:
                read(base+'/api/v3/queryCollection',label+'-query.json',{'collectionId':cid,'collectionViewId':vid,'loader':{'type':'reducer','reducers':{'collection_group_results':{'type':'results','limit':2000}},'searchQuery':'','userTimeZone':'UTC'},'query':{}})
    except Exception as error: (OUT/(label+'-error.txt')).write_text(str(error))
for profession in ['Alchemy','Armorsmithing','Artificing','Blacksmithing','Jewelcrafting','Leatherworking','Tailoring']:
    read('https://neverwinter.fandom.com/wiki/Masterwork_'+profession,'masterwork-'+profession+'.html')
read('https://www.patreon.com/posts/neverwinter-v3-4-27442099','rainer-post.html')
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)); print(json.dumps(manifest))
