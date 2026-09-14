import json
import re

with open('SAH Web Admin (standalone).html', 'r', encoding='utf-8') as f:
    content = f.read()

# find template
m = re.search(r'<script type="__bundler/template">(.*?)</script>', content, re.DOTALL)
if m:
    tpl_json = m.group(1).strip()
    data = json.loads(tpl_json)
    with open('extracted_template.html', 'w', encoding='utf-8') as out:
        out.write(data)
    print("Template extracted! Length:", len(data))

# find manifest
m_man = re.search(r'<script type="__bundler/manifest">(.*?)</script>', content, re.DOTALL)
if m_man:
    manifest = json.loads(m_man.group(1).strip())
    with open('extracted_manifest.json', 'w', encoding='utf-8') as out:
        json.dump(manifest, out, indent=2)
    print("Manifest extracted! Keys count:", len(manifest))
