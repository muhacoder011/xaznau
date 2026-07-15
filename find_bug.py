with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
matches = [m.start() for m in re.finditer(r"fa-user", html)]
print(f"Found {len(matches)} occurrences of fa-user:")
for m in matches:
    print(html[max(0, m-200):m+200])
    print("---")
