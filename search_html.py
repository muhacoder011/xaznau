with open("raw_page.html", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("59d2c53d-969c-43a0-a91a-c99828a7b457", content)]
print(f"Found {len(matches)} occurrences:")
for idx in matches:
    print(content[max(0, idx-100):idx+150])
    print("---")
