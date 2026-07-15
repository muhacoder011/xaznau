import urllib.request
import re

url = "https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1/index-DmxOBVCF.js"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req) as r:
        js = r.read().decode('utf-8')
    print("JS length:", len(js))
    
    # Find all strings starting with /api/
    # Let's search for '/api/' in double or single quotes
    api_strings = re.findall(r'["\'](/api/[^"\']*)["\']', js)
    print("API strings found:", len(api_strings))
    for s in sorted(list(set(api_strings))):
        if "public" in s or "share" in s or "artifact" in s:
            print("API String:", s)
            
    # Let's search for '/public/' in double or single quotes
    pub_strings = re.findall(r'["\'](/public/[^"\']*)["\']', js)
    print("Public strings found:", len(pub_strings))
    for s in sorted(list(set(pub_strings))):
        print("Public String:", s)
except Exception as e:
    print("Error:", e)
