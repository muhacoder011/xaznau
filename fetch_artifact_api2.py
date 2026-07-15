import urllib.request
import json

urls = [
    "https://claude.ai/api/public/share/59d2c53d-969c-43a0-a91a-c99828a7b457",
    "https://claude.ai/api/public/shares/59d2c53d-969c-43a0-a91a-c99828a7b457",
    "https://claude.ai/api/public/shares/59d2c53d-969c-43a0-a91a-c99828a7b457/artifact",
    "https://claude.ai/api/public/share/59d2c53d-969c-43a0-a91a-c99828a7b457/artifact",
    "https://claude.ai/api/public/artifact/59d2c53d-969c-43a0-a91a-c99828a7b457"
]

for url in urls:
    print("Trying:", url)
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print("Success! Response length:", len(content))
            print("First 200 chars:", content[:200])
            with open("artifact_api_success.json", "w", encoding="utf-8") as f:
                f.write(content)
            break
    except Exception as e:
        print("Failed:", e)
