"""MedAI backend. AI via OpenRouter (primary) and Mistral (fallback). Keys come from env vars only."""
import base64, csv, io, json, math, os, re, time
import requests
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=None)
HERE = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "MedAI-amra/1.0 (student project)"}

PROVIDERS = [
    ("openrouter", "https://openrouter.ai/api/v1/chat/completions", "OPENROUTER_API_KEY",
     lambda: os.getenv("OPENROUTER_MODEL", "mistralai/mistral-small-3.2-24b-instruct")),
    ("mistral", "https://api.mistral.ai/v1/chat/completions", "MISTRAL_API_KEY",
     lambda: os.getenv("MISTRAL_MODEL", "mistral-small-latest")),
]

SAFETY = (
    "You are MedAI, a health information assistant for people in Bangladesh. "
    "Reply in the user's language (Bangla or English). Users often type Bangla in English letters (Banglish), e.g. 'amar matha betha korche', 'pete jala', 'napa ki'; always understand it as Bangla and reply in Bangla script (বাংলা), never say you cannot understand. You give possible causes and general information only, "
    "never a confirmed diagnosis. For symptom checks, you may list cautious general medicine options that are commonly discussed for symptom relief, but only as educational possibilities to discuss with a pharmacist/registered doctor, not as a personalized prescription. Never provide dose, frequency, or duration, and never recommend antibiotics, steroids, sedatives, opioids, or controlled medicines. A registered clinician must decide whether any medicine is suitable. "
    "Always state uncertainty. If there are emergency signs (chest pain, trouble breathing, stroke signs, "
    "heavy bleeding, fainting, severe allergy, poisoning), tell the user to call 999 or go to the nearest "
    "emergency hospital first. Keep answers short and clear. Do not invent facts, sources or numbers."
)
APP_HELP = (
    " You live inside the MedAI Hospital app. Pages in the app: AI Assistant (chat), Symptom Checker, Human Body map, "
    "Report Analysis (upload a lab report PDF/photo; it can be saved or printed as PDF from that page), Wound Check, "
    "Hospital Finder (GPS map), Lab Tests, Medicine AI, Reminders, My Approvals, BMI, Monitoring, Family, Emergency SOS. "
    "If the user asks for a PDF or a report, do NOT say you cannot: tell them to open Report Analysis, upload their report, "
    "and use the Download PDF / Print button there (a PDF of a summary can also be made with the browser Print > Save as PDF). "
    "If they ask for a hospital, medicine search, BMI or symptom check, point them to the matching page. "
    "Always answer in the same language as the user's LAST message (Bangla or English); never switch language on your own. "
)


RED = re.compile(r"chest pain|can.?t breathe|short of breath|stroke|unconscious|heavy bleeding|poison|suicid|"
                 r"বুকে ব্যথা|শ্বাস|অজ্ঞান|রক্তক্ষরণ|বিষ|buke betha|buk e betha|buke byatha|shash nite|shas nite|nishash|ojogyan|oggan|onek rokto|rokto poro|bish kh", re.I)
DISCLAIMER = "AI information only. Not a diagnosis. A registered doctor decides your medicine and dose. Emergency: call 999."


def llm(messages, json_out=False, max_tokens=1200, extra=None):
    errs = []
    for name, url, keyenv, model in PROVIDERS:
        key = os.getenv(keyenv)
        if not key:
            continue
        body = {"model": model(), "messages": messages, "temperature": 0.2, "max_tokens": max_tokens}
        if extra:
            body.update(extra)
        if json_out and name == "mistral":
            body["response_format"] = {"type": "json_object"}
        try:
            r = requests.post(url, headers={"Authorization": "Bearer " + key}, json=body, timeout=90)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            errs.append(f"{name}: {e}")
    raise RuntimeError("; ".join(errs) or "No API key set (OPENROUTER_API_KEY or MISTRAL_API_KEY)")


def parse_json(t):
    m = re.search(r"\{.*\}", t, re.S)
    try:
        return json.loads(m.group(0)) if m else {}
    except Exception:
        raise ValueError("The AI answer was unreadable. Please try again or upload a clearer file.")


def err(e, code=503):
    return jsonify({"error": str(e)}), code


@app.get("/")
def home():
    return send_from_directory(HERE, "index.html")


@app.get("/api/health")
def health():
    return {"ok": True, "openrouter": bool(os.getenv("OPENROUTER_API_KEY")), "mistral": bool(os.getenv("MISTRAL_API_KEY"))}


CHAT_RULES = (
    " CHAT STYLE RULES: Understand romanized Bangla (Banglish) such as 'pete betha' = stomach pain, 'jor' = fever, "
    "'matha betha' = headache, 'kashi' = cough, 'napa' = Napa, a paracetamol brand in Bangladesh, "
    "'condom kmn dekte' = what a condom looks like. Answer the exact question asked, in the user's language. "
    "If the user names a medicine brand, say what it is (generic name and common use) and key cautions, without dose. "
    "Maximum 120 words. Never repeat a sentence, point or phrase. Give 3 to 5 DIFFERENT short points at most, "
    "then one line on when to see a doctor. Do not mention app pages unless the user asks for one."
)


def clean_reply(t):
    """Remove looping / repeated lines and sentences, and cut runaway text."""
    t = (t or "").strip()
    seen, out = set(), []
    for line in t.splitlines():
        parts = re.split(r"(?<=[.!?\u0964])\s+", line) if len(line) > 60 else [line]
        keep = []
        for p in parts:
            k = re.sub(r"[\W\d_]+", "", p.lower())
            if k and k in seen:
                continue
            if k:
                seen.add(k)
            keep.append(p)
        l = " ".join(keep).strip()
        if l or (out and out[-1] != ""):
            out.append(l)
    t = "\n".join(out).strip()
    # collapse a phrase repeated back-to-back (e.g. "..., X, X, X")
    t = re.sub(r"(.{12,160}?[,\u0964.]\s*)\1{1,}", r"\1", t)
    if len(t) > 1800:
        t = t[:1800].rsplit(" ", 1)[0] + "..."
    return t


BANGLISH_WORDS = set("ami amar amr ki kno keno kmn kemon kmne kora korbo korte hoy hoi hocche hochhe ase achhe nai nei ta ti "
    "pete betha byatha jor jwor matha kashi sordi thanda gola buk bomi bomi pain loose tok jala jalapora chulkani "
    "dorkar lagbe khabo khaboo khabar ousudh oshudh ushud dibo debo dao deo bolo bolen bolun amake tomar apni tumi "
    "ekta ekdom onek khub kintu ar na haa ha jani jante chai chaichi hoyeche hoise hoyese shurir shorir gaye gay "
    "dekhte dekhay dekhaw ghum ghumao ghum-e rog shomossa somossa bhalo valo kharap thik".split())


def is_banglish(t):
    w = re.findall(r"[a-z]+", (t or "").lower())
    if not w or re.search(r"[\u0980-\u09FF]", t or ""):
        return False
    return sum(1 for x in w if x in BANGLISH_WORDS) >= 1 and sum(1 for x in w if x in BANGLISH_WORDS) / len(w) >= 0.2


@app.post("/api/v3/chat")
def chat():
    msgs = (request.json or {}).get("messages", [])[-12:]
    msgs = [{"role": m["role"], "content": str(m["content"])[:2000]} for m in msgs if m.get("role") in ("user", "assistant")]
    if not msgs:
        return err("empty", 400)
    emergency = bool(RED.search(msgs[-1]["content"]))
    lang = " The app language is Bangla: reply in Bangla unless the user clearly wrote in English." if (request.json or {}).get("lang") == "bn" else ""
    banglish = is_banglish(msgs[-1]["content"])
    if banglish:
        lang = (" The user is typing BANGLA using English letters (Banglish). Understand it, and reply in clear Bangla script (বাংলা). "
                "Never say you cannot understand; if a word is unclear, give your best reading and answer.")
    if not banglish:
        lang += " If the message is Bangla written in English letters, understand it and reply in Bangla script (বাংলা)."
    system = SAFETY + APP_HELP + CHAT_RULES + lang
    reply = ""
    errs = []
    for extra, mt in (({"frequency_penalty": 0.6, "presence_penalty": 0.3}, 500), (None, 500), (None, 700)):
        try:
            reply = clean_reply(llm([{"role": "system", "content": system}] + msgs, max_tokens=mt, extra=extra))
        except Exception as e:
            errs.append(str(e))
            reply = ""
        if reply.strip():
            break
    if not reply.strip():
        return err(errs[-1] if errs else "The AI sent an empty answer. Please try again.")
    if emergency:
        reply = "EMERGENCY: call 999 or go to the nearest emergency hospital now.\n\n" + reply
    return {"reply": reply, "emergency": emergency}


