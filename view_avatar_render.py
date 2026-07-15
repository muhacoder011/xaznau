with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "avatarEl.textContent =" in line:
        start = max(0, i - 15)
        end = min(len(lines), i + 20)
        print(f"Lines {start+1} to {end}:")
        for idx in range(start, end):
            print(f"{idx+1}: {lines[idx]}", end="")
        print("\n" + "="*40 + "\n")
