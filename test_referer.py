import urllib.request
import urllib.error

url = "https://claude.ai/api/public/share/59d2c53d-969c-43a0-a91a-c99828a7b457/artifact"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Referer': 'https://claude.ai/public/artifacts/59d2c53d-969c-43a0-a91a-c99828a7b457',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        print("Success!")
        print("Length:", len(content))
        print(content[:500])
        with open("share_artifact.json", "w", encoding="utf-8") as f:
            f.write(content)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Headers:", e.headers)
    try:
        err_body = e.read().decode('utf-8')
        print("Error body:", err_body[:500])
    except:
        pass
except Exception as e:
    print("Error:", e)