def data_url_parts(u):
    m = re.match(r"data:([^;]+);base64,(.+)", u or "", re.S)
    if not m:
        raise ValueError("bad file")
    return m.group(1), m.group(2)


REPORT_PROMPT = """You help a patient understand a medical report (lab test, urine test, imaging report or similar).
Return ONLY one JSON object, no other text:
{"report_type":"blood|urine|imaging|prescription|other","report_date":"","lab":"",
"patient":{"name":"","age":"","sex":""},
"items":[{"category":"e.g. Complete blood count","name":"","value":"","unit":"","range":"","flag":"HIGH|LOW|NORMAL|UNKNOWN","meaning":"one plain sentence: what this test measures"}],
"key_findings":[{"text":"","severity":"info|watch|important"}],
"summary":"4 to 6 plain sentences in English","summary_bn":"the same summary in Bangla",
"urgency":"routine|soon|urgent","see_doctor":"when to see a doctor and which kind",
"questions_for_doctor":["",""],"general_tips":["general non-medicine lifestyle tips related to the abnormal results"]}
Rules: copy value, unit and reference range exactly as printed; never invent a value or a range. If no range is printed, flag UNKNOWN.
Put every printed test in items, grouped by category. key_findings = the abnormal results explained simply (max 6).
For an imaging report or a scan picture: report only what the printed text says; never name a tumour or disease yourself;
say a radiologist and a doctor must interpret it. No diagnosis. No medicine names or doses.
urgency is "urgent" only if the report itself marks a value critical/panic; "soon" if several values are abnormal; otherwise "routine"."""

NUM = r"-?\d+(?:\.\d+)?"


def _num(x):
    m = re.search(NUM, str(x or "").replace(",", ""))
    return float(m.group()) if m else None


def _range(x):
    t = str(x or "").replace(",", "").replace("\u2013", "-").replace("\u2014", "-")
    m = re.search(rf"({NUM})\s*(?:-|to)\s*({NUM})", t, re.I)
    if m:
        return float(m[1]), float(m[2])
    m = re.search(rf"(?:<=|<|\u2264|up to|upto|below)\s*({NUM})", t, re.I)
    if m:
        return None, float(m[1])
    m = re.search(rf"(?:>=|>|\u2265|above)\s*({NUM})", t)
    if m:
        return float(m[1]), None
    return None, None


def enrich(d, src=""):
    """Re-check every flag ourselves from the printed value and range; do not trust the model's flag."""
    flat = re.sub(r"\s+", "", src.replace(",", "")) if src else ""
    items = []
    for it in (d.get("items") or [])[:90]:
        if not isinstance(it, dict) or not str(it.get("name", "")).strip():
            continue
        v, (lo, hi) = _num(it.get("value")), _range(it.get("range"))
        flag = str(it.get("flag", "")).upper()
        if v is not None and (lo is not None or hi is not None):
            flag = "LOW" if lo is not None and v < lo else "HIGH" if hi is not None and v > hi else "NORMAL"
        elif flag not in ("HIGH", "LOW", "NORMAL"):
            flag = "UNKNOWN"
        it.update(flag=flag, num=v, lo=lo, hi=hi)
        if flat:
            val = re.sub(r"\s+", "", str(it.get("value", "")).replace(",", ""))
            it["verified"] = bool(val) and val in flat
        items.append(it)
    d["items"] = items
    d["counts"] = {k: sum(1 for i in items if i["flag"] == k) for k in ("NORMAL", "HIGH", "LOW", "UNKNOWN")}
    if d.get("urgency") not in ("routine", "soon", "urgent"):
        d["urgency"] = "routine"
    for k in ("key_findings", "questions_for_doctor", "general_tips"):
        if not isinstance(d.get(k), list):
            d[k] = []
    return d


@app.post("/api/v3/report")
def report():
    j = request.json or {}
    lang = "\nWrite 'summary' mainly for a Bangla-speaking reader; keep test names as printed." if j.get("lang") == "bn" else ""
    src = ""
    try:
        mime, b64 = data_url_parts(j.get("file"))
        if len(b64) > 12_000_000:
            return err("File too large (max ~8 MB)", 413)
        if mime == "application/pdf":
            from pypdf import PdfReader
            rd = PdfReader(io.BytesIO(base64.b64decode(b64)))
            src = "\n".join((p.extract_text() or "") for p in rd.pages)[:14000]
            if len(src.strip()) >= 20:
                content = REPORT_PROMPT + lang + "\n\nREPORT TEXT:\n" + src
            else:  # scanned PDF: send embedded page images to the vision model
                imgs = []
                for p in rd.pages[:3]:
                    for im in list(p.images)[:2]:
                        ext = im.name.rsplit(".", 1)[-1].lower().replace("jpg", "jpeg")
                        if ext in ("jpeg", "png"):
                            imgs.append({"type": "image_url", "image_url": {"url": f"data:image/{ext};base64," + base64.b64encode(im.data).decode()}})
                if not imgs:
                    return err("This PDF has no readable text. Upload a clear photo of each page instead.", 422)
                src = ""
                content = [{"type": "text", "text": REPORT_PROMPT + lang}] + imgs
        elif mime.startswith("image/"):
            content = [{"type": "text", "text": REPORT_PROMPT + lang},
                       {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}]
        else:
            return err("Use PDF, JPG or PNG", 415)
        d = enrich(parse_json(llm([{"role": "user", "content": content}], json_out=True, max_tokens=3500)), src)
    except Exception as e:
        return err(e)
    if not d["items"] and not d.get("summary"):
        return err("Could not find any test results in this file. Try a clearer, well-lit photo or the original PDF.", 422)
    d["checked_against"] = "pdf_text" if src else "image"
    d["disclaimer"] = DISCLAIMER
    return d


def wound_old():
    j = request.json or {}
    try:
        mime, b64 = data_url_parts(j.get("image"))
        q = "Describe only what is visible in this wound/skin photo (colour, swelling, discharge, size cues, image quality). " \
            "Do NOT diagnose or say whether it is infected. Mention limits of a photo. Max 80 words. User answers: " + json.dumps(j.get("answers", {}))
        obs = llm([{"role": "system", "content": SAFETY},
                   {"role": "user", "content": [{"type": "text", "text": q},
                                                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}]}])
    except Exception as e:
        return jsonify({"available": False, "error": str(e)})
    return {"available": True, "observations": obs}


@app.post("/api/v3/rx-organize")
def rx():
    t = ((request.json or {}).get("text") or "")[:3000]
    p = ("Organize this doctor's prescription text into JSON only: {\"items\":[{\"name\":\"brand\",\"generic\":\"\","
         "\"company\":\"\",\"dose\":\"\",\"frequency\":\"\",\"duration\":\"days\"}]}. Copy only what the text says; "
         "leave a field empty if not stated. Do not add medicines or change doses.\n\n" + t)
    try:
        d = parse_json(llm([{"role": "user", "content": p}], json_out=True))
    except Exception as e:
        return err(e)
    return {"items": d.get("items", []), "disclaimer": "AI organized the doctor's text only. AI did not prescribe."}


_MEDS = None


