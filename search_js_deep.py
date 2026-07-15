with open("search_js.py", "r", encoding="utf-8") as f:
    pass

import re
# Let's search inside the downloaded JS for "public/share" or "public/artifact"
# We need to read index-DmxOBVCF.js if we have it downloaded. Wait, in search_js.py we didn't save it to file.
# Let's download and search.
import urllib.request
url = "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-DmxOBVCF.js"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
)

with urllib.request.urlopen(req) as r:
    js = r.read().decode('utf-8')

# Search for "share" or "shares" or "artifact" in relation to api
# e.g. api/
api_matches = re.findall(r'\/api\/[a-zA-Z0-9_\-\/]+', js)
print("Unique api matches:", len(set(api_matches)))
for m in sorted(list(set(api_matches))):
    if "share" in m or "public" in m or "artifact" in m:
        print("Match:", m)

# Let's also look for "/public/shares/" or similar
shares_matches = re.findall(r'\/[a-zA-Z0-9_\-\/]*public\/[a-zA-Z0-9_\-\/]+', js)
print("Unique public matches:", len(set(shares_matches)))
for m in sorted(list(set(shares_matches))):
    if "share" in m or "artifact" in m:
        print("Public Match:", m)
