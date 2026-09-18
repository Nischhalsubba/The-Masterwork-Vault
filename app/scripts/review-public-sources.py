"""Temporary anonymous queries of two public collections, no credentials."""
import json,pathlib,urllib.request
from datetime import datetime,timezone
OUT=pathlib.Path('research-public');OUT.mkdir(exist_ok=True)
for name,cid,vid in [('professions','c15cfaf3-3d76-4ebf-8c06-e5c191e1695c','a7c3afda-cc4e-414b-b131-5e9023e97537'),('ingredients','ae32818d-2caa-4730-b64e-7a013c87727a','0f5bf6a2-60ac-409e-924f-1541cac75d95')]:
    body={'collectionId':cid,'collectionViewId':vid,'loader':{'type':'reducer','reducers':{'collection_group_results':{'type':'results','limit':2000}},'searchQuery':'','userTimeZone':'UTC'},'query':{}}
    req=urllib.request.Request('https://neverwinterdata.notion.site/api/v3/queryCollection',data=json.dumps(body).encode(),headers={'User-Agent':'MasterworkVaultResearch/1.0','Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=25) as response:
        raw=response.read(10000001)
        if len(raw)>10000000:raise ValueError('Size limit')
    parsed=json.loads(raw);result=parsed['result']['reducerResults']['collection_group_results'];assert not result['hasMore']
    (OUT/(name+'-query.json')).write_bytes(raw)
    print(name,len(result['blockIds']),'public records captured',datetime.now(timezone.utc).isoformat())