def meds():
    global _MEDS
    if _MEDS is None:
        path = next((p for p in (os.path.join(HERE, "data", "bd_medicines.csv"), os.path.join(HERE, "bd_medicines.csv")) if os.path.exists(p)), None)
        _MEDS = list(csv.DictReader(open(path, encoding="utf-8"))) if path else []
    return _MEDS


@app.get("/api/v3/bd-medicine")
def bd_medicine():
    q = (request.args.get("q") or "").lower().strip()
    if len(q) < 2:
        return {"items": [], "count": len(meds()), "source": "Local verified dataset"}
    items = [m for m in meds() if q in (m.get("brand", "") + " " + m.get("generic", "") + " " + m.get("company", "")).lower()][:30]
    return {"items": items, "count": len(meds()), "source": "Local verified dataset"}


# ---------------- Medicine AI: answers ONLY from the 40 listed sources ----------------
import html as _html
from concurrent.futures import ThreadPoolExecutor, wait as _wait
from urllib.parse import urlparse, parse_qs, unquote, quote

# (domain, display name) - most specific domain first
MED_SOURCES = [
    ("info.dgda.gov.bd", "DGDA Allopathic Medicines Database"), ("dgda.gov.bd", "DGDA Bangladesh"),
    ("medex.com.bd", "MedEx Bangladesh"), ("16263.dghs.gov.bd", "Shastho Batayon 16263"),
    ("iphn.dghs.gov.bd", "Institute of Public Health Nutrition"), ("dghs.gov.bd", "DGHS Bangladesh"),
    ("mohfw.gov.bd", "Ministry of Health and Family Welfare"), ("iedcr.gov.bd", "IEDCR"),
    ("icddrb.org", "icddr,b"), ("bmdc.org.bd", "BMDC"), ("bnmc.gov.bd", "Bangladesh Nursing and Midwifery Council"),
    ("nipsom.gov.bd", "NIPSOM"), ("nins.gov.bd", "National Institute of Neurosciences & Hospital"),
    ("nicvd.gov.bd", "National Institute of Cardiovascular Diseases"), ("bsmmu.edu.bd", "BSMMU"),
    ("pcb.gov.bd", "Pharmacy Council of Bangladesh"), ("bangladesh.gov.bd", "Bangladesh National Portal"),
    ("who.int", "WHO"), ("medlineplus.gov", "MedlinePlus Drugs"), ("dailymed.nlm.nih.gov", "DailyMed"),
    ("open.fda.gov", "OpenFDA"), ("api.fda.gov", "OpenFDA"), ("fda.gov", "US FDA"), ("nhs.uk", "NHS Medicines A to Z"),
    ("nice.org.uk", "NICE UK"), ("ema.europa.eu", "European Medicines Agency"), ("canada.ca", "Health Canada"),
    ("tga.gov.au", "Australia TGA"), ("medsafe.govt.nz", "New Zealand Medsafe"), ("hsa.gov.sg", "Singapore HSA"),
    ("cdsco.gov.in", "India CDSCO"), ("pubmed.ncbi.nlm.nih.gov", "PubMed"), ("cochrane.org", "Cochrane Library"),
    ("msdmanuals.com", "MSD Manuals"), ("mayoclinic.org", "Mayo Clinic Drugs & Supplements"),
    ("my.clevelandclinic.org", "Cleveland Clinic Health Library"),
]
SEARCH_GROUPS = [
    ["medex.com.bd", "dgda.gov.bd", "dghs.gov.bd", "mohfw.gov.bd"],
    ["16263.dghs.gov.bd", "iphn.dghs.gov.bd", "iedcr.gov.bd", "icddrb.org", "bmdc.org.bd", "bnmc.gov.bd", "pcb.gov.bd", "bangladesh.gov.bd"],
    ["nipsom.gov.bd", "nins.gov.bd", "nicvd.gov.bd", "bsmmu.edu.bd", "who.int"],
    ["medlineplus.gov", "dailymed.nlm.nih.gov", "fda.gov"],
    ["nhs.uk", "nice.org.uk", "ema.europa.eu"],
    ["canada.ca", "tga.gov.au", "medsafe.govt.nz", "hsa.gov.sg", "cdsco.gov.in"],
    ["pubmed.ncbi.nlm.nih.gov", "cochrane.org"],
    ["msdmanuals.com", "mayoclinic.org", "my.clevelandclinic.org"],
]
BROWSER = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
           "Accept-Language": "en-US,en;q=0.9"}


def src_name(host):
    host = (host or "").lower()
    for dom, name in MED_SOURCES:
        if host == dom or host.endswith("." + dom):
            return name
    return None


