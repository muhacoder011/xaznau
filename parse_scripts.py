import re

with open(r"C:\Users\user\.gemini\antigravity\brain\9fcc500e-22b2-4b5d-b0d5-0f1423264bbd\scratch\raw_page.html", "r", encoding="utf-8") as f:
    html = f.read()

print("HTML Length:", len(html))

# Let's find script tags using a more robust regex or just string splitting
parts = html.split("<script")
print(f"Found {len(parts)-1} script starts.")
for i in range(1, len(parts)):
    part = parts[i]
    end_idx = part.find("</script>")
    if end_idx != -1:
        content = part[:end_idx]
        # find where content actually starts after the closing tag of the script start
        tag_close = content.find(">")
        script_body = content[tag_close+1:]
        attrs = content[:tag_close]
        print(f"Script {i}: Attrs: {attrs[:100]}, Body Length: {len(script_body)}")
        if len(script_body) > 0:
            print(f"Body start: {script_body[:200]}")
            print("---")
