import os
import urllib.request
import urllib.error
import time

if not os.path.exists('images'):
    os.makedirs('images')

base_url = "https://sacred-texts.com/tarot/xr/img/"

def download(filename):
    if os.path.exists(f"images/{filename}"):
        return
    print(f"Downloading {filename}")
    req = urllib.request.Request(base_url + filename, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            with open(f"images/{filename}", "wb") as f:
                f.write(response.read())
        time.sleep(0.1)
    except urllib.error.URLError as e:
        print(f"Failed {filename}: {e}")

for i in range(22):
    download(f"ar{i:02d}.jpg")

suits = ['sw', 'wa', 'cu', 'pe']
for suit in suits:
    for i in range(1, 15):
        download(f"{suit}{i:02d}.jpg")