def page_text(raw):
    raw = re.sub(r"(?is)<(script|style|noscript|nav|footer|header|svg|form)\b.*?</\1>", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", _html.unescape(raw)).strip()


def windows(text, terms, width=700, maxn=2, cap=1400):
    low, out, last = text.lower(), [], -10**9
    for t in terms:
        i = low.find(t.lower())
        while i != -1 and len(out) < maxn:
            if i - last > width:
                out.append(text[max(0, i - 150): i + width]); last = i
            i = low.find(t.lower(), i + width)
        if len(out) >= maxn:
            break
    return " ... ".join(out)[:cap]


def ddg_hits(q):
    try:
        r = requests.post("https://html.duckduckgo.com/html/", data={"q": q}, headers=BROWSER, timeout=8)
        urls = []
        for h in re.findall(r'class="result__a"[^>]*href="([^"]+)"', r.text):
            h = _html.unescape(h)
            if "uddg=" in h:
                h = unquote(parse_qs(urlparse("https:" + h if h.startswith("//") else h).query).get("uddg", [""])[0])
            if h.startswith("http"):
                urls.append(h)
        return urls[:6]
    except Exception:
        return []


def fetch_page(url, terms):
    try:
        r = requests.get(url, headers=BROWSER, timeout=7)
        if r.status_code != 200 or "html" not in r.headers.get("content-type", "") and "text" not in r.headers.get("content-type", ""):
            return None
        sn = windows(page_text(r.text[:600000]), terms)
        host = urlparse(url).netloc
        return {"name": src_name(host), "url": url, "text": sn} if sn and src_name(host) else None
    except Exception:
        return None


def api_openfda(name):
    try:
        s = quote('openfda.generic_name:"%s" openfda.brand_name:"%s"' % (name, name), safe=':"')
        d = requests.get("https://api.fda.gov/drug/label.json?search=" + s.replace(" openfda", "+openfda") + "&limit=1", timeout=8, headers=UA).json()
        x = (d.get("results") or [None])[0]
        if not x:
            return None
        parts = []
        for k, lab in (("indications_and_usage", "Uses"), ("warnings", "Warnings"), ("contraindications", "Contraindications"),
                       ("drug_interactions", "Interactions"), ("pregnancy", "Pregnancy")):
            if x.get(k):
                parts.append(lab + ": " + " ".join(x[k])[:450])
        return {"name": "OpenFDA (US FDA drug label)", "url": "https://open.fda.gov/apis/drug/label/", "text": " ".join(parts)[:1600]} if parts else None
    except Exception:
        return None


def api_dailymed(name):
    try:
        d = requests.get("https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=" + quote(name) + "&pagesize=3", timeout=8, headers=UA).json()
        rows = d.get("data") or []
        if not rows:
            return None
        return {"name": "DailyMed", "url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=" + quote(name),
                "text": "Official FDA label listings found: " + "; ".join(r.get("title", "")[:120] for r in rows[:3])}
    except Exception:
        return None


def api_pubmed(name):
    try:
        ids = requests.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=3&sort=relevance&term=" + quote(name + "[Title] AND (review[pt] OR guideline[pt])"), timeout=8, headers=UA).json()["esearchresult"]["idlist"]
        if not ids:
            return None
        s = requests.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + ",".join(ids), timeout=8, headers=UA).json()["result"]
        t = "; ".join(s[i].get("title", "")[:160] for i in ids if i in s)
        return {"name": "PubMed", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=" + quote(name), "text": "Related published reviews/guidelines: " + t}
    except Exception:
        return None


def local_dataset(names):
    rows, seen = [], set()
    for m in meds():
        blob = (m.get("brand", "") + " " + m.get("generic", "")).lower()
        if any(n.lower() in blob for n in names):
            k = (m.get("brand"), m.get("strength"))
            if k not in seen:
                seen.add(k)
                rows.append("%s (%s) %s %s, %s" % (m.get("brand", ""), m.get("generic", ""), m.get("strength", ""), m.get("form", ""), m.get("company", "")))
        if len(rows) >= 6:
            break
    return {"name": "Bangladesh medicine dataset (DGDA/MedEx based)", "url": "https://info.dgda.gov.bd/allopathic-medicines?page=1",
            "text": "Bangladesh brands: " + "; ".join(rows)} if rows else None


def gather_med_sources(query):
    names = [query]
    try:
        d = parse_json(llm([{"role": "user", "content":
            "The user typed this medicine search (may be Bangla script, Banglish/romanized Bangla, or a misspelled brand/generic): " + repr(query) +
            ". Return ONLY JSON {\"names\":[\"up to 3 English search names: generic name first, then brand\"]}. Do not explain."}],
            json_out=True, max_tokens=100))
        names = [str(x).strip() for x in (d.get("names") or []) if str(x).strip()][:3] or [query]
    except Exception:
        pass
    primary = names[0]
    jobs = [lambda: local_dataset(names), lambda: api_openfda(primary), lambda: api_dailymed(primary), lambda: api_pubmed(primary)]
    ex = ThreadPoolExecutor(max_workers=16)
    fixed = [ex.submit(j) for j in jobs]
    searches = [ex.submit(ddg_hits, primary + " medicine (" + " OR ".join("site:" + d for d in g) + ")") for g in SEARCH_GROUPS]
    _wait(searches, timeout=10)
    pages, seen_hosts = [], set()
    for f in searches:
        if f.done():
            for u in f.result():
                nm = src_name(urlparse(u).netloc)
                if nm and nm not in seen_hosts and len(pages) < 12:
                    seen_hosts.add(nm); pages.append(u)
    page_f = [ex.submit(fetch_page, u, names) for u in pages]
    _wait(fixed + page_f, timeout=14)
    found = [f.result() for f in fixed + page_f if f.done() and f.result()]
    ex.shutdown(wait=False)
    return names, found


@app.post("/api/v3/bd-medicine-ai")
def bd_medicine_ai():
    j = request.get_json(silent=True) or {}
    query = str(j.get("query", "")).strip()[:120]
    lang = str(j.get("lang", "en")).lower()
    if len(query) < 2:
        return err("Enter a medicine name or active ingredient.", 400)
    bn = lang == "bn" or bool(re.search(r"[\u0980-\u09FF]", query)) or is_banglish(query)
    fallback = [{"name": n, "url": u} for n, u in (("DGDA Allopathic Medicines Database", "https://info.dgda.gov.bd/allopathic-medicines?page=1"),
                ("MedEx Bangladesh", "https://medex.com.bd/"), ("MedlinePlus Drugs", "https://medlineplus.gov/druginformation.html"))]
    try:
        names, found = gather_med_sources(query)
        if not found:
            msg = ("এই ৪০টি সূত্রে “%s” সম্পর্কে এখন কোনো তথ্য পাওয়া যায়নি। নিচের অফিসিয়াল লিংকে নিজে খুঁজে দেখুন বা ফার্মাসিস্টকে জিজ্ঞেস করুন।" % query) if bn else \
                  ("No information about “%s” could be found in the 40 listed sources right now. Please check the official links below or ask a pharmacist." % query)
            return {"query": query, "answer": msg, "disclaimer": DISCLAIMER, "sources": fallback}
        ctx = "\n\n".join("[S%d] %s (%s)\n%s" % (i + 1, s["name"], s["url"], s["text"]) for i, s in enumerate(found))
        prompt = (
            "Answer a medicine information search using ONLY the SOURCE EXCERPTS below, which were retrieved from official health sources. "
            "Do NOT use your own knowledge or memory. If a point is not in the excerpts, do not state it; say it was not found in the sources. "
            "The user typed: " + repr(query) + " (understood as: " + ", ".join(names) + "). "
            "Write short points (what it is, common uses, key warnings/interactions, pregnancy/children/allergy caution, Bangladesh brands only if shown). "
            "After each point put the source tag like [S1] or [S2]. Do not invent brands, registration status or sources. "
            "Do not give dose, frequency or duration, and do not tell the user to take it. "
            "End with: This is not a prescription; confirm with a registered doctor or pharmacist. Emergency: call 999. "
            + ("Reply in Bangla script (keep medicine names in English)." if bn else "Reply in simple English.")
            + "\n\nSOURCE EXCERPTS:\n" + ctx)
        answer = llm([{"role": "system", "content": SAFETY}, {"role": "user", "content": prompt}], max_tokens=700)
        return {"query": query, "answer": answer, "disclaimer": DISCLAIMER,
                "official_source": "https://info.dgda.gov.bd/allopathic-medicines?page=1",
                "sources": [{"name": "S%d · %s" % (i + 1, s["name"]), "url": s["url"]} for i, s in enumerate(found)]}
    except Exception as e:
        return err(str(e))


RX_PROMPT = (
    "A person describes symptoms. Suggest at most 4 generic medicines a doctor could consider, for the doctor to review. "
    "Return ONLY JSON: {\"items\":[{\"generic\":\"\",\"purpose\":\"\",\"cautions\":\"\"}],\"note\":\"\"}. "
    "Rules: generic names only; NO doses, NO frequency, NO duration; NO antibiotics, steroids, sedatives, opioids or controlled drugs; "
    "avoid anything matching the allergies; if the person is a child under 12, pregnant, or the problem is unclear or serious, "
    "return an empty items list and say a doctor must examine them first."
)


@app.post("/api/v3/rx-draft")
def rx_draft():
    j = request.json or {}
    text = (j.get("text") or "")[:1500]
    if RED.search(text):
        return {"emergency": True}
    p = RX_PROMPT + f"\nAge: {j.get('age') or 'unknown'}. Allergies: {j.get('allergy') or 'none stated'}. Symptoms: {text}"
    try:
        d = parse_json(llm([{"role": "user", "content": p}], json_out=True))
    except Exception as e:
        return err(e)
    allm = meds()
    items = []
    for it in (d.get("items") or [])[:4]:
        g = (it.get("generic") or "").strip().lower()
        seen, brands = set(), []
        for m in allm:
            if g and g in m.get("generic", "").lower():
                k = (m["brand"], m.get("strength", ""))
                if k not in seen:
                    seen.add(k); brands.append({x: m.get(x, "") for x in ("brand", "company", "strength", "form")})
            if len(brands) >= 5:
                break
        items.append({"generic": it.get("generic", ""), "purpose": it.get("purpose", ""), "cautions": it.get("cautions", ""), "brands": brands})
    sp = os.path.join(HERE, "data", "SOURCE.txt")
    return {"items": items, "note": d.get("note", ""), "dataset": len(allm), "source": open(sp, encoding="utf-8").read() if os.path.exists(sp) else "",
            "disclaimer": "DRAFT for doctor review. Not a prescription. Do not take any medicine until a registered doctor has examined you and approved it. Emergency: call 999."}


def hav(a, b, c, d):
    p = math.pi / 180
    x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))


