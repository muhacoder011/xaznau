import subprocess
import os

chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
url = "https://claude.ai/public/artifacts/59d2c53d-969c-43a0-a91a-c99828a7b457"

# We run headless chrome with virtual time budget to allow Javascript execution
# --virtual-time-budget=15000 allows the page to run for 15 virtual seconds.
# We also take a screenshot to verify what was rendered.

cmd_dom = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=15000",
    "--dump-dom",
    url
]

cmd_screenshot = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=15000",
    "--window-size=1280,1024",
    f"--screenshot={os.path.abspath('screenshot.png')}",
    url
]

print("Running DOM dump...")
try:
    res_dom = subprocess.run(cmd_dom, capture_output=True, text=True, encoding="utf-8", timeout=30)
    dom = res_dom.stdout
    print("DOM Length:", len(dom))
    with open("rendered_dom_virtual.html", "w", encoding="utf-8") as f:
        f.write(dom)
    print("Saved to rendered_dom_virtual.html")
except Exception as e:
    print("DOM dump error:", e)

print("Running Screenshot...")
try:
    res_ss = subprocess.run(cmd_screenshot, capture_output=True, text=True, encoding="utf-8", timeout=30)
    print("Screenshot command finished. Status:", res_ss.returncode)
    if os.path.exists("screenshot.png"):
        print("Screenshot saved to screenshot.png")
    else:
        print("Screenshot file not found!")
except Exception as e:
    print("Screenshot error:", e)
