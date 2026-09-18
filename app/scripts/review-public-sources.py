"""Temporary anonymous read of public task pages and their public linked ingredients."""
import json, pathlib, urllib.request
from datetime import datetime, timezone
OUT=pathlib.Path('research-public'); OUT.mkdir(exist_ok=True)
manifest=[]
def read(endpoint, filename, body):
    url='https://neverwinterdata.notion.site/api/v3/'+endpoint
    entry={'url':url,'file':filename,'retrievedAt':datetime.now(timezone.utc).isoformat()}
    try:
        req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={'User-Agent':'MasterworkVaultResearch/1.0','Content-Type':'application/json'})
        with urllib.request.urlopen(req,timeout=25) as response:
            raw=response.read(10000001)
            if len(raw)>10000000: raise ValueError('Research size limit')
            entry['status']=response.status
        result=json.loads(raw); (OUT/filename).write_text(json.dumps(result)); manifest.append(entry); return result
    except Exception as error:
        entry['error']=str(error); manifest.append(entry); return None

def unwrap(row):
    while isinstance(row,dict) and 'value' in row: row=row['value']
    return row
body={'collectionId':'c15cfaf3-3d76-4ebf-8c06-e5c191e1695c','collectionViewId':'a7c3afda-cc4e-414b-b131-5e9023e97537','loader':{'type':'reducer','reducers':{'collection_group_results':{'type':'results','limit':2000}},'searchQuery':'','userTimeZone':'UTC'},'query':{}}
data=read('queryCollection','professions-query.json',body)
if data:
    ids=data['result']['reducerResults']['collection_group_results']['blockIds']
    links=set()
    for row_id in ids:
        props=unwrap(data['recordMap']['block'][row_id]).get('properties',{})
        for key in ['<YXl','kau<','Mr\\o','AOZJ',']SNU','fQCl']:
            for piece in props.get(key,[]):
                for annotation in piece[1] if len(piece)>1 else []:
                    if annotation[0]=='p': links.add(annotation[1])
    linked_ids=sorted(links)
    (OUT/'linked-public-ids.json').write_text(json.dumps(linked_ids))
    for start in range(0,len(linked_ids),100):
        read('getRecordValues',f'ingredients-{start}.json',{'requests':[{'id':value,'table':'block'} for value in linked_ids[start:start+100]]})
    # The collection itself is explicitly referenced by this public task schema.
    read('loadPageChunk','linked-material-collection.json',{'pageId':'ae32818d-2caa-4730-b64e-7a013c87727a','limit':100,'cursor':{'stack':[]},'chunkNumber':0,'verticalColumns':False})
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)); print(json.dumps(manifest))
