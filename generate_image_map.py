import urllib.request
import json
import time

cards = [
    "00_Fool", "01_Magician", "02_High_Priestess", "03_Empress", "04_Emperor", "05_Hierophant",
    "06_Lovers", "07_Chariot", "08_Strength", "09_Hermit", "10_Wheel_of_Fortune", "11_Justice",
    "12_Hanged_Man", "13_Death", "14_Temperance", "15_Devil", "16_Tower", "17_Star", "18_Moon",
    "19_Sun", "20_Judgement", "21_World"
]
suits = ["Wands", "Cups", "Swords", "Pentacles"]
for suit in suits:
    for i in range(1, 15):
        if i == 11: name = "Page"
        elif i == 12: name = "Knight"
        elif i == 13: name = "Queen"
        elif i == 14: name = "King"
        elif i == 1: name = "01"
        else: name = f"{i:02d}"
        cards.append(f"{name}s_{suit}" if i == 1 else f"{name}_of_{suit}")

urls = {}
for c in cards:
    # Handle the weird wikimedia naming quirks
    title = f"File:RWS_Tarot_{c}.jpg"
    if c.startswith('01s_'):
        title = f"File:RWS_Tarot_{c.replace('01s_', '01_')}.jpg"
    
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    pages = data["query"]["pages"]
    page_id = list(pages.keys())[0]
    if "imageinfo" in pages[page_id]:
        img_url = pages[page_id]["imageinfo"][0]["url"]
        urls[c] = img_url
    else:
        print(f"Missing: {title}")
        urls[c] = ""
    time.sleep(0.05)

with open("js/image_map.js", "w") as f:
    f.write("const TAROT_IMAGES = " + json.dumps(urls, indent=2) + ";\n")
print("Done!")
