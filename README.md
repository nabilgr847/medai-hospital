# MedAI (amra)
Bangladesh-focused health assistant. AI: OpenRouter + Mistral. Map: OpenStreetMap (Leaflet, Overpass, Nominatim).

## Run on Colab
Open `MedAI_Colab.ipynb`, add Colab Secrets `OPENROUTER_API_KEY` and `MISTRAL_API_KEY`, run cells top to bottom (upload the files when asked).

## Run locally
    pip install -r requirements.txt
    export OPENROUTER_API_KEY=... MISTRAL_API_KEY=... DOCTOR_KEY=choose-a-secret
    python app.py

## Deploy on Render
Push this folder to GitHub, then Render > New > Blueprint (uses `render.yaml`), set the two keys and `DOCTOR_KEY` as environment variables.

## Data
Run `python build_medicines.py <downloaded file> "<source>"` to create `data/bd_medicines.csv`. It stays empty until you do. No fake data.

Optional env: `OPENROUTER_MODEL`, `MISTRAL_MODEL`. AI information only, not a diagnosis. Emergency: 999.

## v4 changes
- Hospital map: 3 Overpass servers with retry, search radius widens 2.5 -> 6 -> 15 -> 35 km, Nominatim fallback, unnamed places kept, 10 min cache, Google Maps fallback link.
- Report analysis: flags re-checked in code from printed value + range, urgency banner, range gauges, key findings, doctor questions, scanned-PDF support, history + trend charts, PDF/share.
- Bangla/English toggle now works (UI + AI replies). Body-map selection is sent to the AI chat. Top search works.

## v5 changes
- **Doctor approval**: every AI suggestion (symptom checker, report advice, prescription draft, wound, BMI) is saved as a case with status *pending*. Patients see tests and medicine names but **no doses** until a registered doctor opens **For Doctors** (needs `DOCTOR_KEY`), edits, enters name + BMDC number and approves. Patients follow it in **My Approvals**. Cases are stored in `data/cases.json` (on Render's free plan this file is wiped on each deploy; add a persistent disk or a database for real use).
- **AI Symptom Checker**: asks one question at a time, shows warning-sign indicators, uses saved report summaries, then drafts tests + medicines for the doctor.
- **Report analysis** now leads with the summary and "What to do next" (tests, medicines with Bangladesh brands); detailed values and gauges are collapsed.
- **Wound check**: photo analysis gives what it looks like, likely type, common cause, care steps, tests and medicines. The rule-based urgency is a floor the AI cannot lower.
- **BMI** calculator (Asia-Pacific cut-offs, healthy weight range, advice).
- **Hospital finder**: GPS high-accuracy fix with accuracy circle, address line, draggable pin.
- **3D model**: put your `.glb` in `models/` next to `app.py`. The server finds it automatically (`/api/model`). Export from Blender without Draco compression; keep object names.
- Safety kept in code: controlled drugs removed, allergy matches removed, no medicines for children under 12 or pregnancy, emergency words show 999.
- **Combined report analysis**: with 2+ saved reports the AI reads them together and lists possible conditions. Each condition cites exact report + value; the server drops any evidence that is not really in your reports. Trend charts show repeated tests across reports. Goes to the doctor for approval like everything else.
## What the app does
`index.html` is the full MedAI Hospital app: AI chat, body map (front/back/organs/3D), AI symptom checker, report analysis with combined analysis and trend graphs,
wound check, BMI, prescription draft/organizer, Bangladesh medicines, hospital finder (GPS), lab tests, reminders, family profiles, SOS 999, Bangla/English, PDF via browser print.

## Doctor approval (needs DOCTOR_KEY)
Every AI suggestion is saved as a case with status pending. Patients see tests and medicine names but **no doses** until a registered doctor opens **Doctor Review**,
enters the key, edits, adds name + BMDC number and approves. Cases are stored in `data/cases.json` (wiped on each Render free-plan deploy; use a disk or database for real use).
Set it before starting: `export DOCTOR_KEY=choose-a-secret`.

## Safety kept in code
No doses, antibiotics, steroids, sedatives, opioids or controlled drugs in AI drafts; allergy matches removed; no medicines for children under 12 or pregnancy;
emergency words show 999; combined-analysis evidence is checked against your real report values; your wound answers set an urgency floor the AI cannot lower.

## Bangladesh health sources shown in the app
The Sources panel lists Bangladesh-focused official health and public-service resources, including 999, DGHS Health Call Centre 16263, DGHS, DGDA, IEDCR, the Ministry of Health and Family Welfare, BMDC, BNMC, NIPSOM, NINS, NICVD, icddr,b, and WHO Bangladesh. The panel links to source websites; it does not imply live verification of every page or provide clinical advice. Emergency: call 999. Medicine data remains empty until a dataset is supplied through `build_medicines.py`.
\n\n## Bug-fix notes\n- Chat sends now show a thinking state and preserve visible errors if the backend fails.\n- Removed the 'For Doctors' navigation item from the user-facing navigation.\n- Medicine search now explains when the verified Bangladesh medicine dataset is missing. Add a properly licensed, verified CSV as `data/bd_medicines.csv` to enable real results.\n- This is a health-information project, not an autonomous prescribing system. Antibiotics and prescription-only medicines must not be recommended as self-treatment.\n

Latest update: MedEx Bangladesh external search link added. Prescription Organizer is hidden from the main navigation and only offered after an explicit prescription request in chat. It organizes clinician-provided prescription text; it does not independently prescribe medicines or doses.


## v6 bug-fix notes
- Chat: user bubbles were shrunk to small circles because the map pin used the same CSS class (me). Pin renamed to mepin.
- Chat AI now knows the app pages (PDF via Report Analysis) and replies in the language of the last message.
- BD Medicines: AI general info runs automatically when the dataset has no match; MedEx search link added. Add data/bd_medicines.csv with build_medicines.py for real brand results.
