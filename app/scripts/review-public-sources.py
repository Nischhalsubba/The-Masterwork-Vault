"""Temporary, anonymous read-only capture of explicitly scoped public sources.
No cookies, account credentials, browser profiles or private endpoints are used.
Failed reads are recorded; no authentication or access-control bypass is attempted.
"""
import json
import pathlib
import re
import urllib.request
import urllib.parse
from datetime import datetime, timezone

OUT = pathlib.Path('research-public')
OUT.mkdir(exist_ok=True)
manifest = []

def read(url, filename, body=None):
    entry = {'url': url, 'file': filename, 'retrievedAt': datetime.now(timezone.utc).isoformat()}
    try:
        headers = {'User-Agent': 'MasterworkVaultResearch/1.0 (public crafting reference)', 'Accept': 'application/json,text/html,*/*'}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read(10_000_001)
            if len(raw) > 10_000_000:
                raise ValueError('Response exceeded bounded research size')
            entry['status'] = response.status
            text = raw.decode('utf-8')
        (OUT / filename).write_text(text)
        manifest.append(entry)
        return text
    except Exception as error:
        entry['error'] = str(error)
        manifest.append(entry)
        return None

page = 'fc4c4cfb-8027-42ff-b99a-4f51c330a143'
base = 'https://neverwinterdata.notion.site'
read(base + '/' + page.replace('-', ''), 'notion-page.html')
chunk = read(base + '/api/v3/loadPageChunk', 'notion-chunk.json', {'pageId': page, 'limit': 100, 'cursor': {'stack': []}, 'chunkNumber': 0, 'verticalColumns': False})
if chunk:
    result = json.loads(chunk)
    records = result.get('recordMap', {})
    collections = records.get('collection', {})
    views = records.get('collection_view', {})
    summary = {'recordCounts': {key: len(value) for key, value in records.items()}, 'collections': collections, 'views': views}
    (OUT / 'notion-summary.json').write_text(json.dumps(summary, indent=2))
    # Read only this public page's returned collection/view IDs. A missing ID stops extraction.
    for cid, collection in list(collections.items())[:1]:
        for vid in list(views)[:1]:
            read(base + '/api/v3/queryCollection', 'notion-query.json', {'collectionId': cid, 'collectionViewId': vid, 'loader': {'type': 'reducer', 'reducers': {'collection_group_results': {'type': 'results', 'limit': 2000}}, 'searchQuery': '', 'userTimeZone': 'UTC'}, 'query': {}})

home = read('https://neverwinter.nyvaril.com/', 'nyvaril-index.html')
if home:
    scripts = re.findall(r'<script[^>]+src=[\"\']([^\"\']+)', home)
    same_host = [urllib.parse.urljoin('https://neverwinter.nyvaril.com/', src) for src in scripts if urllib.parse.urlparse(urllib.parse.urljoin('https://neverwinter.nyvaril.com/', src)).hostname == 'neverwinter.nyvaril.com']
    for index, url in enumerate(same_host[:8]):
        read(url, f'nyvaril-script-{index}.js')

(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest))
