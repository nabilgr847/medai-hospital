"""Turn a downloaded Bangladesh medicine file (CSV/XLSX) into data/bd_medicines.csv.
Usage: python build_medicines.py <file.csv|file.xlsx> "Mendeley Data, Univ. of Dhaka, 2024"
Nothing is invented: columns the file does not have stay empty."""
import csv, os, re, sys
WANT = {"brand": ["brand name", "brand", "trade name", "trade", "medicine name", "name"],
        "generic": ["generic name", "generic", "active ingredient", "active"],
        "company": ["manufacturer", "company", "pharmaceutical", "mfr"],
        "strength": ["dosage strength", "strength", "dose"],
        "form": ["dosage form", "form"],
        "use": ["indication", "indications", "used for", "use"]}
def norm(x): return re.sub(r"[^a-z]+", " ", str(x).lower()).strip()
src = sys.argv[1]; source = sys.argv[2] if len(sys.argv) > 2 else "Bangladesh medicine dataset"
if src.lower().endswith((".xlsx", ".xls")):
    import pandas as pd
    df = pd.read_excel(src).fillna(""); head = list(df.columns); rows = df.to_dict("records")
else:
    rows = list(csv.DictReader(open(src, encoding="utf-8-sig"))); head = list(rows[0].keys())
nh = {norm(h): h for h in head}; col = {}
for k, names in WANT.items():
    col[k] = next((nh[n] for n in names if n in nh), None)
print("column mapping:", col)
if not col["brand"] or not col["generic"]:
    sys.exit("Could not find brand/generic columns. Columns in file: %s" % head)
os.makedirs("data", exist_ok=True)
seen, out = set(), []
for r in rows:
    d = {k: (str(r[c]).strip() if c else "") for k, c in col.items()}
    key = (d["brand"].lower(), d["generic"].lower(), d["strength"].lower(), d["form"].lower())
    if d["brand"] and key not in seen:
        seen.add(key); out.append(d)
with open("data/bd_medicines.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(WANT)); w.writeheader(); w.writerows(out)
open("data/SOURCE.txt", "w", encoding="utf-8").write(source)
print("wrote", len(out), "rows to data/bd_medicines.csv")
