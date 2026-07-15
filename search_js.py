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
    # search for /public/ or public/share
    matches = re.findall(r'["\']/api/public/[^"\']*["\']', js)
    print("Found direct API public matches:", set(matches))
    
    # search for wider API routes
    matches2 = re.findall(r'["\']/api/[^"\']*["\']', js)
    print("Found some API matches (first 20):", set(matches2[:20]))
except Exception as e:
    print("Error:", e)
