import subprocess
import time

chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
url = "https://claude.ai/public/artifacts/59d2c53d-969c-43a0-a91a-c99828a7b457"

# We run headless chrome. We can also add --virtual-time-budget to wait for page to render,
# or we can run a subprocess and sleep, but --dump-dom outputs immediately after load.
# To allow JS to load and make requests, we can use a python script that runs chrome,
# or we can just try running it directly first.
# Wait, chrome headless has a new headless mode or we can specify --timeout.
# Let's try running:
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--dump-dom",
    url
]

print("Running command...")
try:
    # Run the command and capture output
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", timeout=20)
    dom = res.stdout
    print("DOM Length:", len(dom))
    with open("rendered_dom.html", "w", encoding="utf-8") as f:
        f.write(dom)
    print("DOM saved to rendered_dom.html")
except subprocess.TimeoutExpired:
    print("Timeout expired")
except Exception as e:
    print("Error:", e)
