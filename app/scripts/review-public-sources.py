"""Temporary anonymous reads restricted to ingredients linked by a public task table."""
import json,pathlib,urllib.request,concurrent.futures
OUT=pathlib.Path('research-public');OUT.mkdir(exist_ok=True)
def read(endpoint,filename,body):
    try:
        req=urllib.request.Request('https://neverwinterdata.notion.site/api/v3/'+endpoint,data=json.dumps(body).encode(),headers={'User-Agent':'MasterworkVaultResearch/1.0','Content-Type':'application/json'})
        with urllib.request.urlopen(req,timeout=25) as response:
            raw=response.read(10000001)
            if len(raw)>10000000:raise ValueError('Size limit')
        result=json.loads(raw);(OUT/filename).write_text(json.dumps(result));return result
    except Exception as error:
        (OUT/(filename+'.error')).write_text(str(error));return None
def val(row):
    while isinstance(row,dict) and 'value'in row:row=row['value']
    return row
body={'collectionId':'c15cfaf3-3d76-4ebf-8c06-e5c191e1695c','collectionViewId':'a7c3afda-cc4e-414b-b131-5e9023e97537','loader':{'type':'reducer','reducers':{'collection_group_results':{'type':'results','limit':2000}},'searchQuery':'','userTimeZone':'UTC'},'query':{}}
d=read('queryCollection','professions-query.json',body)
if not d:raise SystemExit('Public source unavailable')
ids=d['result']['reducerResults']['collection_group_results']['blockIds'];links=set()
for uid in ids:
    props=val(d['recordMap']['block'][uid]).get('properties',{})
    for key in ['<YXl','kau<','Mr\\o','AOZJ',']SNU','fQCl']:
        for part in props.get(key,[]):
            for annotation in part[1] if len(part)>1 else []:
                if annotation[0]=='p':links.add(annotation[1])
links=sorted(links)
for start in range(0,len(links),100):
    read('syncRecordValues',f'ingredients-{start}.json',{'requests':[{'pointer':{'id':uid,'table':'block','spaceId':'f608aca4-911e-4edb-ab80-a700d2608320'},'version':-1} for uid in links[start:start+100]]})
# A direct linked public page is read once as a compatibility check; never sign in or bypass denial.
uid='61c3747e-661e-4a4c-8952-b134a3b91244'
if uid in links:read('loadPageChunk','linked-ingredient-page.json',{'pageId':uid,'limit':30,'cursor':{'stack':[]},'chunkNumber':0,'verticalColumns':False})
print('Public linked IDs:',len(links))
