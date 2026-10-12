# MedAI Hospital - ONE cell: install -> keys -> upload -> run -> public link
import os, sys, re, time, glob, shutil, zipfile, threading, subprocess, secrets, getpass, urllib.request
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "flask", "requests", "pypdf"], check=True)
from google.colab import files
try:
    from google.colab import userdata
except Exception:
    userdata = None

def key(name, auto=False):
    v = None
    try: v = userdata.get(name)
    except Exception: pass
    v = v or os.getenv(name)
    if not v and auto:
        v = secrets.token_urlsafe(8)
    elif not v:
        v = getpass.getpass(name + " (Enter to skip): ")
    if v: os.environ[name] = v

key("OPENROUTER_API_KEY"); key("MISTRAL_API_KEY"); key("DOCTOR_KEY", auto=True)

W = "/content/medai"; shutil.rmtree(W, ignore_errors=True); os.makedirs(W + "/data"); os.makedirs(W + "/models")
print("Upload MedAI_Hospital_project.zip  OR  app.py + index.html (+ bd_medicines.csv, body.glb)")
for n in files.upload():
    if n.endswith(".zip"): zipfile.ZipFile(n).extractall(W)
    elif n.endswith(".csv"): shutil.move(n, W + "/data/" + n)
    elif n.endswith((".glb", ".gltf")): shutil.move(n, W + "/models/" + n)
    else: shutil.move(n, W + "/" + n)
hits = glob.glob(W + "/**/app.py", recursive=True)
assert hits, "app.py not found. Upload the zip or app.py + index.html"
W = os.path.dirname(hits[0]); os.chdir(W); sys.path.insert(0, W)
assert os.path.exists("index.html"), "index.html is missing"
os.makedirs("data", exist_ok=True)

import app as medai
threading.Thread(target=lambda: medai.app.run(host="0.0.0.0", port=5000, threaded=True, use_reloader=False), daemon=True).start()
for _ in range(30):
    try: urllib.request.urlopen("http://127.0.0.1:5000/api/health", timeout=2); break
    except Exception: time.sleep(1)

urllib.request.urlretrieve("https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64", "cloudflared")
os.chmod("cloudflared", 0o755)
p = subprocess.Popen(["./cloudflared", "tunnel", "--url", "http://127.0.0.1:5000", "--no-autoupdate"], stderr=subprocess.PIPE, text=True)
url = None
for line in p.stderr:
    m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
    if m: url = m.group(0); break
threading.Thread(target=lambda: [None for _ in p.stderr], daemon=True).start()
print("\n==============================")
print("LIVE LINK :", url)
print("DOCTOR KEY:", os.environ["DOCTOR_KEY"], "(use it in the Doctor Review page)")
print("==============================\nKeep this Colab tab open. Link changes every run.")
