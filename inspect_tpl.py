import re

with open('extracted_template.html', 'r', encoding='utf-8') as f:
    text = f.read()

screens = sorted(list(set(re.findall(r'SCR-WEB-\d+', text))))
print("Screens found:", screens)

# Let's search for how the app renders and what CSS/styles are used
print("\n--- Style tags snippet ---")
styles = re.findall(r'<style>(.*?)</style>', text, re.DOTALL)
for s in styles:
    print(s[:500])

# Let's search for script tags or components
scripts = re.findall(r'<script.*?>(.*?)</script>', text, re.DOTALL)
print(f"\nFound {len(scripts)} scripts")
for i, sc in enumerate(scripts):
    print(f"Script {i} length:", len(sc), sc[:200])