OVERPASS = ["https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]
SEL = {"hospital": ['["amenity"="hospital"]', '["healthcare"="hospital"]'],
       "clinic": ['["amenity"="clinic"]', '["amenity"="doctors"]', '["healthcare"="clinic"]', '["healthcare"="doctor"]'],
       "diagnostic": ['["healthcare"="laboratory"]', '["healthcare"="diagnostic_centre"]', '["amenity"="laboratory"]'],
       "pharmacy": ['["amenity"="pharmacy"]', '["healthcare"="pharmacy"]']}
SEL["all"] = SEL["hospital"] + SEL["clinic"] + SEL["diagnostic"]
SEL["emergency"] = SEL["hospital"]
_HC = {}


def overpass(sel, lat, lon, r):
    q = "[out:json][timeout:20];(" + "".join(f"nwr{s}(around:{r},{lat},{lon});" for s in sel) + ");out tags center 400;"
    last = "no response"
    for u in OVERPASS:  # try the next public server if one is busy or down
        try:
            resp = requests.post(u, data={"data": q}, headers=UA, timeout=25)
            if resp.status_code == 200:
                return resp.json().get("elements", [])
            last = f"{u.split('/')[2]} HTTP {resp.status_code}"
        except Exception as e:
            last = f"{u.split('/')[2]}: {type(e).__name__}"
    raise RuntimeError("Map data servers are busy right now (" + last + "). Please try again in a minute.")


def parse_places(els, lat, lon):
    out, seen = [], set()
    for e in els:
        tg = e.get("tags", {})
        la, lo = e.get("lat") or (e.get("center") or {}).get("lat"), e.get("lon") or (e.get("center") or {}).get("lon")
        if la is None or lo is None:
            continue
        typ = tg.get("amenity") or tg.get("healthcare") or "facility"
        name = next((tg[k] for k in ("name", "name:en", "name:bn", "official_name", "operator", "brand") if tg.get(k)), "Unnamed " + typ)
        key = (name.lower(), round(la, 3), round(lo, 3))
        if key in seen:
            continue
        seen.add(key)
        addr = tg.get("addr:full") or ", ".join(x for x in (tg.get("addr:housenumber"), tg.get("addr:street"), tg.get("addr:suburb") or tg.get("addr:city")) if x)
        out.append({"name": name, "lat": la, "lon": lo, "type": typ, "address": addr,
                    "phone": tg.get("phone") or tg.get("contact:phone") or tg.get("contact:mobile"),
                    "website": tg.get("website") or tg.get("contact:website"),
                    "emergency": tg.get("emergency"), "hours": tg.get("opening_hours"),
                    "km": round(hav(lat, lon, la, lo), 1)})
    return out


def nominatim_places(lat, lon, t):
    d = 0.1
    term = {"pharmacy": "pharmacy", "clinic": "clinic", "diagnostic": "diagnostic centre"}.get(t, "hospital")
    r = requests.get("https://nominatim.openstreetmap.org/search", headers=UA, timeout=15,
                     params={"q": term, "format": "jsonv2", "limit": 40, "bounded": 1,
                             "viewbox": f"{lon - d},{lat + d},{lon + d},{lat - d}"})
    r.raise_for_status()
    return [{"name": x["display_name"].split(",")[0], "lat": float(x["lat"]), "lon": float(x["lon"]), "type": x.get("type") or term,
             "address": ", ".join(x["display_name"].split(",")[1:3]).strip(), "phone": None, "website": None, "emergency": None,
             "hours": None, "km": round(hav(lat, lon, float(x["lat"]), float(x["lon"])), 1)} for x in r.json()]


@app.get("/api/v3/hospitals")
def hospitals():
    try:
        lat, lon = float(request.args["lat"]), float(request.args["lon"])
        assert -90 <= lat <= 90 and -180 <= lon <= 180
    except Exception:
        return err("Valid lat/lon required", 400)
    t = request.args.get("type", "all")
    if t not in SEL:
        t = "all"
    ck = (round(lat, 2), round(lon, 2), t)
    if ck in _HC and time.time() - _HC[ck][0] < 600:
        return _HC[ck][1]
    out, used, fallback, error = [], 0, False, None
    for r in (2500, 6000, 15000, 35000):  # widen the search until something is found (towns and villages)
        try:
            out = parse_places(overpass(SEL[t], lat, lon, r), lat, lon)
        except Exception as e:
            error = e
            break
        used = r
        if len(out) >= 8:
            break
    if error and not out:
        try:
            out, used, fallback = nominatim_places(lat, lon, t), 11000, True
        except Exception:
            return err(error)
    out = [x for x in out if x["km"] <= used / 1000 + 0.5]
    out.sort(key=lambda x: (t == "emergency" and x["emergency"] != "yes", x["km"]))
    res = {"items": out[:40], "radius_km": round(used / 1000), "fallback": fallback, "fetched": time.strftime("%H:%M"),
           "source": "OpenStreetMap contributors" + (" (Nominatim search)" if fallback else "") + ". May be incomplete or out of date"}
    if out:
        _HC[ck] = (time.time(), res)
    return res


@app.get("/api/v3/geocode")
def geocode():
    q = request.args.get("q", "").strip()
    if not q:
        return err("Type an area name", 400)
    try:
        r = requests.get("https://nominatim.openstreetmap.org/search", params={"q": q, "format": "json", "limit": 1, "countrycodes": "bd"},
                         headers=UA, timeout=15)
        r.raise_for_status()
        j = r.json()
    except Exception:
        return err("Place search is busy. Try again or use 'Use my location'.")
    if not j:
        return err("Area not found in Bangladesh. Try a bigger area name, e.g. 'Cumilla'.", 404)
    return {"lat": float(j[0]["lat"]), "lon": float(j[0]["lon"]), "name": j[0]["display_name"]}


# ---------------- v5: body-part AI, combined reports, 3D model, Bangladesh sources ----------------
BD_SOURCES = [
    {"name": "National Emergency Service Bangladesh", "how": "Emergency assistance: call 999 | https://police.gov.bd"},
    {"name": "DGHS Health Call Centre — Shastho Batayon", "how": "Health advice: call 16263 | https://16263.dghs.gov.bd"},
    {"name": "Directorate General of Health Services (DGHS)", "how": "Official health services, notices and facilities | https://dghs.gov.bd"},
    {"name": "Directorate General of Drug Administration (DGDA)", "how": "Medicine regulation and drug safety information | https://dgda.gov.bd"},
    {"name": "Institute of Epidemiology, Disease Control and Research (IEDCR)", "how": "Disease surveillance and public-health updates | https://iedcr.gov.bd"},
    {"name": "Ministry of Health and Family Welfare", "how": "National health policy and ministry notices | https://mohfw.gov.bd"},
    {"name": "Bangladesh Medical & Dental Council (BMDC)", "how": "Medical and dental practitioner regulation | https://bmdc.org.bd"},
    {"name": "Bangladesh Nursing and Midwifery Council (BNMC)", "how": "Nursing and midwifery council information | https://bnmc.gov.bd"},
    {"name": "National Institute of Preventive and Social Medicine (NIPSOM)", "how": "Public-health education and research | https://nipsom.gov.bd"},
    {"name": "National Institute of Neurosciences & Hospital (NINS)", "how": "Specialist public hospital information | https://nins.gov.bd"},
    {"name": "National Institute of Cardiovascular Diseases (NICVD)", "how": "Cardiovascular specialist hospital information | https://nicvd.gov.bd"},
    {"name": "Bangladesh Specialized Hospital information via DGHS", "how": "Use the DGHS official website for facility/service information | https://dghs.gov.bd"},
    {"name": "icddr,b", "how": "Health research and public-health resources | https://icddrb.org"},
    {"name": "World Health Organization — Bangladesh", "how": "Public-health guidance and Bangladesh updates | https://www.who.int/bangladesh"},
    {"name": "MedlinePlus — US National Library of Medicine / NIH", "how": "Health conditions, symptoms, medicines and safety | https://medlineplus.gov/"},
    {"name": "NHS — UK National Health Service", "how": "Symptoms, conditions and treatment information | https://www.nhs.uk/"},
    {"name": "US Food and Drug Administration (FDA)", "how": "Medicine safety and approved drug information | https://www.fda.gov/drugs"},
    {"name": "DailyMed — US National Library of Medicine", "how": "Official FDA-submitted medicine labeling | https://dailymed.nlm.nih.gov/dailymed/"},
    {"name": "World Health Organization — Medicines", "how": "Essential medicines and safe-use guidance | https://www.who.int/health-topics/medicines"},
    {"name": "MedEx Bangladesh", "how": "Bangladesh brand and generic medicine directory | https://medex.com.bd/"},
    {"name": "Bangladesh National Portal", "how": "Government directory for official public services | https://bangladesh.gov.bd"},
    {"name": "CDC", "how": "Disease prevention and health guidance | https://www.cdc.gov/"},
    {"name": "National Institutes of Health (NIH)", "how": "Biomedical research and health information | https://www.nih.gov/"},
    {"name": "PubMed", "how": "Biomedical literature search | https://pubmed.ncbi.nlm.nih.gov/"},
    {"name": "Cochrane", "how": "Systematic reviews of health evidence | https://www.cochrane.org/"},
    {"name": "NICE UK", "how": "Evidence-based health and care guidance | https://www.nice.org.uk/"},
    {"name": "European Medicines Agency (EMA)", "how": "Medicine safety and regulatory information | https://www.ema.europa.eu/"},
    {"name": "Health Canada", "how": "Canadian medicine and health-product safety | https://www.canada.ca/en/health-canada.html"},
    {"name": "Australia TGA", "how": "Medicine and therapeutic-goods regulation | https://www.tga.gov.au/"},
    {"name": "Australian Healthdirect", "how": "Consumer health information | https://www.healthdirect.gov.au/"},
    {"name": "New Zealand Medsafe", "how": "Medicine safety and regulation | https://www.medsafe.govt.nz/"},
    {"name": "Singapore HealthHub", "how": "Public health and medicine information | https://www.healthhub.sg/"},
    {"name": "Singapore HSA", "how": "Health-product safety and regulation | https://www.hsa.gov.sg/"},
    {"name": "India Ministry of Health", "how": "Official Indian health guidance | https://mohfw.gov.in/"},
    {"name": "India CDSCO", "how": "Drug regulatory information | https://cdsco.gov.in/"},
    {"name": "UNICEF Health", "how": "Child and maternal health resources | https://www.unicef.org/health"},
    {"name": "WHO Essential Medicines", "how": "Essential medicines resources | https://www.who.int/teams/health-product-policy-and-standards/essential-medicines"},
    {"name": "WHO Clinical Trials Search", "how": "International clinical trial information | https://trialsearch.who.int/"},
    {"name": "ClinicalTrials.gov", "how": "Clinical studies registry | https://clinicaltrials.gov/"},
    {"name": "NCI", "how": "Cancer information from the US National Cancer Institute | https://www.cancer.gov/"},
    {"name": "NINDS", "how": "Neurological conditions and research | https://www.ninds.nih.gov/"},
    {"name": "NHLBI", "how": "Heart, lung, blood and sleep health | https://www.nhlbi.nih.gov/"},
    {"name": "NIDDK", "how": "Diabetes, digestive and kidney health | https://www.niddk.nih.gov/"},
    {"name": "American Heart Association", "how": "Heart and stroke health information | https://www.heart.org/"},
    {"name": "American Diabetes Association", "how": "Diabetes care and education | https://diabetes.org/"},
    {"name": "American Academy of Pediatrics", "how": "Child health guidance | https://www.healthychildren.org/"},
    {"name": "Family Doctor (AAFP)", "how": "Primary-care health information | https://familydoctor.org/"},
    {"name": "Mayo Clinic", "how": "Conditions, symptoms and treatment overview | https://www.mayoclinic.org/"},
    {"name": "Cleveland Clinic", "how": "Patient health information | https://my.clevelandclinic.org/"},
    {"name": "Johns Hopkins Medicine", "how": "Health and medical information | https://www.hopkinsmedicine.org/"},
    {"name": "MSD Manuals", "how": "Medical reference for consumers and professionals | https://www.msdmanuals.com/"},
    {"name": "NHS Medicines A to Z", "how": "Medicine use and safety | https://www.nhs.uk/medicines/"},
    {"name": "FDA Drug Safety", "how": "Drug alerts and safety communications | https://www.fda.gov/drugs/drug-safety-and-availability"},
    {"name": "DailyMed", "how": "Medicine labeling information | https://dailymed.nlm.nih.gov/dailymed/"},
    {"name": "MedlinePlus Drugs", "how": "Patient medicine information | https://medlineplus.gov/druginformation.html"},
    {"name": "OpenFDA", "how": "Searchable FDA datasets and drug labels | https://open.fda.gov/"},
    {"name": "Bangladesh DGDA Medicine Database", "how": "Official Bangladesh allopathic medicine listing | https://info.dgda.gov.bd/allopathic-medicines?page=1"},
    {"name": "MedEx Bangladesh", "how": "Bangladesh brand and generic medicine directory | https://medex.com.bd/"},
]
BLOCK = re.compile(r"morphine|codeine|tramadol|pethidine|fentanyl|diazepam|alprazolam|clonazepam|lorazepam|zolpidem|"
                   r"amoxicillin|azithromycin|ciprofloxacin|cef\w+|doxycycline|metronidazole|prednisolone|dexamethasone|"
                   r"hydrocortisone|betamethasone|methylprednisolone", re.I)
MED_RULES = ("Medicines: generic names only; NO doses, frequency or duration; NO antibiotics, steroids, sedatives, opioids or controlled drugs; "
             "none for a child under 12 or pregnancy; if unclear or serious return an empty medicines list. A registered doctor decides.")
DRAFT = "DRAFT for doctor review. Not a prescription. Do not take any medicine until a registered doctor has examined you. Emergency: call 999."


def safe_meds(items):
    allm, out = meds(), []
    for it in (items or [])[:4]:
        if not isinstance(it, dict):
            continue
        g = str(it.get("generic", "")).strip()
        if not g or BLOCK.search(g):
            continue
        seen, brands = set(), []
        for m in allm:
            if g.lower() in m.get("generic", "").lower():
                k = (m["brand"], m.get("strength", ""))
                if k not in seen:
                    seen.add(k); brands.append({x: m.get(x, "") for x in ("brand", "company", "strength", "form")})
            if len(brands) >= 5:
                break
        out.append({"generic": g, "purpose": it.get("purpose", ""), "cautions": it.get("cautions", ""), "brands": brands})
    return out


def lists(d, *keys):
    for k in keys:
        if not isinstance(d.get(k), list):
            d[k] = []
    return d


@app.get("/api/model")
def model():
    d = os.path.join(HERE, "models")
    f = next((x for x in sorted(os.listdir(d)) if x.lower().endswith((".glb", ".gltf"))), None) if os.path.isdir(d) else None
    return {"available": bool(f), "url": "/models/" + f if f else None}


@app.get("/models/<path:f>")
def model_file(f):
    return send_from_directory(os.path.join(HERE, "models"), f)


@app.get("/api/v5/sources")
def sources():
    return {"items": BD_SOURCES}



import hmac, threading, uuid
CASES = os.path.join(HERE, "data", "cases.json")
_LK = threading.Lock()
URG = ("routine", "soon", "urgent", "emergency")
ADV_SCHEMA = ('{"urgency":"routine|soon|urgent","summary":"","possible_causes":[{"name":"","likelihood":"more likely|possible|less likely","why":""}],'
              '"red_flags":[],"tests":[{"name":"","why":""}],"medicines":[{"generic":"","purpose":"","cautions":""}],"lifestyle":[],"see_doctor":"","notes":[]}')


def _load():
    try:
        return json.load(open(CASES, encoding="utf-8"))
    except Exception:
        return {}


def _save(d):
    os.makedirs(os.path.dirname(CASES), exist_ok=True)
    json.dump(d, open(CASES, "w", encoding="utf-8"), ensure_ascii=False)


def new_case(kind, title, advice, profile):
    cid = uuid.uuid4().hex[:10]
    with _LK:
        d = _load()
        d[cid] = {"id": cid, "kind": kind, "title": str(title)[:80], "created": int(time.time()), "status": "pending",
                  "advice": advice, "profile": profile or {}, "doctor": "", "bmdc": "", "note": ""}
        _save(d)
    return cid


def finish(d, profile, text=""):
    """Code-level safety applied to every AI draft."""
    p = profile or {}
    lists(d, "possible_causes", "red_flags", "tests", "medicines", "lifestyle", "notes")
    d["urgency"] = d.get("urgency") if d.get("urgency") in URG[:3] else "soon"
    try:
        age = float(re.search(r"\d+(?:\.\d+)?", str(p.get("age", ""))).group())
    except Exception:
        age = None
    meds_ok = not ((age is not None and age < 12) or str(p.get("pregnant", "")).lower() in ("yes", "true"))
    allergy = [a.strip().lower() for a in re.split(r"[,;/]", str(p.get("allergy", ""))) if len(a.strip()) > 2]
    items = [m for m in d["medicines"] if isinstance(m, dict) and not any(a in str(m.get("generic", "")).lower() or str(m.get("generic", "")).lower() in a for a in allergy)]
    d["medicines"] = safe_meds(items) if meds_ok else []
    d["tests"] = [t if isinstance(t, dict) else {"name": str(t), "why": ""} for t in d["tests"]][:8]
    if not meds_ok:
        d["notes"].append("No medicine is suggested for a child under 12 or in pregnancy. A doctor must examine first.")
    if RED.search(text):
        d["urgency"] = "urgent"
    d["notes"] = d["notes"][:4]
    return d


def ask_json(prompt, lang, tokens=2500, content=None):
    lg = " Write all text in Bangla (keep medicine and test names in English)." if lang == "bn" else ""
    msg = content if content is not None else prompt + lg
    return parse_json(llm([{"role": "system", "content": SAFETY}, {"role": "user", "content": msg}], json_out=True, max_tokens=tokens))


def prof_text(p):
    p = p or {}
    return "Age %s, sex %s, allergies: %s, pregnant: %s." % (p.get("age") or "unknown", p.get("sex") or "unknown", p.get("allergy") or "none stated", p.get("pregnant") or "no")


def emergency_reply():
    return err("Emergency signs. Call 999 or go to the nearest emergency hospital now.", 200)


@app.post("/api/v3/advice")
def advice():
    j = request.json or {}
    text = str(j.get("text", ""))[:3500]
    if j.get("kind") != "report" and RED.search(text):
        return emergency_reply()
    p = ("Task (%s). Prepare a DRAFT for a registered doctor to review. Return ONLY JSON: %s\n%s\nData:\n%s\n" % (j.get("kind"), ADV_SCHEMA, prof_text(j.get("profile")), text) + MED_RULES)
    try:
        d = finish(ask_json(p, j.get("lang")), j.get("profile"), text)
    except Exception as e:
        return err(e)
    d["sources"] = [
        {"name": "MedlinePlus (US National Library of Medicine / NIH)", "url": "https://medlineplus.gov/"},
        {"name": "NHS (UK National Health Service)", "url": "https://www.nhs.uk/"},
        {"name": "WHO", "url": "https://www.who.int/health-topics/medicines"},
        {"name": "FDA Drug Information", "url": "https://www.fda.gov/drugs"},
        {"name": "DailyMed medicine labels", "url": "https://dailymed.nlm.nih.gov/dailymed/"},
        {"name": "DGDA Bangladesh", "url": "https://dgda.gov.bd/"},
        {"name": "MedEx Bangladesh", "url": "https://medex.com.bd/"},
    ]
    return {"case_id": new_case(j.get("kind", "advice"), j.get("title") or j.get("kind"), d, j.get("profile"))}


@app.post("/api/v3/body")
def body():
    j = request.json or {}
    areas = [str(a)[:60] for a in (j.get("areas") or [])][:8]
    sy = [str(a)[:60] for a in (j.get("symptoms") or [])][:10]
    text = " ".join(areas + sy)
    if RED.search(text):
        return {"emergency": True}
    p = ("Body areas: %s. Symptoms: %s. %s Known documents: %s\nReturn ONLY JSON: {\"areas\":[{\"name\":\"\",\"function\":\"what this part does\",\"why\":[\"why it may hurt\"],\"sources\":[\"common causes or sources\"]}],"
         "%s\nDraft for a registered doctor to review. " % (", ".join(areas) or "none", ", ".join(sy) or "none", prof_text(j.get("profile")), str(j.get("docs", ""))[:1500], ADV_SCHEMA[1:]) + MED_RULES)
    try:
        d = ask_json(p, j.get("lang"))
        d["areas"] = [a for a in (d.get("areas") or []) if isinstance(a, dict)][:8]
        d = finish(d, j.get("profile"), text)
    except Exception as e:
        return err(e)
    return {"case_id": new_case("body", "Body: " + ", ".join(areas)[:60], d, j.get("profile"))}


@app.post("/api/v3/symptom")
def symptom():
    j = request.json or {}
    msgs = [{"role": m["role"], "content": str(m["content"])[:600]} for m in (j.get("messages") or [])[-16:] if m.get("role") in ("user", "assistant")]
    if not msgs:
        return err("empty", 400)
    users = " ".join(m["content"] for m in msgs if m["role"] == "user")
    if RED.search(users):
        return {"action": "emergency"}
    n = sum(1 for m in msgs if m["role"] == "assistant") + 1
    final = n > 7
    p = ("You are doing a symptom interview, one question at a time. %s Body areas: %s. Symptoms: %s. Saved documents: %s\nConversation:\n%s\n" %
         (prof_text(j.get("profile")), j.get("areas"), j.get("symptoms"), str(j.get("docs", ""))[:1500], json.dumps(msgs, ensure_ascii=False)) +
         ("Now give the FINAL draft. Return ONLY JSON: {\"action\":\"final\"," + ADV_SCHEMA[1:] + "\n" + MED_RULES if final else
          "Ask the next most useful question (not repeated), or if you have enough say final. Return ONLY JSON: either "
          "{\"action\":\"ask\",\"question\":\"\",\"why\":\"\",\"options\":[\"2 to 4 short answers\"],\"indicators\":[{\"name\":\"warning sign\",\"status\":\"present|absent|unknown\"}],\"progress\":0-95} "
          "or {\"action\":\"final\"," + ADV_SCHEMA[1:] + "\n" + MED_RULES))
    try:
        d = ask_json(p, j.get("lang"))
    except Exception as e:
        return err(e)
    if d.get("action") == "ask" and not final and d.get("question"):
        ind = [i for i in (d.get("indicators") or []) if isinstance(i, dict)][:6]
        if any(i.get("status") == "present" and RED.search(str(i.get("name"))) for i in ind):
            return {"action": "emergency"}
        return {"action": "ask", "question": d["question"], "why": d.get("why", ""), "options": [str(o) for o in (d.get("options") or [])][:4],
                "indicators": ind, "progress": max(5, min(95, int(d.get("progress") or n * 14))), "n": n}
    d = finish(d, j.get("profile"), users)
    d["sources"] = [
        {"name": x["name"], "url": x["how"].split(" | ")[-1]}
        for x in BD_SOURCES[:30] if "https://" in x["how"]
    ]
    return {"action": "final", "case_id": new_case("symptom", users[:50], d, j.get("profile"))}


@app.post("/api/v3/combine")
def combine():
    j = request.json or {}
    reps = [r for r in (j.get("reports") or [])[:8] if isinstance(r, dict)]
    if len(reps) < 2:
        return err("Upload at least 2 reports first.", 400)
    flat, view, series = {}, [], {}
    for k, r in enumerate(reps):
        lab = "%s %s (#%d)" % (r.get("type", "report"), r.get("date", ""), k + 1)
        for i in (r.get("items") or [])[:90]:
            if not isinstance(i, dict) or not i.get("name"):
                continue
            key = (lab, str(i["name"]).lower())
            flat[key] = i
            if i.get("flag") in ("HIGH", "LOW"):
                view.append({"report": lab, "test": i["name"], "value": i.get("value"), "unit": i.get("unit"), "flag": i["flag"]})
            if i.get("num") is not None:
                series.setdefault(str(i["name"]).lower(), []).append((i["name"], i, str(r.get("date", ""))))
    if not view:
        return err("No abnormal values were found across these reports, so there is nothing to combine.", 200)
    p = ("Several reports of ONE patient. %s Abnormal values:\n%s\nSummaries: %s\nReturn ONLY JSON: {\"summary\":\"\",\"conditions\":[{\"name\":\"\",\"likelihood\":\"more likely|possible\",\"why\":\"\","
         "\"evidence\":[{\"report\":\"copy exactly\",\"test\":\"copy exactly\"}],\"confirm_with\":[\"\"]}],\"urgency\":\"routine|soon|urgent\",\"tests\":[{\"name\":\"\",\"why\":\"\"}],"
         "\"medicines\":[{\"generic\":\"\",\"purpose\":\"\",\"cautions\":\"\"}],\"lifestyle\":[],\"see_doctor\":\"\",\"notes\":[]}\n"
         "Max 4 conditions, each with evidence copied from the abnormal values; say 'possible', never confirmed; do not name a cancer from lab values alone. " %
         (prof_text(j.get("profile")), json.dumps(view, ensure_ascii=False)[:7000], " | ".join(str(r.get("summary", ""))[:300] for r in reps)) + MED_RULES)
    try:
        d = ask_json(p, j.get("lang"), 3000)
    except Exception as e:
        return err(e)
    conds = []
    for c in (d.get("conditions") or [])[:4]:
        ev = []
        for e in (c.get("evidence") or []) if isinstance(c, dict) else []:
            it = flat.get((str(e.get("report", "")), str(e.get("test", "")).lower())) if isinstance(e, dict) else None
            if it and it.get("flag") in ("HIGH", "LOW"):  # evidence must really exist in the uploaded reports
                ev.append({"report": e["report"], "test": it["name"], "value": it.get("value"), "unit": it.get("unit"), "range": it.get("range"),
                           "flag": it["flag"], "num": it.get("num"), "lo": it.get("lo"), "hi": it.get("hi")})
        if ev and c.get("name"):
            conds.append({"name": c["name"], "likelihood": c.get("likelihood") or "possible", "why": c.get("why", ""), "evidence": ev,
                          "confirm_with": [str(x) for x in (c.get("confirm_with") or [])][:4]})
    trends = [{"name": v[0][0], "unit": v[0][1].get("unit"), "lo": v[0][1].get("lo"), "hi": v[0][1].get("hi"),
               "pts": [{"v": x[1]["num"], "d": x[2]} for x in v]} for v in series.values() if len(v) > 1][:8]
    d["conditions"] = conds
    d = finish(d, j.get("profile"), "")
    d["trends"] = trends
    return {"case_id": new_case("combined", "Combined: %d reports" % len(reps), d, j.get("profile"))}


def patient_view(c):
    a = json.loads(json.dumps(c["advice"]))
    if c["status"] != "approved":  # no doses until a registered doctor approves
        for m in a.get("medicines", []):
            for k in ("dose", "frequency", "duration"):
                m.pop(k, None)
    return {"id": c["id"], "kind": c["kind"], "title": c["title"], "status": c["status"], "advice": a,
            "doctor": c["doctor"], "bmdc": c["bmdc"], "note": c["note"]}


@app.get("/api/v3/case/<cid>")
def case_get(cid):
    c = _load().get(re.sub(r"\W", "", cid))
    return patient_view(c) if c else err("Case not found. It may have been deleted when the server restarted.", 404)


def doctor_ok():
    key = os.getenv("DOCTOR_KEY", "")
    if not key:
        return "Doctor access is not set up. Set the DOCTOR_KEY environment variable on the server."
    if not hmac.compare_digest(request.headers.get("X-Doctor-Key", ""), key):
        return "Wrong doctor key."


@app.get("/api/v3/doctor/cases")
def doctor_cases():
    e = doctor_ok()
    if e:
        return err(e, 403)
    s = request.args.get("status", "pending")
    items = sorted((c for c in _load().values() if c["status"] == s), key=lambda c: -c["created"])[:100]
    return {"items": items}


@app.post("/api/v3/doctor/review")
def doctor_review():
    e = doctor_ok()
    if e:
        return err(e, 403)
    j = request.json or {}
    act, doc, bmdc = j.get("action"), str(j.get("doctor", "")).strip()[:80], str(j.get("bmdc", "")).strip()[:30]
    if act not in ("approve", "reject"):
        return err("Bad action", 400)
    if act == "approve" and (not doc or not bmdc):
        return err("Doctor name and BMDC number are required.", 400)
    with _LK:
        d = _load()
        c = d.get(str(j.get("id", "")))
        if not c:
            return err("Case not found", 404)
        a, n = c["advice"], j.get("advice") or {}
        s = lambda x, m=300: str(x or "").strip()[:m]
        for k in ("summary", "see_doctor", "urgency"):
            if k in n:
                a[k] = s(n[k], 600) if k != "urgency" or n[k] in URG[:3] else a.get(k)
        a["lifestyle"] = [s(x) for x in (n.get("lifestyle") or [])][:10]
        a["tests"] = [{"name": s(t.get("name")), "why": s(t.get("why"))} for t in (n.get("tests") or []) if isinstance(t, dict) and t.get("name")][:12]
        a["medicines"] = []
        for m in (n.get("medicines") or [])[:10]:
            if isinstance(m, dict) and m.get("generic"):
                br = safe_meds([{"generic": m["generic"]}]) if not BLOCK.search(m["generic"]) else []
                a["medicines"].append({"generic": s(m["generic"], 80), "purpose": s(m.get("purpose")), "dose": s(m.get("dose"), 80), "frequency": s(m.get("frequency"), 80),
                                       "duration": s(m.get("duration"), 80), "cautions": s(m.get("cautions")), "brands": br[0]["brands"] if br else []})
        c.update(status="approved" if act == "approve" else "rejected", doctor=doc, bmdc=bmdc, note=s(j.get("note"), 500), advice=a)
        _save(d)
    return {"ok": True}


@app.get("/api/v3/reverse")
def reverse():
    try:
        r = requests.get("https://nominatim.openstreetmap.org/reverse", headers=UA, timeout=12,
                         params={"lat": float(request.args["lat"]), "lon": float(request.args["lon"]), "format": "jsonv2", "zoom": 17})
        return {"name": r.json().get("display_name", "")}
    except Exception:
        return {"name": ""}


WOUND_PROMPT = ("Look at this wound or skin photo. Return ONLY JSON: {\"visible\":\"what is visible: colour, swelling, discharge, size cues, photo quality (max 70 words)\",\"wound_type\":\"likely type of wound\","
                "\"source\":\"common cause\",\"care_steps\":[],\"infection_signs\":[\"signs to watch\"]," + ADV_SCHEMA[1:] + "\nNever say it is or is not infected; a photo cannot prove that. ")


def wound_new(j):
    mime, b64 = data_url_parts(j.get("image"))
    ans = j.get("answers", {})
    p = WOUND_PROMPT + prof_text(j.get("profile")) + " User answers: " + json.dumps(ans, ensure_ascii=False)[:800] + "\n" + MED_RULES
    content = [{"type": "text", "text": p + (" Write in Bangla." if j.get("lang") == "bn" else "")}, {"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (mime, b64)}}]
    d = ask_json("", j.get("lang"), 2000, content=content)
    d["care_steps"] = [str(x) for x in (d.get("care_steps") or [])][:8]
    d["infection_signs"] = [str(x) for x in (d.get("infection_signs") or [])][:8]
    d = finish(d, j.get("profile"), json.dumps(ans))
    if any(str(v).lower() in ("yes", "true", "y") for v in (ans.values() if isinstance(ans, dict) else [])) and d["urgency"] == "routine":
        d["urgency"] = "soon"  # your own answers set a floor the AI cannot lower
    return d


@app.post("/api/v3/wound")
def wound():
    j = request.json or {}
    if "profile" not in j:
        return wound_old()
    try:
        d = wound_new(j)
    except Exception as e:
        return jsonify({"available": False, "error": str(e)})
    return {"available": True, "observations": d.get("visible", ""), "case_id": new_case("wound", "Wound check", d, j.get("profile"))}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
