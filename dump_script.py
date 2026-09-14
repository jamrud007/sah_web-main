import re

with open('extracted_template.html', 'r', encoding='utf-8') as f:
    text = f.read()

scripts = re.findall(r'<script.*?>(.*?)</script>', text, re.DOTALL)
if len(scripts) > 1:
    with open('extracted_script.js', 'w', encoding='utf-8') as out:
        out.write(scripts[1])
    print("Script 1 saved to extracted_script.js, length:", len(scripts[1]))

# Also remove script 1 and save the pure HTML
pure_html = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
with open('extracted_markup.html', 'w', encoding='utf-8') as out:
    out.write(pure_html)
print("Markup saved to extracted_markup.html, length:", len(pure_html))
