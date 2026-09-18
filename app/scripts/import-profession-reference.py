"""Offline import of public community task captures; no credentials or live catalog writes.
Usage: python3 scripts/import-profession-reference.py <capture-directory> <output.json>
"""
import hashlib,json,math,re,sys
from collections import Counter
from pathlib import Path
PROFESSIONS=['Alchemy','Armorsmithing','Artificing','Blacksmithing','Jewelcrafting','Leatherworking','Tailoring']
INPUTS=[('<YXl','=bA^'),('kau<','jJ@]'),('Mr\\o','eZMu'),('AOZJ','|IR['),(']SNU','=aFS'),('fQCl','z]xK')]
def unwrap(value):
    while isinstance(value,dict) and 'value' in value:value=value['value']
    return value
def text(properties,key):
    return ''.join(part[0] for part in properties.get(key,[]) if isinstance(part,list) and part and isinstance(part[0],str)).strip()
def number(properties,key):
    value=text(properties,key)
    if not value:return None
    try:result=float(value.replace(',',''))
    except ValueError:return None
    if not math.isfinite(result) or result<0:return None
    return int(result) if result.is_integer() else result
def collection(path):
    value=json.loads(path.read_text()); result=value['result']['reducerResults']['collection_group_results']
    if result.get('hasMore') is not False:raise ValueError('Incomplete source capture')
    return [unwrap(value['recordMap']['block'][uid]) for uid in result['blockIds']]
def generate(directory):
    tasks=collection(directory/'professions-query.json')
    materials={r['id']:r for r in collection(directory/'ingredients-query.json')}
    normalized=[]; material_facts={}
    for task in tasks:
        props=task.get('properties',{});uid=task['id'];profession=text(props,'>mpD')
        if not re.fullmatch(r'[0-9a-f-]{36}',uid) or profession not in PROFESSIONS:raise ValueError('Invalid task identity')
        inputs=[]
        for field,qty_field in INPUTS:
            linked=[a[1] for part in props.get(field,[]) for a in (part[1] if len(part)>1 else []) if a[0]=='p']
            if not linked:continue
            if len(linked)!=1 or linked[0] not in materials:raise ValueError('Unresolved or ambiguous ingredient')
            material=materials[linked[0]];facts=material.get('properties',{});name=text(facts,'title')
            if not name:raise ValueError('Unnamed ingredient')
            material_id=material['id'].replace('-','')
            inputs.append({'materialId':material_id,'name':name,'quantity':number(props,qty_field)})
            material_facts[material_id]={'id':material_id,'name':name,'gatherable':'Gatherable' in text(facts,'bgE`').split(','),'gatheringLevel':number(facts,'NOav')}
        level=number(props,'Rs`[')
        if level is not None and (not isinstance(level,int) or not 1<=level<=20):raise ValueError('Unexpected level')
        category=text(props,'ahra');bands=re.findall(r'\d+',category)
        conflict=bool(level is not None and len(bands)==2 and not int(bands[0])<=level<=int(bands[1]))
        normalized.append({'id':uid.replace('-',''),'name':text(props,'title'),'profession':profession,'level':level,'category':category,'categoryConflict':conflict,'outputQuantity':None,'inputs':inputs,'morale':number(props,'RiY`'),'xp':number(props,'Sv?{'),'proficiency':number(props,'rOoP'),'focusMinimum':number(props,'r<v}'),'focusGoal':number(props,'wa:h')})
    normalized.sort(key=lambda r:(r['profession'],r['level'] if r['level'] is not None else 99,r['name'],r['id']))
    counts=dict(sorted(Counter(r['profession'] for r in normalized).items()))
    if len(normalized)!=907 or len(counts)!=7 or len({r['id'] for r in normalized})!=907:raise ValueError('Source inventory changed; review first')
    return {'schemaVersion':1,'reviewedAt':'2026-09-18','sourcePublishedAt':'2024-04-17','sourceUrl':'https://neverwinterdata.notion.site/fc4c4cfb802742ffb99a4f51c330a143','sourceAnnouncementUrl':'https://www.reddit.com/r/Neverwinter/comments/1c6a4i7/masterwork_crafting_material_list/','sourceName':'Neverwinter Professions Database (community v1)','confidence':'community-snapshot','plannerEligible':False,'professionCounts':counts,'materials':sorted(material_facts.values(),key=lambda r:r['id']),'recipes':normalized}
if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit(__doc__)
    output=Path(sys.argv[2]); result=generate(Path(sys.argv[1]));output.parent.mkdir(parents=True,exist_ok=True)
    payload=json.dumps(result,ensure_ascii=True,separators=(',',':')).replace('},{','},\n{')+'\n'
    output.write_text(payload)
    print(json.dumps({'rows':len(result['recipes']),'materials':len(result['materials']),'sha256':hashlib.sha256(payload.encode()).hexdigest()}))
