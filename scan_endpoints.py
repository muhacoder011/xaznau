import urllib.request
import urllib.error
import json

uuid = "59d2c53d-969c-43a0-a91a-c99828a7b457"

endpoints = [
    f"https://claude.ai/api/public/share/{uuid}",
    f"https://claude.ai/api/public/shares/{uuid}",
    f"https://claude.ai/api/public/artifact/{uuid}",
    f"https://claude.ai/api/public/artifacts/{uuid}",
    f"https://claude.ai/api/public/share/artifacts/{uuid}",
    f"https://claude.ai/api/public/shares/artifacts/{uuid}",
    f"https://claude.ai/api/public/artifact/share/{uuid}",
    f"https://claude.ai/api/public/artifacts/share/{uuid}",
    f"https://claude.ai/api/public/shares/{uuid}/artifact",
    f"https://claude.ai/api/public/share/{uuid}/artifact",
    f"https://claude.ai/api/public/share/{uuid}/content",
    f"https://claude.ai/api/public/shares/{uuid}/content",
    f"https://claude.ai/api/public/artifact/{uuid}/content",
    f"https://claude.ai/api/public/artifacts/{uuid}/content",
    f"https://claude.ai/api/public/share/59d2c53d-969c-43a0-a91a-c99828a7b457",
]

for url in endpoints:
    req = urllib.request.Request(
        url, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Referer': f'https://claude.ai/public/artifacts/{uuid}',
            'Accept': 'application/json',
        }
    )
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print(f"SUCCESS: {url}")
            print(content[:500])
            with open("found_endpoint.json", "w", encoding="utf-8") as f:
                f.write(content)
            break
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} for: {url}")
    except Exception as e:
        print(f"Error for {url}: {e}")
