
const T=[["home","🏠","Home"],["_a","Check"],["chat","🤖","AI Assistant"],["sc","🧠","Symptom Checker"],["body","🧍","Human Body"],["rep","🧾","Report Analysis"],["wnd","🩹","Wound Check"],["_b","Care"],["hos","📍","Hospital Finder"],["doc","🩺","Doctors"],["lab","🧪","Lab Tests"],["bdm","💊","Medicine AI"],["rem","⏰","Reminders"],["ap","✅","My Approvals"],["_c","Health"],["bmi","⚖️","BMI"],["mon","📈","Monitoring"],["fam","👪","Family"],["_d","Safety"],["sos","🚨","Emergency SOS"],["set","⚙️","Settings"]];
const Q=[["sc","🧠","Symptom Checker"],["hos","📍","Find Hospital"],["bmi","⚖️","BMI"],["rep","🧾","Report Analysis"]];
const $=s=>document.querySelector(s);
function go(id){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on",p.id==id));document.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("on",b.dataset.t==id));scrollTo(0,0)}
$("#sn").innerHTML=T.map(t=>t.length==2?`<div class="gl">${t[1]}</div>`:`<button data-t="${t[0]}" onclick="go('${t[0]}')">${t[1]} ${t[2]}</button>`).join("");
const B=[["home"],["hos"],["sc"],["chat"],["rep"]].map(x=>T.find(t=>t[0]==x[0]));
$("#bot").innerHTML=B.map(t=>`<button data-t="${t[0]}" onclick="go('${t[0]}')"><span class="e">${t[1]}</span>${t[2].split(" ")[0]}</button>`).join("");
const qh=a=>a.map(f=>`<button class="q" onclick="go('${f[0]}')"><span>${f[1]}</span>${f[2]}</button>`).join("");
$("#quick").innerHTML=qh(Q);$("#all").innerHTML=qh(T.filter(t=>t.length>2&&t[0]!="home"));$("#quick2").innerHTML=qh([["chat","🤖","Ask AI"],["bdm","💊","Medicine AI"],["wnd","🩹","Wound Check"],["sos","🚑","Emergency"]]);
const YN=["Yes","No"];
const INFO={chest:{q:[["breath","Short of breath?"],["sweat","Sweating, dizzy or faint?"],["spread","Pain spreads to arm, jaw or back?"]],flag:["breath","sweat","spread"]},
head:{q:[["sudden","Sudden and very severe?"],["neuro","Vision change, weakness or trouble speaking?"],["injury","Recent head injury?"]],flag:["sudden","neuro"]},
abdomen:{q:[["vomit","Vomiting, can't keep fluids down?"],["stool","Blood in stool or black stool?"],["right","Mostly lower right side?"]],flag:[]}};
const GEN={q:[["injury","Did an injury happen?"],["move","Hard to move or put weight on it?"],["warm","Red, warm or swollen?"]],flag:[]};
INFO.heart=INFO.chest;INFO.brain=INFO.head;INFO.liver=INFO.stomach=INFO.gut=INFO.abdomen;
INFO.lungs={q:[["breath","Short of breath?"],["cough","Cough that won't go away?"],["fever","Fever?"]],flag:["breath"]};
INFO.kidneys=INFO.bladder={q:[["urine","Pain or burning when passing urine?"],["side","Pain in the side or back?"],["fever","Fever?"]],flag:[]};
const ORG={brain:["Controls thinking, movement and the senses.","headache, dizziness, confusion"],lungs:["Bring oxygen in and carbon dioxide out.","cough, short breath, chest tightness"],heart:["Pumps blood around the body.","chest pain, palpitations, swollen legs"],liver:["Filters blood and helps digestion.","yellow skin or eyes, upper-right belly pain"],stomach:["Starts digesting food.","nausea, burning, pain after eating"],kidneys:["Filter waste and balance fluids.","side or back pain, urine changes, swelling"],gut:["Absorbs nutrients and moves waste.","pain, diarrhea, constipation, bloating"],bladder:["Stores urine.","burning, frequent urination"]};
const og=(id,label,g,tag,d,fill,c)=>({k:"o"+id,label,g,tag,a:{d},fill:`url(#o_${fill})`,c});
const ORGS=[og("brain","Brain","brain","path","M86 28C84 16 94 9 102 10C112 10 119 17 116 28C115 34 108 36 100 35C92 36 87 34 86 28Z","brain",[101,23]),
og("lungR","Right lung","lungs","path","M95 78C86 75 75 86 72 103C70 115 72 124 81 124C89 124 95 119 95 109Z","lung",[83,101]),
og("lungL","Left lung","lungs","path","M105 78C114 75 125 86 128 103C130 115 128 124 119 124C111 124 105 119 105 109Z","lung",[117,101]),
og("heart","Heart","heart","path","M101 100C95 98 93 108 99 115L107 125L115 113C119 104 113 96 106 99C104 100 102 100 101 100Z","heart",[106,110]),
og("liver","Liver","liver","path","M68 128C74 124 92 124 108 128C114 130 112 142 104 148C94 152 80 150 72 144C67 140 65 133 68 128Z","liver",[88,138]),
og("stomach","Stomach","stomach","path","M108 130C118 126 126 130 126 140C126 150 118 156 110 152C104 148 108 142 112 140C106 138 104 132 108 130Z","stomach",[116,140]),
og("kidR","Right kidney","kidneys","path","M88 150C84 150 82 156 84 162C86 167 92 166 92 160C92 155 91 151 88 150Z","kid",[88,158]),
og("kidL","Left kidney","kidneys","path","M112 150C116 150 118 156 116 162C114 167 108 166 108 160C108 155 109 151 112 150Z","kid",[112,158]),
og("gut","Gut (intestines)","gut","path","M80 168C80 164 120 164 120 168C124 178 120 192 112 194C104 196 96 196 88 194C80 192 76 178 80 168Z","gut",[100,181]),
og("bladder","Bladder","bladder","path","M94 198C94 194 106 194 106 198C108 204 104 208 100 208C96 208 92 204 94 198Z","bladder",[100,202])];
const ORGD='<g fill="none" stroke-linecap="round" pointer-events="none"><path d="M100 60V80M100 80C96 86 90 90 86 96M100 80C104 86 110 90 114 96" stroke="#e6eef8" stroke-width="2.2" opacity=".8"/><path d="M104 98C104 90 100 84 100 76" stroke="#ff7a6e" stroke-width="3"/><path d="M110 124V150M92 124V150" stroke="#5b8fd6" stroke-width="2"/><path d="M92 20C96 24 100 18 104 22M90 28C95 31 100 27 106 30M96 14C99 18 102 15 106 17" stroke="#a24a68" stroke-width="1.2"/><path d="M80 100C84 108 88 112 94 114M120 100C116 108 112 112 106 114" stroke="#fff" stroke-opacity=".35"/><path d="M86 174H114M84 180H116M86 186H114" stroke="#b9793f" stroke-width="2"/><path d="M70 84C80 90 90 92 100 92M130 84C120 90 110 92 100 92M68 96C80 102 92 104 100 104M132 96C120 102 108 104 100 104" stroke="#fff" stroke-opacity=".14" stroke-width="2"/></g>';
let view="f",pts=[],cur=-1,sym=["Pain"];
function regions(v){if(v=="o")return ORGS;if(v=="3")v="f";const f=v=="f",o=[],add=(id,label,g,tag,a)=>o.push({k:v+id,label,g,tag,a});
add("head",f?"Head":"Back of head","head","ellipse",{cx:100,cy:33,rx:21,ry:27});
add("neck","Neck","neck","rect",{x:91,y:56,width:18,height:15,rx:5});
add("chest",f?"Chest":"Upper back",f?"chest":"back","rect",{x:66,y:76,width:68,height:48,rx:12});
add("abd",f?"Abdomen":"Lower back",f?"abdomen":"back","rect",{x:67,y:126,width:66,height:46,rx:6});
add("pel",f?"Pelvis":"Buttocks","pelvis","rect",{x:67,y:174,width:66,height:32,rx:10});
[-1,1].forEach(s=>{const sd=f?(s>0?"Left":"Right"):(s>0?"Right":"Left"),p=(n,k,cy,rx,ry,lab,g)=>add(n+s,sd+" "+lab,g,"ellipse",{cx:100+s*k,cy,rx,ry});
p("sh",50,86,14,12,"shoulder","shoulder");p("ua",56,122,8,26,"upper arm","arm");p("fa",60,176,8,26,"forearm","arm");p("hd",64,222,8,14,"hand","hand");
p("th",16,262,13,40,f?"thigh":"hamstring","leg");p("kn",20,320,11,11,"knee","knee");p("sn",18,365,8,28,f?"shin":"calf","leg");p("ft",17,409,10,7,"foot","foot")});return o}
const ctr=a=>[a.cx??a.x+a.width/2,a.cy??a.y+a.height/2];
function draw(){const R=regions(view),on=new Set(pts.map(p=>p.k));
$("#regs").innerHTML=R.map(r=>`<${r.tag} class="reg ${r.fill?"org":""} ${on.has(r.k)?"on":""}" ${r.fill&&!on.has(r.k)?`style="fill:${r.fill}"`:""} data-k="${r.k}" ${Object.entries(r.a).map(([a,b])=>a+'="'+b+'"').join(" ")}/>`).join("");
const cp=pts[cur];$("#dots").innerHTML=(view=="o"?ORGD:"")+(cp&&cp.k[0]==view?(()=>{const w=cp.label.length*5.8+16,x=cp.c[0]>100?Math.min(cp.c[0]+12,198-w):Math.max(cp.c[0]-12-w,2);return `<g><rect x="${x}" y="${cp.c[1]-10}" width="${w}" height="20" rx="10" fill="#fff"/><text x="${x+8}" y="${cp.c[1]+4}" font-size="10" font-weight="700" fill="#0b1b2e">${cp.label}</text></g>`})():"");
const QK=[["Head","fhead"],["Chest","fchest"],["Abdomen","fabd"],["Left Arm","fua1"],["Right Arm","fua-1"],["Left Knee","fkn1"],["Right Knee","fkn-1"]];
const QL=view=="o"?ORGS.map(o=>[o.label,o.k]):QK;
const extra=pts.filter(p=>!QL.some(q=>q[1]==p.k)&&(view=="o"?p.k[0]=="o":p.k[0]!="o")).map(p=>[p.label,p.k]);
$("#pts").innerHTML=[...QL,...extra].map(q=>`<button class="${pts.some(p=>p.k==q[1])?"on":""}" data-tk="${q[1]}">${q[0]}</button>`).join("");
$("#bodysvg").classList.toggle("om",view=="o");$("#bodysvg").style.display=view=="3"?"none":"";$("#w3d").style.display=view=="3"?"block":"none";if(view=="3")init3();renderMS();panel()}
function panel(){const p=pts[cur];if(!p){$("#panel").innerHTML='<div class="sel">Selected area<br><b>Tap the body</b></div>';return}
const I=INFO[p.g]||GEN,a=p.ans;let emerg=["chest","head","heart","lungs","brain"].includes(p.g)&&I.flag.some(k=>a[k]=="Yes");
$("#panel").innerHTML=`<div class="sel">Selected area<br><b>${p.label}</b></div>${ORG[p.g]?`<div style="color:#9fd6cf;font-size:12.5px;margin:8px 0">${ORG[p.g][0]}<br>People often mention: ${ORG[p.g][1]}.<br><i>Information only, not a diagnosis.</i></div>`:""}
<h2 style="margin:10px 0 4px;font-size:14px;color:#e6f5f3">Pain level <span style="color:#6ee7d4">${p.pain}/10</span></h2><input type="range" min="0" max="10" value="${p.pain}" id="pl">
${I.q.map(q=>`<div style="font-size:13px;margin-top:8px">${q[1]}</div><div class="chips" style="margin:4px 0">${YN.map(y=>`<button class="chip ${a[q[0]]==y?"on":""}" data-q="${q[0]}" data-y="${y}">${y}</button>`).join("")}</div>`).join("")}
${emerg?'<div style="background:#e5484d;color:#fff;border-radius:12px;padding:10px;margin:8px 0"><b>This can be serious.</b> Call 999 or go to the nearest emergency hospital now.</div>':""}
<div class="chips">${["Pain","Redness","Swelling","Numbness","Fever"].map(x=>`<button class="chip ${sym.includes(x)?"on":""}" data-s="${x}">${x}</button>`).join("")}</div>
<button class="btn" onclick="${emerg?"go(\'hos\')":"toChat()"}">${emerg?"Find emergency hospital":"Continue to AI assessment"}</button>`;
$("#pl").oninput=e=>{p.pain=+e.target.value;panel()}}
function toggle(k){if(view!="3")view=k[0];document.querySelectorAll("#vw button").forEach(b=>b.classList.toggle("on",b.dataset.v==view));const i=pts.findIndex(p=>p.k==k);
if(i>=0&&i!=cur){cur=i}else if(i>=0){pts.splice(i,1);cur=pts.length-1}else{const r=(k[0]=="o"?ORGS:regions(view)).find(r=>r.k==k);pts.push({k,label:r.label,g:r.g,c:r.c||ctr(r.a),pain:5,ans:{}});cur=pts.length-1}draw()}
document.addEventListener("click",e=>{const t=e.target;
if((t.dataset.k&&t.classList.contains("reg"))||t.dataset.tk){toggle(t.dataset.k||t.dataset.tk)}
else if(t.dataset.sel!==undefined){cur=+t.dataset.sel;view=pts[cur].k[0];document.querySelectorAll("#vw button").forEach(b=>b.classList.toggle("on",b.dataset.v==view));draw()}
else if(t.dataset.q){pts[cur].ans[t.dataset.q]=t.dataset.y;panel()}
else if(t.dataset.s){const x=t.dataset.s;sym=sym.includes(x)?sym.filter(y=>y!=x):[...sym,x];panel()}
else if(t.closest("#vw")&&t.dataset.v){view=t.dataset.v;document.querySelectorAll("#vw button").forEach(b=>b.classList.toggle("on",b.dataset.v==view));draw()}});
const MT=[["Heart rate","bpm"],["Blood sugar","mmol/L"],["Weight","kg"],["Temperature","°C"]];let mi=0,RD={};try{RD=JSON.parse(localStorage.getItem("med_r")||"{}")}catch(e){}
function addR(){const v=parseFloat($("#mv").value);if(!(v>0))return;(RD[MT[mi][0]]=RD[MT[mi][0]]||[]).push({v,t:Date.now()});RD[MT[mi][0]]=RD[MT[mi][0]].slice(-30);try{localStorage.setItem("med_r",JSON.stringify(RD))}catch(e){}$("#mv").value="";rMon()}
function rMon(){const n=MT[mi][0],d=RD[n]||[];$("#mt").innerHTML=MT.map((m,i)=>`<button class="chip ${i==mi?"on":""}" data-mt="${i}">${m[0]}</button>`).join("");$("#mh").textContent=n+" ("+MT[mi][1]+")";
if(!d.length){$("#mch").innerHTML="";$("#mn").textContent="No readings yet. Add your first one.";return}
const vs=d.map(x=>x.v),lo=Math.min(...vs),hi=Math.max(...vs),sp=hi-lo||1,P=d.map((x,i)=>[d.length==1?150:10+i*280/(d.length-1),105-(x.v-lo)/sp*85]);
$("#mch").innerHTML=`<polyline points="${P.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#0f9d8a" stroke-width="2.5"/>`+P.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#0f9d8a"/>`).join("");
$("#mn").textContent=`Last: ${vs[vs.length-1]} ${MT[mi][1]} · ${d.length} reading(s). A doctor should interpret trends. One reading is not a diagnosis.`}
document.addEventListener("click",e=>{if(e.target.dataset.mt!==undefined){mi=+e.target.dataset.mt;rMon()}});rMon();
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DEMO=[];
async function api(u,body){try{const r=await fetch(u,body?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:undefined);if(r.ok&&(r.headers.get("content-type")||"").includes("json"))return await r.json();if(r.headers.get("content-type")||"".includes("json"))return await r.json()}catch(e){}return null}
let medSearchTimer=null;
$("#bq").oninput=()=>{clearTimeout(medSearchTimer);medSearchTimer=setTimeout(()=>searchMedicine(),250)};
async function searchMedicine(){const q=$("#bq").value.trim();if(q.length<2){$("#bres").innerHTML="";return}
$("#bres").innerHTML='<div class="mute">Searching medicine database…</div>';
const d=await api("/api/v3/bd-medicine?q="+encodeURIComponent(q));const it=d&&Array.isArray(d.items)?d.items.map(i=>({b:i.brand||i.name||"Medicine",g:i.generic||i.ingredient||"Generic not listed",c:i.company||i.manufacturer||"Company not listed",s:((i.strength||"")+" "+(i.form||"")).trim(),u:i.use||i.indication||"Use information not available in this dataset."})):[];
const cards=it.map(m=>`<div class="card"><b>${esc(m.b)}</b> <span class="badge ok">${esc(m.g)}</span><div class="mute">🏭 ${esc(m.c)} · ${esc(m.s)}</div><div style="margin-top:6px">${esc(m.u)}</div></div>`).join("");
$("#bres").innerHTML=cards+`<div class="card" style="margin-top:10px"><b>AI medicine information</b><p class="mute">Get general information about “${esc(q)}”. AI information is not a prescription and may not confirm the exact product.</p><button class="btn" id="medaiask" type="button">Ask AI about this medicine</button><div id="medaianswer" style="margin-top:10px"></div></div>`+(it.length?'<p class="mute">Check the pack and verify registration with the official DGDA source.</p>':'<div class="note">No local verified dataset match. You can ask AI for general information, but verify the exact medicine and registration with DGDA.</div>')+`<p><a href="https://info.dgda.gov.bd/allopathic-medicines?page=1" target="_blank" rel="noopener">Open official DGDA medicine database ↗</a></p>`;
const btn=$("#medaiask");if(btn)btn.onclick=async()=>{const out=$("#medaianswer");btn.disabled=true;out.innerHTML='<div class="mute">AI is checking general medicine information…</div>';const ans=await api("/api/v3/bd-medicine-ai",{query:q,lang:(document.documentElement.lang||"").toLowerCase().startsWith("bn")?"bn":"en"});btn.disabled=false;out.innerHTML=ans&&ans.answer?`<div class="note">${esc(ans.answer).replace(/\n/g,"<br>")}<br><br><small>${esc(ans.disclaimer||"Not a prescription. Confirm with a registered doctor or pharmacist.")}</small></div>`:`<div class="note">AI information could not load. Check your internet/API connection and try again. Do not use this as a prescription.</div>`};
}
function rxShow(items,disc){$("#rxout").innerHTML=items.length?`<b>Prescription summary</b><div class="mute">Doctor: ${esc($("#rxd").value||"-")} · BMDC: ${esc($("#rxb").value||"-")} · ${new Date().toLocaleDateString()}</div><table class="rxt"><tr><th>Medicine</th><th>Generic</th><th>Dose</th><th>How often</th><th>Days</th></tr>${items.map(m=>`<tr><td>${esc(m.name)}${m.company?`<br><small>${esc(m.company)}</small>`:""}</td><td>${esc(m.generic)}</td><td>${esc(m.dose)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)}</td></tr>`).join("")}</table><p class="mute">${esc(disc)}</p><button class="btn" onclick="window.print()">Download PDF</button>`:'<div class="mute">Nothing found. Type the medicines your doctor wrote.</div>'}
async function rxGo(){const t=$("#rxt").value.trim();if(t.length<5)return;$("#rxout").innerHTML='<div class="mute">Organizing…</div>';const d=await api("/api/v3/rx-organize",{text:t});if(d)rxShow(d.items,d.disclaimer);else $("#rxout").innerHTML='<div class="mute">The AI backend is not connected in this preview. Tap Sample to see the result layout.</div>'}
function rxSample(){rxShow([{name:"Napa",generic:"Paracetamol",company:"Beximco Pharmaceuticals",dose:"500 mg, 1 tablet",frequency:"3 times daily after food",duration:"5"}],"Sample only. Organized from a doctor's text. AI did not prescribe.")}
const WQ=[["bleed","Heavy bleeding that will not stop?"],["streak","Red streaks spreading from it?"],["deep","Deep wound, bite, or something stuck in it?"],["pus","Pus or yellow/green discharge?"],["fever","Fever or feeling very unwell?"],["numb","Numbness nearby?"],["worse","Getting worse over the last day?"]];let wans={},wimg="";
$("#wq").innerHTML=WQ.map(q=>`<div style="margin-top:8px;font-size:14px">${q[1]}</div><div class="chips" style="margin:4px 0">${["Yes","No"].map(y=>`<button class="chip" data-wq="${q[0]}" data-wy="${y}">${y}</button>`).join("")}</div>`).join("");
document.addEventListener("click",e=>{const t=e.target;if(t.dataset.wq){wans[t.dataset.wq]=t.dataset.wy;t.parentNode.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c==t))}});
$("#wf").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{wimg=r.result;$("#wprev").innerHTML=`<img src="${wimg}" style="max-width:100%;border-radius:12px">`};r.readAsDataURL(f)};
async function wGo(){const y=k=>wans[k]=="Yes";let L,m;
if(y("bleed")){L=["emergency","#e5484d","Emergency"];m="Call 999 or go to the nearest emergency hospital now. Press firmly on the wound with a clean cloth while you wait."}
else if(y("streak")||y("deep")||y("numb")||(y("fever")&&(y("pus")||y("worse")))){L=["urgent","#e08a00","See a doctor today"];m="Do not wait for it to heal on its own. Get it checked today."}
else if(y("pus")||y("worse")){L=["soon","#d4a000","See a doctor within 24 hours"];m="Keep it clean and covered until you are seen."}
else{L=["watch","#18a058","Watch and keep it clean"];m="Rinse gently with clean running water, cover with a clean dressing, and watch it. See a doctor if it gets worse."}
$("#wres").innerHTML=`<div class="card" style="border-left:6px solid ${L[1]}"><h2 style="color:${L[1]}">${L[2]}</h2><p>${m}</p><div id="wai" class="mute">${wimg&&L[0]!="emergency"?"Looking at the photo…":""}</div><div class="note">A photo alone cannot confirm or rule out infection or any other condition. This is not a diagnosis.</div></div>`;
if(wimg&&L[0]!="emergency"){const d=await api("/api/v3/wound",{image:wimg,answers:wans});$("#wai").innerHTML=d&&d.available?`<b>What the AI can see (may be wrong):</b><br>${esc(d.observations)}`:"Photo analysis needs the connected backend. Your answers above still apply."}}
let T3=null;
const ld=u=>new Promise((ok,no)=>{const e=document.createElement("script");e.src=u;e.onload=ok;e.onerror=no;document.head.appendChild(e)});
function setLayer(l){if(!T3)return;T3.layer=l;T3.body.children.forEach(m=>{m.material.opacity=l=="skin"?.92:.12;m.material.depthWrite=l=="skin"});T3.orgs.visible=l=="org";document.querySelectorAll("[data-ly]").forEach(b=>b.classList.toggle("on",b.dataset.ly==l))}
function sync3(){if(!T3)return;[...T3.body.children,...T3.orgs.children,...(T3.model||[])].forEach(m=>{const on=pts.some(p=>p.k==m.userData.k);if(m.material&&m.material.emissive){m.material.emissive.setHex(on?0x16a37f:0);if(!T3.model&&m.userData.base)m.material.color.set(on?"#2ed6a3":m.userData.base)}})}
function pick3(u){if(/^[fo]/.test(u.k))return toggle(u.k);const i=pts.findIndex(p=>p.k==u.k);if(i>=0&&i!=cur)cur=i;else if(i>=0){pts.splice(i,1);cur=pts.length-1}else{pts.push({k:u.k,label:u.label,g:"other",c:[0,0],pain:5,ans:{}});cur=pts.length-1}draw()}
async function init3(){if(T3){sync3();return}T3={};const box=$("#w3d");await modelProbe();
try{const B="https://cdn.jsdelivr.net/npm/three@0.128.0/";await ld(B+"build/three.min.js");await ld(B+"examples/js/controls/OrbitControls.js");await ld(B+"examples/js/loaders/GLTFLoader.js")}catch(e){box.insertAdjacentHTML("beforeend",'<p class="mute" style="padding:20px;color:#9fd6cf">3D could not load. Use Front or Back.</p>');T3=null;return}
const W=()=>box.clientWidth||300,H=420,sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,W()/H,.1,100);cam.position.set(0,-.1,13.5);
const rd=new THREE.WebGLRenderer({antialias:true,alpha:true});rd.setSize(W(),H);rd.setPixelRatio(Math.min(devicePixelRatio,2));box.appendChild(rd.domElement);
sc.add(new THREE.AmbientLight(0xffffff,.65));const d1=new THREE.DirectionalLight(0xffffff,.9);d1.position.set(4,6,8);sc.add(d1);const d2=new THREE.DirectionalLight(0x66ffd9,.35);d2.position.set(-5,2,-6);sc.add(d2);
const ct=new THREE.OrbitControls(cam,rd.domElement);ct.target.set(0,-.1,0);ct.enableDamping=true;ct.minDistance=5;ct.maxDistance=20;
const body=new THREE.Group(),orgs=new THREE.Group();sc.add(body,orgs);
const mk=(k,label,rx,ry,rz,x,y,z,col,g)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),new THREE.MeshStandardMaterial({color:col,roughness:.55,metalness:.05,transparent:true}));m.scale.set(rx,ry,rz);m.position.set(x,y,z);m.userData={k,label,base:col};g.add(m)};
regions("f").forEach(r=>{const a=r.a,rx=(a.rx!=null?a.rx:a.width/2)/50,ry=(a.ry!=null?a.ry:a.height/2)/50,cx=a.cx!=null?a.cx:a.x+a.width/2,cy=a.cy!=null?a.cy:a.y+a.height/2;mk(r.k,r.label,rx,ry,r.g=="head"?rx:Math.min(rx,ry,.3),(cx-100)/50,(210-cy)/50,0,"#2c5a47",body)});
const SZ={brain:[.3,.24,"#e59aa8"],lungR:[.26,.44,"#e8a0b0"],lungL:[.26,.44,"#e8a0b0"],heart:[.2,.24,"#d2403f"],liver:[.36,.18,"#9a4a2c"],stomach:[.22,.18,"#e08a6a"],kidR:[.1,.16,"#8c3a3a"],kidL:[.1,.16,"#8c3a3a"],gut:[.4,.26,"#e8b27a"],bladder:[.16,.14,"#7bb0d8"]};
ORGS.forEach(o=>{const z=SZ[o.k.slice(1)];mk(o.k,o.label,z[0],z[1],.2,(o.c[0]-100)/50,(210-o.c[1])/50,o.k.includes("kid")?-.15:.02,z[2],orgs)});
Object.assign(T3,{sc,cam,rd,ct,body,orgs});
T3.pick=()=>T3.model?T3.model:T3.layer=="skin"?body.children:orgs.children;
try{if(!MODEL_URL)modelFail();else new THREE.GLTFLoader().load(MODEL_URL,g=>{const bx=new THREE.Box3().setFromObject(g.scene),sz=bx.getSize(new THREE.Vector3()),c=bx.getCenter(new THREE.Vector3()),k=8.4/sz.y;g.scene.scale.setScalar(k);g.scene.position.set(-c.x*k,-c.y*k,-c.z*k);body.visible=orgs.visible=false;sc.add(g.scene);T3.model=[];g.scene.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.userData={k:"m_"+o.name,label:o.name.replace(/[_.]+/g," ").trim()||"Part"};T3.model.push(o)}});modelReady()},undefined,()=>modelFail())}catch(e){modelFail()}
let d0;rd.domElement.addEventListener("pointerdown",e=>{d0=[e.clientX,e.clientY]});
rd.domElement.addEventListener("pointerup",e=>{if(!d0||Math.hypot(e.clientX-d0[0],e.clientY-d0[1])>5)return;const b=rd.domElement.getBoundingClientRect(),rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1)),cam);const h=rc.intersectObjects(T3.pick(),false)[0];if(h)pick3(h.object.userData)});
addEventListener("resize",()=>{if(view=="3"){rd.setSize(W(),H);cam.aspect=W()/H;cam.updateProjectionMatrix()}});
(function loop(){if(view=="3"){ct.update();rd.render(sc,cam)}requestAnimationFrame(loop)})();
setLayer("skin");sync3()}
document.addEventListener("click",e=>{if(e.target.dataset.ly&&T3){setLayer(e.target.dataset.ly)}});
const EM={"🤖":"bot","🏥":"hospital","💊":"pill","📷":"camera","🚑":"ambulance","🧍":"body","🧾":"report","📍":"pin","🩹":"bandage","➕":"cross","🆘":"buoy","👋":"hand","📤":"upload","🖼":"image","🕘":"clock","📞":"phone","👮":"shield","🚒":"flame","🏠":"home","📈":"activity","🏷":"tag","📝":"edit","🚨":"siren","🏭":"factory","🩺":"steth","🧪":"flask","⏰":"bell","👪":"users","⚙":"gear"};
const EMX=new RegExp("("+Object.keys(EM).join("|")+")","u");
function iconify(root){if(!document.createTreeWalker)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];
while(w.nextNode()){const n=w.currentNode,t=n.parentNode&&n.parentNode.nodeName;if(t=="SCRIPT"||t=="STYLE"||t=="TEXTAREA")continue;if(EMX.test(n.nodeValue.replace(/\ufe0f/g,"")))L.push(n)}
L.forEach(n=>{const f=document.createDocumentFragment();n.nodeValue.replace(/\ufe0f/g,"").split(new RegExp("("+Object.keys(EM).join("|")+")","u")).forEach(p=>{if(EM[p]){const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("class","i");s.innerHTML='<use href="#i-'+EM[p]+'"/>';f.appendChild(s)}else if(p)f.appendChild(document.createTextNode(p))});n.parentNode.replaceChild(f,n)})}
iconify(document.body);let icb=0;if(typeof MutationObserver!="undefined")new MutationObserver(()=>{if(!icb){icb=1;requestAnimationFrame(()=>{iconify(document.body);icb=0})}}).observe(document.body,{childList:true,subtree:true});
const MEM={};const LS=(k,d)=>{if(k in MEM)return MEM[k];try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},SV=(k,v)=>{MEM[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},nid=()=>Math.random().toString(36).slice(2);
const SP=["General medicine","Cardiology","Orthopedics","Gynecology","Pediatrics","Dermatology","Neurology","ENT","Eye","Dental"];let dsp=SP[0];
const LT=[["Complete blood count (CBC)","Red cells, white cells and platelets.","Usually no fasting."],["Fasting blood sugar","Sugar level in the blood.","Fast 8 to 10 hours. Water is fine."],["HbA1c","Average blood sugar over about 3 months.","No fasting needed."],["Lipid profile","Cholesterol and fats in the blood.","Many labs ask 9 to 12 hours of fasting."],["Thyroid (TSH)","Thyroid function.","Usually no fasting."],["Urine routine exam","Sugar, protein and signs of infection in urine.","Clean midstream sample."],["Liver function (LFT)","Liver enzymes and bilirubin.","Follow your lab's instructions."],["Kidney function (creatinine)","How well the kidneys filter blood.","Follow your lab's instructions."],["ECG","Electrical activity of the heart.","No fasting. Loose clothes."],["X-ray / Ultrasound","Images of bones, chest or belly.","Belly ultrasound may need a full bladder or fasting. Ask the centre."]];
const tag=(a,b)=>`<button class="chip" ${a}>${b}</button>`;
function rDoc(){$("#dsp").innerHTML=SP.map(x=>`<button class="chip ${x==dsp?"on":""}" data-sp="${x}">${x}</button>`).join("");const L=LS("req",[]);$("#dreq").innerHTML=L.length?L.map(r=>`<div class="row"><span><b>${esc(r.sp)}</b><br><small class="mute">${esc(r.date||"Any day")} · ${esc(r.time)}${r.note?" · "+esc(r.note):""}</small></span><span><span class="badge lo">Not confirmed</span> ${tag('data-dd="'+r.id+'"',"✕")}</span></div>`).join(""):'<div class="mute">No requests yet.</div>'}
function dSend(){const L=LS("req",[]);L.push({id:nid(),sp:dsp,date:$("#dd").value,time:$("#dt").value,note:$("#dn").value.slice(0,80)});SV("req",L);$("#dn").value="";rDoc()}
function rLab(){$("#lt").innerHTML=LT.map((t,i)=>`<div class="card"><b>${t[0]}</b><div class="mute">${t[1]}</div><div style="margin:6px 0;font-size:13px"><b>Prep:</b> ${t[2]}</div>${tag('data-lt="'+i+'"',"+ Add to my list")}</div>`).join("");const L=LS("labs",[]);$("#ll").innerHTML=L.length?L.map(x=>`<div class="row"><span>${esc(x.n)}</span>${tag('data-ld="'+x.id+'"',"✕")}</div>`).join(""):'<div class="mute">Nothing added yet.</div>'}
function rRem(){const L=LS("rem",[]).slice().sort((a,b)=>a.time.localeCompare(b.time)),td=new Date().toDateString();$("#rl").innerHTML=L.length?L.map(r=>`<div class="row"><span><b>${esc(r.name)}</b><br><small class="mute">${esc(r.time)} daily</small></span><span>${tag('data-rt="'+r.id+'"'+(r.done==td?' style="background:var(--t);color:#04140d"':""),r.done==td?"Taken":"Mark taken")} ${tag('data-rd="'+r.id+'"',"✕")}</span></div>`).join(""):'<div class="mute">No reminders yet.</div>'}
function rAdd(){const n=$("#rn").value.trim();if(!n)return;const L=LS("rem",[]);L.push({id:nid(),name:n.slice(0,60),time:$("#rt").value||"08:00"});SV("rem",L);$("#rn").value="";rRem()}
function rFam(){const L=LS("fam",[]);$("#fl").innerHTML=L.length?L.map(f=>`<div class="row"><span style="display:flex;gap:10px;align-items:center"><span class="av">${esc(f.n.slice(0,1).toUpperCase())}</span><span><b>${esc(f.n)}</b><br><small class="mute">${esc(f.r)}${f.a?" · "+esc(f.a)+" yrs":""}</small></span></span>${tag('data-fd="'+f.id+'"',"✕")}</div>`).join(""):'<div class="mute">No members yet.</div>'}
function fAdd(){const n=$("#fn").value.trim();if(!n)return;const L=LS("fam",[]);L.push({id:nid(),n:n.slice(0,40),r:$("#fr").value,a:$("#fa").value.replace(/\D/g,"").slice(0,3)});SV("fam",L);$("#fn").value=$("#fa").value="";rFam()}
function rEc(){const L=LS("ec",[]);$("#el").innerHTML=L.length?L.map(c=>`<div class="row"><span><b>${esc(c.n)}</b><br><a href="tel:${esc(c.p)}">${esc(c.p)}</a></span>${tag('data-ed="'+c.id+'"',"✕")}</div>`).join(""):'<div class="mute">No contacts yet.</div>'}
function eAdd(){const n=$("#en").value.trim(),p=$("#ep").value.replace(/[^\d+]/g,"");if(!n||p.length<5)return;const L=LS("ec",[]);L.push({id:nid(),n:n.slice(0,40),p});SV("ec",L);$("#en").value=$("#ep").value="";rEc()}
function rAll(){rDoc();rLab();rRem();rFam();rEc()}
function cAll(){["req","labs","rem","fam","ec","med_r"].forEach(k=>{delete MEM[k];try{localStorage.removeItem(k)}catch(e){}});RD={};rAll();if(typeof rMon=="function")rMon()}
document.addEventListener("click",e=>{const d=e.target.closest("[data-sp],[data-dd],[data-lt],[data-ld],[data-rt],[data-rd],[data-fd],[data-ed]");if(!d)return;const D=d.dataset,del=(k,id)=>SV(k,LS(k,[]).filter(x=>x.id!=id));
if(D.sp){dsp=D.sp;rDoc()}else if(D.dd){del("req",D.dd);rDoc()}else if(D.lt){const L=LS("labs",[]);L.push({id:nid(),n:LT[+D.lt][0]});SV("labs",L);rLab()}else if(D.ld){del("labs",D.ld);rLab()}
else if(D.rt){SV("rem",LS("rem",[]).map(r=>r.id==D.rt?Object.assign({},r,{done:r.done==new Date().toDateString()?"":new Date().toDateString()}):r));rRem()}else if(D.rd){del("rem",D.rd);rRem()}else if(D.fd){del("fam",D.fd);rFam()}else if(D.ed){del("ec",D.ed);rEc()}});
rAll();
let myS=[];
function renderMS(){const body=pts.map(p=>p.label),all=[...body,...myS];
$("#mschips").innerHTML=all.length?all.map((x,i)=>`<span class="mc">${x}${i>=body.length?` <b data-ms="${i-body.length}">✕</b>`:""}</span>`).join(""):'<span class="mute">Nothing added yet</span>';
const n=pts.reduce((a,p)=>a+Object.keys(p.ans).length,0)+all.length*2,pc=Math.min(100,n*10);$("#msbar").style.width=pc+"%";
$("#mslbl").textContent=pc<40?"Add more details for a more useful summary.":pc<80?"Good. A few more details help the doctor.":"Great detail. Ready to prepare your doctor summary."}
document.addEventListener("keydown",e=>{if(e.target.id=="msin"&&e.key=="Enter"&&e.target.value.trim()){myS.push(e.target.value.trim().slice(0,40));e.target.value="";renderMS()}});
document.addEventListener("click",e=>{if(e.target.dataset.ms!==undefined){myS.splice(+e.target.dataset.ms,1);renderMS()}});
draw();
$("#lang").onclick=e=>{const l=e.target.dataset.l;if(l)document.querySelectorAll("#lang button").forEach(b=>b.classList.toggle("on",b.dataset.l==l))};
go("home");

/* ---- backend wiring ---- */
const CH=[];function chatShow(){$("#cl").innerHTML='<div class="b bt">Tell me your symptoms in Bangla or English. / আপনার উপসর্গ বলুন।</div>'+CH.map(m=>`<div class="b ${m.role=="user"?"me":"bt"}">${esc(m.content).replace(/\n/g,"<br>")}</div>`).join("");$("#cl").scrollTop=1e6}



async function rxDraft(){const t=$("#rdt").value.trim();if(t.length<3)return;$("#rdo").innerHTML='<div class="mute">Preparing draft…</div>';const d=await api("/api/v3/rx-draft",{text:t,age:$("#rda").value,allergy:$("#rdl").value});
if(!d||d.error){$("#rdo").innerHTML='<div class="mute">'+esc((d&&d.error)||"Backend not connected.")+'</div>';return}
if(d.emergency){$("#rdo").innerHTML='<div class="warn" style="background:#fde8e8;color:#c3262b;border-radius:12px;padding:12px;font-weight:700">Emergency signs. Call 999 or go to the nearest emergency hospital now. Do not wait for a draft.</div>';return}
const it=d.items||[];$("#rdo").innerHTML='<div style="background:#fde8e8;color:#c3262b;border-radius:10px;padding:8px 12px;font-weight:800">DRAFT · NOT APPROVED BY A DOCTOR</div>'+(it.length?`<table class="rxt"><tr><th>Medicine (generic)</th><th>For</th><th>Bangladesh brands</th><th>Dose / days</th></tr>${it.map(m=>`<tr><td><b>${esc(m.generic)}</b>${m.cautions?`<br><small>${esc(m.cautions)}</small>`:""}</td><td>${esc(m.purpose)}</td><td>${m.brands.length?m.brands.map(b=>esc(b.brand)+" "+esc(b.strength)+" · "+esc(b.company)).join("<br>"):'<small class="mute">'+(d.dataset?"no brand found in file":"medicine file not loaded")+"</small>"}</td><td>Doctor decides</td></tr>`).join("")}</table>`:`<p>${esc(d.note||"A doctor must examine you first.")}</p>`)+`<div class="card" style="margin-top:10px"><b>Doctor approval</b><div class="grid g2" style="margin:8px 0"><input type="text" placeholder="Doctor name"><input type="text" placeholder="BMDC reg. no"></div><div class="mute">Signature: ______________ Date: ___________</div></div><p class="mute">${esc(d.disclaimer)}${d.source?" Brand data: "+esc(d.source)+".":""}</p><button class="btn" onclick="window.print()">Print / Save PDF</button>`}
/* ===== MedAI v4: map fix, report analysis, language, body->AI ===== */
let LANG=LS("lang","en");const tt=(en,bn)=>LANG=="bn"?bn:en;
async function apiE(u,body){try{const r=await fetch(u,body?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:undefined);const j=await r.json().catch(()=>null);if(!r.ok||!j)return{error:(j&&j.error)||"Server error "+r.status};return j}catch(e){return{error:"Cannot reach the server. Check your internet and that the app is running."}}}

/* ---- Bangla / English ---- */
const BN={"Home":"হোম","AI Assistant":"এআই সহকারী","Human Body":"মানবদেহ","Human":"মানবদেহ","Report Analysis":"রিপোর্ট বিশ্লেষণ","Report":"রিপোর্ট","Wound Check":"ক্ষত পরীক্ষা","Hospital Finder":"হাসপাতাল খুঁজুন","Hospital":"হাসপাতাল","Doctors":"ডাক্তার","Lab Tests":"ল্যাব টেস্ট","Medicine AI":"মেডিসিন এআই","BD Medicines":"মেডিসিন এআই","Rx Organizer":"প্রেসক্রিপশন গোছান","Prescription":"প্রেসক্রিপশন","Reminders":"রিমাইন্ডার","Monitoring":"স্বাস্থ্য মনিটর","Family":"পরিবার","Emergency SOS":"জরুরি SOS","Settings":"সেটিংস","Check":"পরীক্ষা","Care":"সেবা","Health":"স্বাস্থ্য","Safety":"নিরাপত্তা","AI":"এআই","Chat Now →":"চ্যাট করুন →","Quick access":"দ্রুত অ্যাক্সেস","All services":"সব সেবা","Symptom Checker":"উপসর্গ চেকার","Find Hospital":"হাসপাতাল খুঁজুন","Medicine Reminder":"ওষুধের রিমাইন্ডার","Ask AI":"এআই-কে জিজ্ঞাসা","Medicines":"ওষুধ","Emergency":"জরুরি","Nearby Hospital Finder":"কাছের হাসপাতাল","All":"সব","Clinic":"ক্লিনিক","Diagnostic":"ডায়াগনস্টিক","Pharmacy":"ফার্মেসি","Map":"ম্যাপ","List":"তালিকা","Use my location":"আমার অবস্থান ব্যবহার করুন","Search":"খুঁজুন","Upload file":"ফাইল আপলোড","Take photo":"ছবি তুলুন","Upload your report":"আপনার রিপোর্ট আপলোড করুন","AI analysis":"এআই বিশ্লেষণ","Send":"পাঠান","Front":"সামনে","Back":"পেছনে","Organs":"অঙ্গ","Body parts":"শরীরের অংশ","Pain level":"ব্যথার মাত্রা","Settings ":"সেটিংস","Doctors ":"ডাক্তার","AI Medical Assistant":"এআই চিকিৎসা সহকারী","Health Monitoring":"স্বাস্থ্য মনিটরিং","Medicine Reminders":"ওষুধের রিমাইন্ডার","Family Profiles":"পরিবারের প্রোফাইল","Emergency":"জরুরি","Call 999":"৯৯৯ এ কল করুন","Save reading":"সংরক্ষণ করুন","Add":"যোগ করুন","Clear all my saved data":"আমার সব তথ্য মুছুন","Download PDF":"পিডিএফ ডাউনলোড"};
const OR=new WeakMap();
function trAll(root){root=root||document.body;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const p=n.parentNode.nodeName;if(p=="SCRIPT"||p=="STYLE"||p=="TEXTAREA")continue;let o=OR.get(n);if(o===undefined){const t=n.nodeValue.trim();if(!BN[t])continue;o=t;OR.set(n,o)}const want=LANG=="bn"?BN[o]:o,c=n.nodeValue;if(c.trim()!=want)n.nodeValue=c.match(/^\s*/)[0]+want+c.match(/\s*$/)[0]}}
function setLang(l){LANG=l;SV("lang",l);document.documentElement.lang=l;document.querySelectorAll("#lang button").forEach(b=>b.classList.toggle("on",b.dataset.l==l));trAll();greet();hosRefreshText()}
$("#lang").onclick=e=>{if(e.target.dataset.l)setLang(e.target.dataset.l)};
if(typeof MutationObserver!="undefined")new MutationObserver(()=>{if(LANG=="bn"){clearTimeout(window._t);window._t=setTimeout(trAll,60)}}).observe(document.body,{childList:true,subtree:true});

/* ---- greeting + name ---- */
function greet(){const n=LS("name","");$("#home h1").innerHTML=(LANG=="bn"?"নমস্কার":"Hello")+", "+(n?esc(n):"MedAI")+' <svg class="i"><use href="#i-hand"/></svg>'}
$("#set .grid").insertAdjacentHTML("afterbegin",'<div class="card"><h2>Your name</h2><input class="fi" id="nm" placeholder="Name shown on Home"><button class="btn" style="margin-top:8px" onclick="SV(\'name\',$(\'#nm\').value.trim().slice(0,30));greet()">Save</button></div>');
$("#nm").value=LS("name","");greet();

/* ---- top search ---- */
const KW={hos:"hospital clinic diagnostic nearby map pharmacy",rep:"report blood cbc urine",body:"body organ",wnd:"wound cut",bdm:"napa paracetamol brand",doc:"doctor appointment",lab:"lab",rem:"reminder",mon:"monitor sugar",sos:"sos ambulance 999",fam:"family",rx:"prescription"};
$(".top input").onkeydown=e=>{if(e.key!="Enter")return;const q=e.target.value.trim();if(!q)return;const w=q.toLowerCase().split(/\s+/),hit=Object.entries(KW).find(([k,v])=>v.split(" ").some(x=>w.includes(x)));
if(hit&&w.length<3)go(hit[0]);else{go("chat");$("#ci").value=q;chatSend()}e.target.value=""};

/* ---- body map -> AI ---- */
function toChat(){const p=pts.map(x=>`${x.label} (pain ${x.pain}/10${Object.entries(x.ans).map(([k,v])=>", "+k+": "+v).join("")})`);
const msg=`My problem areas: ${p.join("; ")||"not selected"}. Symptoms: ${[...sym,...myS].join(", ")||"not stated"}. What could this be and what should I do?`;go("chat");$("#ci").value=msg;chatSend()}
$("#ms").insertAdjacentHTML("beforeend",'<button class="btn" style="margin-top:10px" onclick="toChat()">Ask AI about my symptoms</button>');

/* ---- chat ---- */
let chatBusy=false;
async function chatSend(){
  const t=$("#ci").value.trim();
  if(!t||chatBusy)return;
  chatBusy=true; const sendBtn=$("#ci").parentElement.querySelector("button");
  if(sendBtn)sendBtn.disabled=true;
  $("#ci").value="";
  CH.push({role:"user",content:t}); chatShow();
  const rxIntent = /prescription|prescribe|prescription banao|make.*prescription|write.*prescription|প্রেসক্রিপশন|প্রেসক্রিপশন বানাও|ওষুধ লিখে দাও/i.test(t);
  if(rxIntent){
    CH.push({role:"assistant",content:"I can help format a prescription that a registered clinician has already chosen, or prepare a blank draft for clinician review. I cannot independently choose prescription medicines or doses. Please do not take medicines from an AI-generated draft.\n\nUse the button below to organize an existing doctor-written prescription."});
    chatShow();
    $("#cl").insertAdjacentHTML("beforeend",'<div class="b bt"><button class="btn" type="button" onclick="go(\'rxo\')">Open prescription organizer</button></div>');
    chatBusy=false; if(sendBtn)sendBtn.disabled=false; return;
  }
  $("#cl").insertAdjacentHTML("beforeend",'<div class="b bt" id="typing">MedAI is thinking…</div>');
  $("#cl").scrollTop=1e6;
  try{
    const d=await apiE("/api/v3/chat",{messages:CH,lang:LANG});
    const reply=d.error ? "⚠ "+d.error : (d.reply || "No reply received. Please try again.");
    CH.push({role:"assistant",content:reply});
  }catch(e){
    CH.push({role:"assistant",content:"Could not connect to MedAI. Please check the connection and try again."});
  }finally{
    chatBusy=false; if(sendBtn)sendBtn.disabled=false; chatShow();
  }
}

/* ---- hospitals + map ---- */
let LM,LG,HT="all",HP,HD=[],HM={},HLL=null,HS="";
function hosInit(){if(HP){LM&&setTimeout(()=>LM.invalidateSize(),60);return}
HP=(async()=>{const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(l);await ld("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js");
LM=L.map("hmap").setView([23.8103,90.4125],11);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(LM);LG=L.layerGroup().addTo(LM)})().catch(()=>{$("#hlist").innerHTML='<div class="note">Map failed to load. Check your internet connection and reload.</div>'});
hosLoc()}
const _go=go;go=function(i){_go(i);if(i=="hos")hosInit()};
const TYPE_L={hospital:["Hospital","হাসপাতাল"],clinic:["Clinic","ক্লিনিক"],doctors:["Doctor","ডাক্তার"],doctor:["Doctor","ডাক্তার"],laboratory:["Lab","ল্যাব"],diagnostic_centre:["Diagnostic","ডায়াগনস্টিক"],pharmacy:["Pharmacy","ফার্মেসি"]};
function hosCards(){const d=HS;if(!d)return;const gm=HLL?`https://www.google.com/maps/search/${HT=="pharmacy"?"pharmacy":"hospital"}/@${HLL[0]},${HLL[1]},14z`:"#";
$("#hlist").innerHTML=(HD.length?HD.map((h,i)=>{const tl=TYPE_L[h.type]||[h.type,h.type];return `<div class="card hos" id="hc${i}" data-hi="${i}"><div class="pic">🏥</div><div style="min-width:0"><b>${esc(h.name)}</b><div class="mute">${h.km} km · ${esc(tt(tl[0],tl[1]))}${h.emergency=="yes"?` · <span class="badge hi">${tt("Emergency","জরুরি")}</span>`:""}</div>${h.address?`<div class="mute">${esc(h.address)}</div>`:""}${h.hours?`<div class="mute">🕘 ${esc(h.hours)}</div>`:""}${h.phone?`<a href="tel:${esc(h.phone.split(";")[0].replace(/[^\d+]/g,""))}">📞 ${esc(h.phone)}</a>`:""}</div><a class="go" href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}" target="_blank" rel="noopener">${tt("Directions","দিকনির্দেশ")}</a></div>`}).join(""):`<div class="note">${tt("No listing found within "+d.radius_km+" km in OpenStreetMap. The map data may be incomplete here.","OpenStreetMap-এ "+d.radius_km+" কিমির মধ্যে কোনো তথ্য পাওয়া যায়নি।")}</div>`)
+`<a class="btn o" style="display:block;text-align:center;text-decoration:none;margin:10px 0" href="${gm}" target="_blank" rel="noopener">${tt("Also search in Google Maps","গুগল ম্যাপেও খুঁজুন")}</a><p class="mute">${tt("Source","সূত্র")}: ${esc(d.source)} · ${tt("searched radius","খোঁজার ব্যাসার্ধ")} ${d.radius_km} km · ${tt("retrieved at","সময়")} ${esc(d.fetched)}. ${tt("Hours and phone are shown only if listed. Call before you go.","সময় ও ফোন শুধু তালিকাভুক্ত থাকলে দেখানো হয়। যাওয়ার আগে ফোন করুন।")}</p>`}
function hosRefreshText(){if(HS)hosCards()}
async function hosLoad(lat,lon){await HP;if(!LM)return;HLL=[lat,lon];$("#hlist").innerHTML='<div class="mute">'+tt("Searching nearby facilities…","কাছের সেবাকেন্দ্র খোঁজা হচ্ছে…")+"</div>";
const d=await apiE(`/api/v3/hospitals?lat=${lat}&lon=${lon}&type=${HT}`);
if(d.error){HS="";$("#hlist").innerHTML=`<div class="note">${esc(d.error)}</div><button class="btn o" style="margin-top:8px" onclick="hosRetry()">Try again</button><a class="btn o" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="https://www.google.com/maps/search/hospital/@${lat},${lon},14z" target="_blank" rel="noopener">Open Google Maps</a>`;LM.setView([lat,lon],13);return}
HD=d.items;HS=d;HM={};LG.clearLayers();L.circleMarker([lat,lon],{radius:9,color:"#fff",weight:3,fillColor:"#1a73e8",fillOpacity:1}).addTo(LG).bindPopup(tt("You are here","আপনি এখানে"));
const P=[[lat,lon]];HD.forEach((h,i)=>{const m=L.marker([h.lat,h.lon],{title:h.name}).addTo(LG).bindPopup(`<b>${esc(h.name)}</b><br>${h.km} km`);m.on("click",()=>hosFocus(i,false));HM[i]=m;if(i<8)P.push([h.lat,h.lon])});
P.length>1?LM.fitBounds(P,{padding:[30,30],maxZoom:15}):LM.setView([lat,lon],13);setTimeout(()=>LM.invalidateSize(),100);hosCards()}
function hosFocus(i,fly){document.querySelectorAll(".hos.on").forEach(c=>c.classList.remove("on"));const c=$("#hc"+i);if(c){c.classList.add("on");if(!fly)c.scrollIntoView({block:"nearest",behavior:"smooth"})}if(fly&&HM[i]){LM.setView([HD[i].lat,HD[i].lon],16);HM[i].openPopup();$("#hmap").scrollIntoView({block:"center",behavior:"smooth"})}}
function hosRetry(){HLL?hosLoad(HLL[0],HLL[1]):hosLoc()}
function hosLoc(){const o=$("#hlist");if(!navigator.geolocation){o.innerHTML='<div class="note">This browser cannot give location. Search an area below.</div>';return}
if(!isSecureContext){o.innerHTML='<div class="note">Location needs a secure (https) page. Search an area below instead.</div>';return}
o.innerHTML='<div class="mute">'+tt("Getting your location…","আপনার অবস্থান নেওয়া হচ্ছে…")+"</div>";
navigator.geolocation.getCurrentPosition(p=>hosLoad(p.coords.latitude,p.coords.longitude),er=>{o.innerHTML=`<div class="note">${er.code==1?"Location is blocked for this site. Allow location in your browser settings, or search an area below.":"Could not get your location. Search an area below."}</div>`},{enableHighAccuracy:false,timeout:15000,maximumAge:300000})}
async function hosArea(){const q=$("#harea").value.trim();if(!q)return;$("#hlist").innerHTML='<div class="mute">Finding area…</div>';const d=await apiE("/api/v3/geocode?q="+encodeURIComponent(q));if(d.lat)hosLoad(d.lat,d.lon);else $("#hlist").innerHTML=`<div class="note">${esc(d.error)}</div>`}
$("#harea").onkeydown=e=>{if(e.key=="Enter")hosArea()};
$("#hchips").onclick=e=>{const b=e.target.closest("[data-ht]");if(!b)return;HT=b.dataset.ht;document.querySelectorAll("#hchips .chip").forEach(c=>c.classList.toggle("on",c==b));if(HLL)hosLoad(HLL[0],HLL[1])};
$("#hview").onclick=e=>{const v=e.target.closest("[data-hv]");if(!v)return;document.querySelectorAll("#hview button").forEach(b=>b.classList.toggle("on",b==v));$("#hmap").style.display=v.dataset.hv=="map"?"":"none";if(v.dataset.hv=="map"&&LM)setTimeout(()=>LM.invalidateSize(),60)};
document.addEventListener("click",e=>{const c=e.target.closest("[data-hi]");if(c&&!e.target.closest("a"))hosFocus(+c.dataset.hi,true)});

/* ---- report analysis ---- */
const RH=()=>LS("rhist",[]);let LASTREP=null;
$("#rep .sub").textContent="Upload a report (PDF or photo). Get a clear, plain-language analysis with charts. Only values printed in your report are used.";
function gauge(i){if(i.num==null||(i.lo==null&&i.hi==null))return"";let pos,bg;
if(i.lo!=null&&i.hi!=null){pos=25+(i.num-i.lo)/((i.hi-i.lo)||1)*50;bg="linear-gradient(90deg,#f5a524 25%,#2bb673 25% 75%,#f5a524 75%)"}
else if(i.hi!=null){pos=i.num/(i.hi||1)*50;bg="linear-gradient(90deg,#2bb673 50%,#e5484d 50%)"}else{pos=50+(i.num-i.lo)/(i.lo||1)*50;bg="linear-gradient(90deg,#e5484d 50%,#2bb673 50%)"}
return `<div class="gauge" style="background:${bg}"><i style="left:${Math.min(97,Math.max(3,pos))}%"></i></div>`}
const FL={HIGH:["hi","High ▲","বেশি ▲"],LOW:["lo","Low ▼","কম ▼"],NORMAL:["ok","Normal","স্বাভাবিক"],UNKNOWN:["","No range","রেঞ্জ নেই"]};
function repText(d){return `MedAI report summary\n${d.report_type||""} ${d.report_date||""}\n\n${LANG=="bn"&&d.summary_bn?d.summary_bn:d.summary||""}\n\n`+(d.items||[]).filter(i=>i.flag=="HIGH"||i.flag=="LOW").map(i=>`${i.name}: ${i.value} ${i.unit||""} (${i.flag}, ref ${i.range||"-"})`).join("\n")+"\n\n"+(d.disclaimer||"")}
function renderRep(d,prev){const c=d.counts||{},rated=c.NORMAL+c.HIGH+c.LOW,pct=rated?Math.round(c.NORMAL/rated*100):null,U={routine:["routine",tt("Routine follow-up","রুটিন ফলো-আপ")],soon:["soon",tt("See a doctor soon","শীঘ্রই ডাক্তার দেখান")],urgent:["urgent",tt("See a doctor urgently","জরুরি ভিত্তিতে ডাক্তার দেখান")]}[d.urgency];
const g={};(d.items||[]).forEach(i=>{(g[i.category||"Results"]=g[i.category||"Results"]||[]).push(i)});
const P=d.patient||{},meta=[d.report_type,d.report_date,d.lab,P.name,P.age,P.sex].filter(x=>x&&String(x).trim()).map(esc).join(" · ");
const sm=LANG=="bn"&&d.summary_bn?d.summary_bn:d.summary,ul=a=>a&&a.length?"<ul>"+a.map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>":"";
$("#rout").className="";$("#rout").innerHTML=`${prev||""}<div class="urg ${U[0]}">${U[1]}</div>${meta?`<div class="mute">${meta}</div>`:""}
<div class="stat"><div><b style="color:#127a45">${c.NORMAL}</b>${tt("Normal","স্বাভাবিক")}</div><div><b style="color:#c3262b">${c.HIGH}</b>${tt("High","বেশি")}</div><div><b style="color:#8a5600">${c.LOW}</b>${tt("Low","কম")}</div></div>
${pct!=null?`<div class="bar2"><i style="width:${pct}%"></i></div><div class="mute">${pct}% ${tt("of values with a printed range are in range","মান নির্ধারিত রেঞ্জের মধ্যে")}</div>`:""}
<h2 style="margin-top:14px">${tt("Summary","সারসংক্ষেপ")}</h2><p>${esc(sm||"")}</p>
${(d.key_findings||[]).length?`<h2>${tt("What stands out","যা লক্ষণীয়")}</h2>`+d.key_findings.map(k=>`<div class="kf ${esc(k.severity)}">${esc(k.text||k)}</div>`).join(""):""}
<div id="radv"></div><details class="det" open><summary>${tt("All results and ranges","সব ফলাফল ও রেঞ্জ")} (${(d.items||[]).length})</summary>${Object.entries(g).map(([k,a])=>`<div class="gl2">${esc(k)}</div>`+a.map(i=>{const f=FL[i.flag];return `<div class="ri"><div class="rh"><b>${esc(i.name)}</b><span class="badge ${f[0]}">${tt(f[1],f[2])}</span></div><div><span class="big">${esc(i.value)}</span> ${esc(i.unit||"")} <small class="mute">${i.range?tt("Reference","রেফারেন্স")+": "+esc(i.range):""}</small>${i.verified===false?` <small class="warnx">⚠ ${tt("check with original","মূল রিপোর্টের সাথে মিলিয়ে নিন")}</small>`:""}</div>${gauge(i)}${i.meaning?`<div class="mute">${esc(i.meaning)}</div>`:""}</div>`}).join("")).join("")}</details>
${d.see_doctor?`<h2 style="margin-top:14px">${tt("When to see a doctor","কখন ডাক্তার দেখাবেন")}</h2><p>${esc(d.see_doctor)}</p>`:""}
${(d.questions_for_doctor||[]).length?`<h2>${tt("Questions to ask your doctor","ডাক্তারকে যা জিজ্ঞেস করবেন")}</h2>${ul(d.questions_for_doctor.map(String))}`:""}
${(d.general_tips||[]).length?`<h2>${tt("General tips","সাধারণ পরামর্শ")}</h2>${ul(d.general_tips.map(String))}`:""}
<div class="grid g3" style="margin-top:12px;grid-template-columns:repeat(3,1fr)"><button class="btn" onclick="window.print()">${tt("Download PDF","পিডিএফ")}</button><button class="btn o" onclick="repShare()">${tt("Share","শেয়ার")}</button><button class="btn o" onclick="go('hos')">${tt("Find hospital","হাসপাতাল")}</button></div>
<div class="note" style="margin-top:10px">${esc(d.disclaimer||"")} ${tt("The AI can misread a file. Always compare with your original report.","এআই ভুল পড়তে পারে। সবসময় মূল রিপোর্টের সাথে মিলিয়ে দেখুন।")}</div>`}
function repShare(){if(!LASTREP)return;const t=repText(LASTREP);navigator.share?navigator.share({title:"MedAI report summary",text:t}).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>alert(tt("Summary copied.","সারাংশ কপি হয়েছে।")))}
function repUp(f){if(!f)return;const o=$("#rout");o.className="";if(f.size>8e6){o.innerHTML='<div class="note">File too large (max 8 MB).</div>';return}
if(!/^(application\/pdf|image\/)/.test(f.type)){o.innerHTML='<div class="note">Use a PDF, JPG or PNG file.</div>';return}
o.innerHTML='<div class="mute"><span class="spin"></span> '+tt("Reading and analysing your report… this can take up to a minute.","রিপোর্ট পড়া ও বিশ্লেষণ হচ্ছে… ১ মিনিট পর্যন্ত লাগতে পারে।")+"</div>";
const r=new FileReader();r.onload=async()=>{const prev=f.type.startsWith("image/")?`<img src="${r.result}" alt="original" class="orig"><div class="mute" style="margin-bottom:8px">${tt("Your original file","আপনার মূল ফাইল")}</div>`:`<div class="mute" style="margin-bottom:8px">📄 ${esc(f.name)}</div>`;
const d=await apiE("/api/v3/report",{file:r.result,name:f.name,lang:LANG});if(d.error){o.innerHTML=prev+`<div class="note">${esc(d.error)}</div>`;return}
LASTREP=d;renderRep(d,prev);const h=RH();h.unshift({id:nid(),ts:Date.now(),type:d.report_type||"report",date:d.report_date||"",bad:(d.counts.HIGH||0)+(d.counts.LOW||0),
items:(d.items||[]).filter(i=>i.num!=null).map(i=>({n:i.name,v:i.num,u:i.unit||"",lo:i.lo,hi:i.hi}))});SV("rhist",h.slice(0,20));rHist()};r.readAsDataURL(f)}
$("#rf").onchange=e=>{repUp(e.target.files[0]);e.target.value=""};$("#rc").onchange=e=>{repUp(e.target.files[0]);e.target.value=""};
let TP="";
function rHist(){const h=RH(),cnt={};h.forEach(r=>r.items.forEach(i=>{const k=i.n.toLowerCase();cnt[k]=(cnt[k]||[]).concat([i.n])}));
const tr=Object.values(cnt).filter(a=>a.length>=2).map(a=>a[0]);if(tr.length&&!tr.some(x=>x.toLowerCase()==TP.toLowerCase()))TP=tr[0];
let ch="";if(tr.length){const pts=h.map(r=>{const i=r.items.find(x=>x.n.toLowerCase()==TP.toLowerCase());return i?{t:r.ts,v:i.v,lo:i.lo,hi:i.hi,u:i.u}:null}).filter(Boolean).sort((a,b)=>a.t-b.t);
const vs=pts.map(p=>p.v).concat(pts[0].lo!=null?[pts[0].lo]:[],pts[0].hi!=null?[pts[0].hi]:[]),mn=Math.min(...vs),mx=Math.max(...vs),sp=(mx-mn)||1,Y=v=>110-(v-mn)/sp*90,X=i=>pts.length<2?150:20+i*260/(pts.length-1);
const band=pts[0].lo!=null&&pts[0].hi!=null?`<rect x="0" y="${Y(pts[0].hi)}" width="300" height="${Y(pts[0].lo)-Y(pts[0].hi)}" fill="#2bb67322"/>`:"";
ch=`<div class="chips">${tr.map(x=>`<button class="chip ${x.toLowerCase()==TP.toLowerCase()?"on":""}" data-tp="${esc(x)}">${esc(x)}</button>`).join("")}</div><svg viewBox="0 0 300 135" style="width:100%">${band}<polyline fill="none" stroke="#0f9d8a" stroke-width="2.5" points="${pts.map((p,i)=>X(i)+","+Y(p.v)).join(" ")}"/>${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.v)}" r="4" fill="#0f9d8a"/><text x="${X(i)}" y="${Y(p.v)-8}" font-size="9" text-anchor="middle" fill="currentColor">${p.v}</text><text x="${X(i)}" y="130" font-size="8" text-anchor="middle" fill="currentColor" opacity=".6">${new Date(p.t).toLocaleDateString()}</text>`).join("")}</svg><div class="mute">${tt("Trend uses only your own uploaded reports. Green band = printed reference range.","শুধু আপনার আপলোড করা রিপোর্ট থেকে। সবুজ অংশ = রেফারেন্স রেঞ্জ।")}</div>`}
let el=$("#rhist");if(!el){$("#rep").insertAdjacentHTML("beforeend",'<div class="card" id="rhist"></div>');el=$("#rhist")}
el.innerHTML=`<h2>${tt("My report history","আমার রিপোর্ট ইতিহাস")}</h2>`+(h.length?ch+h.map(r=>`<div class="row"><span><b>${esc(r.type)}</b> <small class="mute">${new Date(r.ts).toLocaleString()}${r.date?" · "+esc(r.date):""}</small><br><small class="mute">${r.bad} ${tt("abnormal value(s)","অস্বাভাবিক মান")}</small></span><button class="chip" data-rhd="${r.id}">✕</button></div>`).join(""):`<div class="mute">${tt("No reports yet. Upload two or more reports over time to see trends.","এখনো কোনো রিপোর্ট নেই। সময়ের সাথে একাধিক রিপোর্ট আপলোড করলে ট্রেন্ড দেখা যাবে।")}</div>`)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-tp],[data-rhd]");if(!t)return;if(t.dataset.tp){TP=t.dataset.tp}else SV("rhist",RH().filter(x=>x.id!=t.dataset.rhd));rHist()});
rHist();
const _cAll=cAll;cAll=function(){_cAll();SV("rhist",[]);try{localStorage.removeItem("rhist")}catch(e){}rHist()};
setLang(LANG);

/* ===================== MedAI v5 ===================== */
(function(){const s=document.createElement("style");s.textContent=`
.apv{border-radius:10px;padding:8px 12px;font-weight:800;margin-bottom:8px}.apv.wait,.apv.no{background:#fde8e8;color:#c3262b}.apv.ok{background:#dff5e8;color:#127a45}
.det>summary{cursor:pointer;font-weight:800;margin-top:14px}.dr{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start;margin:6px 0;padding:8px;border:1px solid var(--line);border-radius:10px}
.dr>div{display:grid;gap:6px}.dr input[type=text]{width:100%}.mepin{width:18px;height:18px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 2px #1a73e8}
.sob{display:block;width:100%;text-align:left;margin:6px 0}.cv table.rxt{width:100%}
@media print{body.pp *{visibility:hidden}body.pp .pr,body.pp .pr *{visibility:visible}body.pp .pr{position:absolute;left:0;top:0;width:100%}body.pp .pr .btn,body.pp .pr .grid{display:none}}`;document.head.appendChild(s)})();
Object.assign(BN,{"Symptom Checker":"উপসর্গ পরীক্ষা","AI Symptom Checker":"এআই উপসর্গ পরীক্ষা","BMI":"বিএমআই","BMI Calculator":"বিএমআই ক্যালকুলেটর","My Approvals":"আমার অনুমোদন","My Doctor Approvals":"ডাক্তারের অনুমোদন","For Doctors":"ডাক্তারদের জন্য","Doctor Review":"ডাক্তার রিভিউ","Start":"শুরু করুন","Calculate BMI":"বিএমআই হিসাব করুন","Refresh":"রিফ্রেশ","Prescription Draft":"প্রেসক্রিপশন খসড়া","Open":"খুলুন","Pending":"অপেক্ষমাণ","Approved":"অনুমোদিত","Rejected":"বাতিল"});
const DISC=()=>tt("AI draft only. A registered doctor decides your tests and medicines. Emergency: call 999.","শুধু এআই খসড়া। পরীক্ষা ও ওষুধ ঠিক করবেন নিবন্ধিত ডাক্তার। জরুরি অবস্থায় ৯৯৯।");
const spin=t=>`<div class="mute"><span class="spin"></span> ${t}</div>`;
const CS=()=>LS("cases",[]);
function addCase(id,kind,title){if(!id)return;const L=CS();L.unshift({id,kind,title:String(title||kind).slice(0,60),ts:Date.now()});SV("cases",L.slice(0,40))}
const ul2=a=>a&&a.length?"<ul>"+a.map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>":"";
const shrink=(u,mx=1280)=>new Promise(ok=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.82))};i.onerror=()=>ok(u);i.src=u});
function prn(b){const e=b.closest(".cv");if(!e)return;e.classList.add("pr");document.body.classList.add("pp");print();setTimeout(()=>{document.body.classList.remove("pp");e.classList.remove("pr")},800)}

/* ---- shared advice view (tests + medicines, doctor approval status) ---- */
function advHTML(a,c){const st=c?c.status:"pending",ok=st=="approved";
const U={routine:["routine",tt("Routine","রুটিন")],soon:["soon",tt("See a doctor soon","শীঘ্রই ডাক্তার দেখান")],urgent:["urgent",tt("See a doctor urgently","জরুরি ডাক্তার দেখান")],emergency:["urgent",tt("EMERGENCY: call 999","জরুরি: ৯৯৯ এ কল করুন")]}[a.urgency]||["routine","Routine"];
const B=ok?`<div class="apv ok">✔ ${tt("Approved by","অনুমোদন করেছেন")} Dr. ${esc(c.doctor)} · BMDC ${esc(c.bmdc)}</div>${c.note?`<div class="note">${esc(c.note)}</div>`:""}`
:st=="rejected"?`<div class="apv no">✖ ${tt("The doctor did not approve this. Please see a doctor in person.","ডাক্তার অনুমোদন করেননি। সরাসরি ডাক্তার দেখান।")}</div>${c.note?`<div class="note">${esc(c.note)}</div>`:""}`
:`<div class="apv wait">⏳ ${tt("AI DRAFT sent to a doctor. Waiting for approval. Do not take any medicine yet.","এআই খসড়া ডাক্তারের কাছে পাঠানো হয়েছে। অনুমোদনের অপেক্ষা। এখনই কোনো ওষুধ খাবেন না।")}</div>`;
const H=(t,x)=>x?`<h2 style="margin-top:12px">${t}</h2>${x}`:"";
const tests=(a.tests||[]).length?`<ul>${a.tests.map(t=>`<li><b>${esc(t.name)}</b>${t.why?` <span class="mute">– ${esc(t.why)}</span>`:""}</li>`).join("")}</ul><button class="btn o" style="width:auto" onclick="go('hos')">${tt("Find a diagnostic centre","ডায়াগনস্টিক সেন্টার খুঁজুন")}</button>`:"";
const meds=(a.medicines||[]).length?`<table class="rxt"><tr><th>${tt("Medicine","ওষুধ")}</th><th>${tt("Bangladesh brands","বাংলাদেশি ব্র্যান্ড")}</th><th>${tt("Dose · how often · days","মাত্রা · কতবার · কত দিন")}</th></tr>${a.medicines.map(m=>`<tr><td><b>${esc(m.generic)}</b><br><small>${esc(m.purpose)}</small>${m.cautions?`<br><small class="mute">⚠ ${esc(m.cautions)}</small>`:""}</td><td>${(m.brands||[]).length?m.brands.map(b=>esc(b.brand)+" "+esc(b.strength)+" · "+esc(b.company)).join("<br>"):'<small class="mute">'+tt("no brand in data file","ডেটা ফাইলে ব্র্যান্ড নেই")+"</small>"}</td><td>${ok?esc([m.dose,m.frequency,m.duration].filter(Boolean).join(" · ")||"-"):'<small class="mute">'+tt("after doctor approval","ডাক্তারের অনুমোদনের পর")+"</small>"}</td></tr>`).join("")}</table>`:`<p class="mute">${tt("No medicine suggested. A doctor must examine first.","কোনো ওষুধ প্রস্তাব করা হয়নি। আগে ডাক্তারের পরীক্ষা দরকার।")}</p>`;
return B+`<div class="urg ${U[0]}">${U[1]}</div>`
+(a.visible?H(tt("What the AI can see (may be wrong)","এআই যা দেখতে পাচ্ছে (ভুল হতে পারে)"),`<p>${esc(a.visible)}</p>`):"")
+(a.wound_type?`<p><b>${esc(a.wound_type)}</b>${a.source?`<br><span class="mute">${tt("Common cause","সাধারণ কারণ")}: ${esc(a.source)}</span>`:""}</p>`:"")
+(a.summary?`<p>${esc(a.summary)}</p>`:"")
+((a.refs&&Object.keys(a.refs).length)?`<div class="mute">${Object.entries(a.refs).map(([k,v])=>k+" = "+esc(v)).join(" · ")}</div>`:"")
+(a.conditions||[]).map(x=>`<div class="kf ${x.likelihood=="more likely"?"important":"watch"}"><b>${esc(x.name)}</b> <small class="mute">${esc(x.likelihood)}</small><p>${esc(x.why)}</p><b>${tt("Evidence from your reports","আপনার রিপোর্ট থেকে প্রমাণ")}</b>${x.evidence.map(e=>`<div class="ri"><div class="rh"><span><b>${esc(e.test)}</b> <small class="mute">${esc(e.report)}</small></span><span class="badge ${FL[e.flag]?FL[e.flag][0]:""}">${esc(e.flag)}</span></div><span class="big">${esc(e.value)}</span> ${esc(e.unit||"")} <small class="mute">${e.range?tt("Reference","রেফারেন্স")+": "+esc(e.range):""}</small>${gauge(e)}</div>`).join("")}${(x.confirm_with||[]).length?`<b>${tt("To confirm, a doctor may check","নিশ্চিত হতে ডাক্তার যা দেখতে পারেন")}</b>${ul2(x.confirm_with)}`:""}</div>`).join("")
+((a.trends||[]).length?`<h2 style="margin-top:12px">${tt("Changes across reports","রিপোর্টগুলোর মধ্যে পরিবর্তন")}</h2>`+a.trends.map(spark).join(""):"")
+(a.areas||[]).map(x=>`<div class="kf"><b>${esc(x.name)}</b>${x.function?`<br><span class="mute">${esc(x.function)}</span>`:""}${(x.why||[]).length?`<div style="margin-top:6px"><b>${tt("Why it may happen","কেন হতে পারে")}</b>${ul2(x.why)}</div>`:""}${(x.sources||[]).length?`<div><b>${tt("Common sources","সাধারণ উৎস")}</b>${ul2(x.sources)}</div>`:""}</div>`).join("")
+H(tt("Possible causes","সম্ভাব্য কারণ"),(a.possible_causes||[]).map(x=>`<div class="kf"><b>${esc(x.name)}</b> <small class="mute">${esc(x.likelihood)}</small><br>${esc(x.why)}</div>`).join(""))
+H(tt("Go to hospital at once if","এগুলো হলে সাথে সাথে হাসপাতালে যান"),(a.red_flags||[]).length?`<div class="kf important">${ul2(a.red_flags)}</div>`:"")
+H(tt("Tests to do","যে পরীক্ষা করাবেন"),tests)+H(tt("Medicines","ওষুধ"),meds)
+H(tt("Care steps","যত্নের ধাপ"),ul2(a.care_steps))+H(tt("Infection signs","সংক্রমণের লক্ষণ"),ul2(a.infection_signs))
+H(tt("Lifestyle tips","জীবনযাপনের পরামর্শ"),ul2(a.lifestyle))+H(tt("When to see a doctor","কখন ডাক্তার দেখাবেন"),a.see_doctor?`<p>${esc(a.see_doctor)}</p>`:"")+H(tt("Medical information sources","চিকিৎসা তথ্যের সূত্র"),(a.sources||[]).map(s=>`<div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></div>`).join(""))
+(a.notes||[]).map(n=>`<div class="note">${esc(n)}</div>`).join("")}
async function caseView(id,elId){const el=document.getElementById(elId);if(!el)return;if(!el.innerHTML)el.innerHTML=spin(tt("Loading…","লোড হচ্ছে…"));
const d=await apiE("/api/v3/case/"+id);if(d.error){el.innerHTML=`<div class="note">${esc(d.error)}</div>`;return}
el.innerHTML=advHTML(d.advice,d)+`<div class="grid g2" style="margin-top:10px"><button class="btn o" onclick="caseView('${id}','${elId}')">${tt("Check approval status","অনুমোদনের অবস্থা দেখুন")}</button><button class="btn" onclick="prn(this)">${tt("Print / Save PDF","প্রিন্ট / পিডিএফ")}</button></div><div class="note" style="margin-top:8px">${DISC()}</div>`}

/* ---- AI symptom checker (asks questions, uses saved documents) ---- */
const docsCtx=()=>RH().slice(0,5).map(r=>({type:r.type,date:r.date||new Date(r.ts).toLocaleDateString(),abn:r.abn||[],summary:r.sum||""}));
let SCS={m:[]};
function scPrep(){if(SCS.m.length)return;const a=pts.map(p=>p.label);$("#scarea").innerHTML=a.length?`<b>${tt("Body areas","শরীরের অংশ")}:</b> ${a.map(esc).join(", ")}`:tt("Tip: pick body areas on the Human Body page first (optional).","টিপ: আগে মানবদেহ পেজে ব্যথার জায়গা বেছে নিন (ঐচ্ছিক)।");
const me=LS("fam",[]).find(f=>f.r=="Self");if(me&&!$("#sca").value)$("#sca").value=me.a||"";const n=docsCtx().length;
$("#scdoc").innerHTML=n?`📄 ${tt("The AI will use your "+n+" saved report(s) to ask better questions.","এআই আপনার "+n+"টি সেভ করা রিপোর্ট দেখে প্রশ্ন করবে।")}`:tt("No saved reports yet. Upload one in Report Analysis so the AI can ask better questions.","এখনো কোনো রিপোর্ট নেই। রিপোর্ট বিশ্লেষণে আপলোড করলে এআই ভালো প্রশ্ন করতে পারবে।")}
function scStart(){const t=$("#sct").value.trim(),areas=pts.map(p=>`${p.label} (pain ${p.pain}/10${Object.entries(p.ans).map(([k,v])=>", "+k+": "+v).join("")})`),sy=[...sym.filter(x=>x!="Pain"),...myS];
if(t.length<3&&!areas.length&&!sy.length){$("#sct").focus();return}
const b=LS("bmi",null);if(b)sy.push("BMI "+b.b);
SCS={m:[{role:"user",content:"Main problem: "+(t||areas.join("; ")||sy.join(", "))}],areas,symptoms:sy,profile:{age:$("#sca").value,sex:$("#scx").value,allergy:$("#scl").value,pregnant:$("#scp").value,name:LS("name","")}};
$("#scs").style.display="none";$("#scr").innerHTML="";scNext()}
async function scNext(){const q=$("#scq");q.style.display="";q.innerHTML=spin(tt("Thinking…","ভাবছি…"));
const d=await apiE("/api/v3/symptom",{messages:SCS.m,areas:SCS.areas,symptoms:SCS.symptoms,profile:SCS.profile,docs:docsCtx(),lang:LANG});
if(d.error){q.innerHTML=`<div class="note">${esc(d.error)}</div><button class="btn o" onclick="scNext()">${tt("Try again","আবার চেষ্টা করুন")}</button>`;return}
if(d.action=="emergency"){q.innerHTML=`<div class="urg urgent">${tt("Emergency signs. Call 999 or go to the nearest emergency hospital now.","জরুরি লক্ষণ। এখনই ৯৯৯ এ কল করুন বা নিকটতম জরুরি হাসপাতালে যান।")}</div><a class="callbtn" href="tel:999">📞 999</a><button class="btn" onclick="go('hos')">${tt("Find emergency hospital","জরুরি হাসপাতাল খুঁজুন")}</button>`;return}
if(d.action=="ask"){SCS.last=d;scAsk(d);return}
q.style.display="none";$("#scr").innerHTML=`<div class="card cv" id="scc"></div><button class="btn o" style="margin-top:10px" onclick="scReset()">${tt("Start a new check","নতুন পরীক্ষা শুরু")}</button>`;
addCase(d.case_id,"symptom",SCS.m[0].content.replace("Main problem: ","").slice(0,50));caseView(d.case_id,"scc");scrollTo(0,0)}
function scAsk(d){const I={present:"hi",absent:"ok",unknown:""};
$("#scq").innerHTML=`<div class="bar2"><i style="width:${d.progress}%"></i></div><div class="mute">${tt("Question","প্রশ্ন")} ${d.n}</div>
${(d.indicators||[]).length?`<div class="mute" style="margin-top:8px">${tt("Warning-sign indicators I am checking","যে বিপদ-চিহ্নগুলো দেখছি")}:</div><div>${d.indicators.map(i=>`<span class="badge ${I[i.status]}" style="margin:2px;display:inline-block">${esc(i.name)}${i.status=="present"?" ●":i.status=="absent"?" ✓":" ?"}</span>`).join("")}</div>`:""}
<h2 style="margin-top:12px">${esc(d.question)}</h2>${d.why?`<div class="mute">${esc(d.why)}</div>`:""}
<div style="margin-top:8px">${(d.options||[]).map((o,i)=>`<button class="btn o sob" data-sco="${i}">${esc(o)}</button>`).join("")}</div>
<div class="row2" style="margin-top:8px"><input type="text" id="scfree" placeholder="${tt("Or type your answer","অথবা নিজের উত্তর লিখুন")}"><button class="btn" style="width:auto" data-scf="1">${tt("Send","পাঠান")}</button></div>`}
function scAns(t){if(!t)return;SCS.m.push({role:"assistant",content:SCS.last.question},{role:"user",content:t});scNext()}
function scReset(){SCS={m:[]};$("#scr").innerHTML="";$("#scq").style.display="none";$("#scs").style.display="";scPrep()}
document.addEventListener("click",e=>{const o=e.target.closest("[data-sco]");if(o)return scAns(SCS.last.options[+o.dataset.sco]);if(e.target.closest("[data-scf]"))scAns(($("#scfree").value||"").trim())});
document.addEventListener("keydown",e=>{if(e.target.id=="scfree"&&e.key=="Enter")scAns(e.target.value.trim())});
$("#ms").insertAdjacentHTML("beforeend",`<button class="btn" style="margin-top:10px" onclick="go('sc')">Start AI symptom check →</button>`);

/* ---- report analysis: advice (tests, medicines) first, details collapsed ---- */
async function repAdvice(d){const el=$("#radv");if(!el)return;el.innerHTML=spin(tt("Preparing next steps (tests, medicines) for your doctor…","আপনার ডাক্তারের জন্য পরবর্তী ধাপ (পরীক্ষা, ওষুধ) তৈরি হচ্ছে…"));
const ab=(d.items||[]).filter(i=>i.flag=="HIGH"||i.flag=="LOW").map(i=>`${i.name} ${i.value} ${i.unit||""} (${i.flag}, ref ${i.range||"-"})`),P=d.patient||{};
const dg=`Report: ${d.report_type||""} ${d.report_date||""}.\nAbnormal: ${ab.join("; ")||"none"}.\nNormal values: ${(d.counts||{}).NORMAL||0}.\nSummary: ${d.summary||""}\nKey findings: ${(d.key_findings||[]).map(k=>k.text||k).join("; ")}`;
const r=await apiE("/api/v3/advice",{kind:"report",text:dg,title:"Report: "+(d.report_type||""),lang:LANG,profile:{age:P.age,sex:P.sex,name:P.name}});
if(r.error){el.innerHTML=`<div class="note">${esc(r.error)}</div>`;return}
addCase(r.case_id,"report","Report: "+(d.report_type||""));el.innerHTML=`<h2 style="margin-top:14px">${tt("What to do next","এখন কী করবেন")}</h2><div class="cv" id="radvc"></div>`;caseView(r.case_id,"radvc")}
function repUp(f){if(!f)return;const o=$("#rout");o.className="";if(f.size>8e6){o.innerHTML='<div class="note">File too large (max 8 MB).</div>';return}
if(!/^(application\/pdf|image\/)/.test(f.type)){o.innerHTML='<div class="note">Use a PDF, JPG or PNG file.</div>';return}
o.innerHTML=spin(tt("Reading and analysing your report… this can take up to a minute.","রিপোর্ট পড়া ও বিশ্লেষণ হচ্ছে… ১ মিনিট পর্যন্ত লাগতে পারে।"));
const r=new FileReader();r.onload=async()=>{const prev=f.type.startsWith("image/")?`<img src="${r.result}" alt="original" class="orig"><div class="mute" style="margin-bottom:8px">${tt("Your original file","আপনার মূল ফাইল")}</div>`:`<div class="mute" style="margin-bottom:8px">📄 ${esc(f.name)}</div>`;
const d=await apiE("/api/v3/report",{file:r.result,name:f.name,lang:LANG});if(d.error){o.innerHTML=prev+`<div class="note">${esc(d.error)}</div>`;return}
LASTREP=d;renderRep(d,prev);const h=RH();h.unshift({id:nid(),ts:Date.now(),type:d.report_type||"report",date:d.report_date||"",bad:(d.counts.HIGH||0)+(d.counts.LOW||0),
items:(d.items||[]).filter(i=>i.num!=null).map(i=>({n:i.name,v:i.num,u:i.unit||"",lo:i.lo,hi:i.hi})),
all:(d.items||[]).slice(0,80).map(i=>[i.name,i.value,i.unit||"",i.flag,i.range||""]),abn:(d.items||[]).filter(i=>i.flag=="HIGH"||i.flag=="LOW").slice(0,12).map(i=>`${i.name} ${i.value} ${i.unit||""} (${i.flag})`),sum:(d.summary||"").slice(0,300)});SV("rhist",h.slice(0,20));rHist();repAdvice(d)};r.readAsDataURL(f)}

/* ---- wound check: photo analysis -> what it is, cause, care, medicines ---- */
$("#wq").insertAdjacentHTML("beforeend",`<div class="grid g2" style="margin-top:10px"><input type="text" id="wa" inputmode="numeric" placeholder="Age"><input type="text" id="wl" placeholder="Allergies (if any)"></div>`);
$("#wf").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{wimg=await shrink(r.result);$("#wprev").innerHTML=`<img src="${wimg}" style="max-width:100%;border-radius:12px">`};r.readAsDataURL(f)};
async function wGo(){const y=k=>wans[k]=="Yes";let L,m;
if(y("bleed")){L=["emergency","#e5484d",tt("Emergency","জরুরি")];m=tt("Call 999 or go to the nearest emergency hospital now. Press firmly on the wound with a clean cloth while you wait.","এখনই ৯৯৯ এ কল করুন বা নিকটতম জরুরি হাসপাতালে যান। অপেক্ষার সময় পরিষ্কার কাপড় দিয়ে ক্ষতস্থানে জোরে চেপে ধরুন।")}
else if(y("streak")||y("deep")||y("numb")||(y("fever")&&(y("pus")||y("worse")))){L=["urgent","#e08a00",tt("See a doctor today","আজই ডাক্তার দেখান")];m=tt("Do not wait for it to heal on its own. Get it checked today.","নিজে ভালো হওয়ার অপেক্ষা করবেন না। আজই দেখান।")}
else if(y("pus")||y("worse")){L=["soon","#d4a000",tt("See a doctor within 24 hours","২৪ ঘণ্টার মধ্যে ডাক্তার দেখান")];m=tt("Keep it clean and covered until you are seen.","দেখানোর আগে পরিষ্কার ও ঢাকা রাখুন।")}
else{L=["watch","#18a058",tt("Watch and keep it clean","পরিষ্কার রাখুন ও নজর রাখুন")];m=tt("Rinse gently with clean running water, cover with a clean dressing, and watch it. See a doctor if it gets worse.","পরিষ্কার চলমান পানিতে আলতো ধুয়ে পরিষ্কার ব্যান্ডেজ দিন। খারাপ হলে ডাক্তার দেখান।")}
$("#wres").innerHTML=`<div class="card" style="border-left:6px solid ${L[1]}"><h2 style="color:${L[1]}">${L[2]}</h2><p>${m}</p></div><div class="card" id="wai">${wimg&&L[0]!="emergency"?spin(tt("AI is studying the photo…","এআই ছবি দেখছে…")):`<div class="mute">${L[0]=="emergency"?"":tt("Add a photo to also get: what it looks like, the likely cause, care steps and medicines.","ছবি দিলে আরও পাবেন: কেমন দেখাচ্ছে, সম্ভাব্য কারণ, যত্ন ও ওষুধ।")}</div>`}</div><div class="note">${tt("A photo alone cannot confirm or rule out infection or any other condition. This is not a diagnosis.","শুধু ছবি দেখে সংক্রমণ বা অন্য কিছু নিশ্চিত বা বাদ দেওয়া যায় না। এটি রোগ নির্ণয় নয়।")}</div>`;
if(!wimg||L[0]=="emergency")return;
const d=await apiE("/api/v3/wound",{image:wimg,answers:wans,profile:{age:$("#wa").value,allergy:$("#wl").value,name:LS("name","")},lang:LANG});
if(!d.available){$("#wai").innerHTML=`<div class="mute">${esc(d.error||tt("Photo analysis needs the connected backend. Your answers above still apply.","ছবি বিশ্লেষণের জন্য ব্যাকএন্ড লাগবে।"))}</div>`;return}
addCase(d.case_id,"wound","Wound check");$("#wai").className="card cv";$("#wai").innerHTML="";caseView(d.case_id,"wai")}

/* ---- prescription draft: AI suggests -> sent to a doctor to approve ---- */
$("#rx .sub").textContent="AI suggests tests and medicines. Your draft is sent to a registered doctor who must approve it.";
$("#rx .warn").textContent="Do not take any medicine from this draft until the status shows APPROVED by a doctor.";
$("#rx .btn").textContent="Make draft and send to doctor";
$("#rdl").parentNode.insertAdjacentHTML("afterend",`<select class="fi" id="rdp" style="margin-bottom:8px"><option value="no">Not pregnant</option><option value="yes">Pregnant</option></select>`);
async function rxDraft(){const t=$("#rdt").value.trim();if(t.length<3)return;$("#rdo").className="card";$("#rdo").innerHTML=spin(tt("Preparing draft…","খসড়া তৈরি হচ্ছে…"));
const d=await apiE("/api/v3/advice",{kind:"rx",text:t,title:t,lang:LANG,profile:{age:$("#rda").value,allergy:$("#rdl").value,pregnant:$("#rdp").value,name:LS("name","")}});
if(d.error){$("#rdo").innerHTML=`<div class="mute">${esc(d.error)}</div>`;return}
if(d.emergency){$("#rdo").innerHTML=`<div class="urg urgent">${tt("Emergency signs. Call 999 or go to the nearest emergency hospital now. Do not wait for a draft.","জরুরি লক্ষণ। এখনই ৯৯৯ এ কল করুন বা জরুরি হাসপাতালে যান।")}</div>`;return}
addCase(d.case_id,"rx",t.slice(0,50));$("#rdo").className="card cv";$("#rdo").innerHTML="";caseView(d.case_id,"rdo")}

/* ---- BMI ---- */
let LB=null;
function bmiPrep(){const me=LS("fam",[]).find(f=>f.r=="Self");if(me&&!$("#bag").value)$("#bag").value=me.a||""}
function bmiGo(){let cm=parseFloat($("#bh").value);const ft=parseFloat($("#bf").value)||0,inch=parseFloat($("#bi").value)||0,kg=parseFloat($("#bw").value),age=parseInt($("#bag").value)||null;
if(!(cm>0)&&(ft>0||inch>0))cm=(ft*12+inch)*2.54;
if(!(cm>=50&&cm<=250&&kg>=2&&kg<=400)){$("#bout").innerHTML=`<div class="note">${tt("Enter a realistic height and weight.","সঠিক উচ্চতা ও ওজন দিন।")}</div>`;return}
const m=cm/100,b=kg/(m*m),B=Math.round(b*10)/10,kid=age!=null&&age<19;let en,bn,col;
if(kid){en="Child or teen: read BMI on a growth chart by age and sex";bn="শিশু/কিশোর: বয়স ও লিঙ্গ অনুযায়ী গ্রোথ চার্টে দেখতে হবে";col="#4a7fae"}
else if(b<18.5){en="Underweight";bn="কম ওজন";col="#e0a000"}else if(b<23){en="Normal weight";bn="স্বাভাবিক ওজন";col="#18a058"}
else if(b<25){en="Overweight (at risk)";bn="বেশি ওজন (ঝুঁকি)";col="#e08a00"}else if(b<30){en="Obese class I";bn="স্থূলতা (ধাপ ১)";col="#e5484d"}else{en="Obese class II";bn="স্থূলতা (ধাপ ২)";col="#b3262b"}
const lo=18.5*m*m,hi=22.9*m*m,pos=Math.min(97,Math.max(3,(b-15)/20*100)),dif=b>22.9?`${tt("To reach the top of the healthy range, about","স্বাস্থ্যকর সীমার উপরের মানে পৌঁছাতে প্রায়")} ${(kg-hi).toFixed(1)} kg ${tt("less","কম")}`:b<18.5?`${tt("To reach the healthy range, about","স্বাস্থ্যকর সীমায় পৌঁছাতে প্রায়")} ${(lo-kg).toFixed(1)} kg ${tt("more","বেশি")}`:tt("You are inside the healthy range.","আপনি স্বাস্থ্যকর সীমার মধ্যে আছেন।");
LB={B,en,cm:Math.round(cm),kg,age,sex:$("#bsx").value};SV("bmi",{b:B,t:Date.now()});const H=LS("bmih",[]);H.unshift({t:Date.now(),b:B,kg});SV("bmih",H.slice(0,10));
$("#bout").innerHTML=`<div style="text-align:center"><div class="big" style="font-size:44px;color:${col}">${B}</div><b style="color:${col}">${tt(en,bn)}</b></div>
<div class="gauge" style="background:linear-gradient(90deg,#f5a524 17.5%,#2bb673 17.5% 40%,#f08a1c 40% 50%,#e5484d 50%);margin-top:16px"><i style="left:${pos}%"></i></div>
<div class="mute" style="display:flex;justify-content:space-between;font-size:11px"><span>15</span><span>18.5</span><span>23</span><span>25</span><span>30</span><span>35+</span></div>
${kid?"":`<p>${tt("Healthy weight for your height","আপনার উচ্চতায় স্বাস্থ্যকর ওজন")}: <b>${lo.toFixed(1)} – ${hi.toFixed(1)} kg</b><br>${dif}</p>`}
<div class="note">${tt("Ranges use Asia-Pacific cut-offs (normal 18.5–22.9, overweight 23–24.9, obese 25+), used for South Asians. WHO standard: overweight 25+, obese 30+. BMI does not measure fat or muscle and is not accurate in pregnancy, for athletes or older adults.","এশিয়া-প্যাসিফিক সীমা ব্যবহার করা হয়েছে (স্বাভাবিক ১৮.৫–২২.৯, বেশি ওজন ২৩–২৪.৯, স্থূল ২৫+)। WHO মান: বেশি ওজন ২৫+, স্থূল ৩০+। গর্ভাবস্থা, ক্রীড়াবিদ ও বয়স্কদের ক্ষেত্রে BMI নির্ভুল নয়।")}</div>
<button class="btn" style="margin-top:10px" onclick="bmiAdv()">${tt("Get health advice (doctor approves)","স্বাস্থ্য পরামর্শ নিন (ডাক্তার অনুমোদন করবেন)")}</button>
${H.length>1?`<div class="mute" style="margin-top:8px">${tt("Previous","আগের")}: ${H.slice(1,5).map(h=>new Date(h.t).toLocaleDateString()+" → "+h.b).join(" · ")}</div>`:""}`;$("#badv").innerHTML=""}
async function bmiAdv(){if(!LB)return;$("#badv").innerHTML=`<div class="card" id="bad">${spin(tt("Preparing advice…","পরামর্শ তৈরি হচ্ছে…"))}</div>`;
const d=await apiE("/api/v3/advice",{kind:"bmi",text:`BMI ${LB.B} (${LB.en}). Height ${LB.cm} cm, weight ${LB.kg} kg. Give diet, activity and test advice only.`,title:"BMI "+LB.B,lang:LANG,profile:{age:LB.age,sex:LB.sex,name:LS("name","")}});
if(d.error){$("#bad").innerHTML=`<div class="note">${esc(d.error)}</div>`;return}
addCase(d.case_id,"bmi","BMI "+LB.B);$("#bad").className="card cv";$("#bad").innerHTML="";caseView(d.case_id,"bad")}

/* ---- patient: my approvals ---- */
function apLoad(){const L=CS(),el=$("#apl");if(!L.length){el.innerHTML=`<div class="mute">${tt("Nothing sent to a doctor yet.","এখনো কিছু ডাক্তারের কাছে পাঠানো হয়নি।")}</div>`;return}
el.innerHTML=L.map(c=>`<div class="card" style="margin-bottom:10px"><div class="rh"><b>${esc(c.title)}</b><span class="badge" id="ab${c.id}">…</span></div><div class="mute">${esc(c.kind)} · ${new Date(c.ts).toLocaleString()}</div><details><summary style="cursor:pointer;margin-top:6px">${tt("Open","খুলুন")}</summary><div class="cv" id="ac${c.id}"></div></details></div>`).join("");
L.forEach(async c=>{const d=await apiE("/api/v3/case/"+c.id),b=document.getElementById("ab"+c.id);if(!b)return;if(d.error){b.textContent=tt("Not found","পাওয়া যায়নি");return}
b.textContent={pending:tt("Pending","অপেক্ষমাণ"),approved:tt("Approved","অনুমোদিত"),rejected:tt("Not approved","অনুমোদিত নয়")}[d.status];b.className="badge "+(d.status=="approved"?"ok":d.status=="rejected"?"hi":"lo")})}
document.addEventListener("toggle",e=>{const d=e.target;if(d.tagName=="DETAILS"&&d.open){const cv=d.querySelector(".cv[id^=ac]");if(cv&&!cv.innerHTML)caseView(cv.id.slice(2),cv.id)}},true);

/* ---- doctor review ---- */
let DK="",DS="pending",DC={};
const trow=t=>`<div class="dr"><input type="checkbox" checked><div><input type="text" value="${esc(t.name)}" placeholder="Test"><input type="text" value="${esc(t.why)}" placeholder="Why"></div></div>`;
const mrow=m=>`<div class="dr"><input type="checkbox" checked><div><input type="text" value="${esc(m.generic)}" placeholder="Generic name"><input type="text" value="${esc(m.purpose)}" placeholder="Purpose"><input type="text" value="${esc(m.dose)}" placeholder="Dose, e.g. 500 mg"><input type="text" value="${esc(m.frequency)}" placeholder="How often"><input type="text" value="${esc(m.duration)}" placeholder="Days"><input type="text" value="${esc(m.cautions)}" placeholder="Cautions"></div></div>`;
function drCard(c){const a=c.advice,P=c.profile||{},ro=c.status!="pending",i=c.id;
return `<div class="card" style="margin-top:12px"><div class="rh"><b>${esc(c.title)}</b><span class="badge ${c.status=="approved"?"ok":c.status=="rejected"?"hi":"lo"}">${c.status}</span></div>
<div class="mute">${esc(c.kind)} · ${new Date(c.created*1000).toLocaleString()} · ${esc(P.name||"-")} · age ${esc(P.age||"-")} ${esc(P.sex||"")} · allergy: ${esc(P.allergy||"-")}${P.pregnant=="yes"?" · PREGNANT":""} · urgency: <b>${esc(a.urgency)}</b></div>
${a.visible?`<p><b>Photo:</b> ${esc(a.visible)} ${esc(a.wound_type||"")}</p>`:""}<p>${esc(a.summary||"")}</p>${(a.possible_causes||[]).map(x=>`<div class="kf"><b>${esc(x.name)}</b> <small>${esc(x.likelihood)}</small> ${esc(x.why)}</div>`).join("")}${(a.conditions||[]).map(x=>`<div class="kf important"><b>${esc(x.name)}</b> <small>${esc(x.likelihood)}</small> · evidence: ${x.evidence.map(e=>esc(e.report+" "+e.test+" "+e.value+" "+(e.unit||"")+" "+e.flag)).join("; ")}</div>`).join("")}
<h2 style="margin-top:10px">Tests</h2><div id="dt${i}">${(a.tests||[]).map(trow).join("")}</div><button class="chip" onclick="document.getElementById('dt${i}').insertAdjacentHTML('beforeend',trow({name:'',why:''}))">+ test</button>
<h2 style="margin-top:10px">Medicines</h2><div id="dm${i}">${(a.medicines||[]).map(mrow).join("")}</div><button class="chip" onclick="document.getElementById('dm${i}').insertAdjacentHTML('beforeend',mrow({generic:'',purpose:'',dose:'',frequency:'',duration:'',cautions:''}))">+ medicine</button>
<h2 style="margin-top:10px">Lifestyle (one per line)</h2><textarea id="dl${i}" rows="3">${esc((a.lifestyle||[]).join("\n"))}</textarea>
<h2 style="margin-top:10px">When to see a doctor</h2><textarea id="ds${i}" rows="2">${esc(a.see_doctor||"")}</textarea>
${ro?`<div class="note">Reviewed by Dr. ${esc(c.doctor)} · BMDC ${esc(c.bmdc)}${c.note?" · "+esc(c.note):""}</div>`:`<textarea id="dk${i}" rows="2" placeholder="Note to patient (optional)" style="margin-top:8px"></textarea>
<div class="grid g2" style="margin:8px 0"><input type="text" id="dn${i}" placeholder="Doctor name" value="${esc(LS("dname",""))}"><input type="text" id="db${i}" placeholder="BMDC reg. no" value="${esc(LS("dbmdc",""))}"></div>
<div class="grid g2"><button class="btn" onclick="drAct('${i}','approve')">Approve</button><button class="btn o" onclick="drAct('${i}','reject')">Reject</button></div>`}</div>`}
async function drLoad(){DK=$("#dkey").value||DK;let r;try{r=await (await fetch("/api/v3/doctor/cases?status="+DS,{headers:{"X-Doctor-Key":DK}})).json()}catch(e){r={error:"Cannot reach the server"}}
if(r.error){$("#drl").innerHTML=`<div class="note" style="margin-top:10px">${esc(r.error)}</div>`;return}
DC={};r.items.forEach(c=>DC[c.id]=c);$("#drl").innerHTML=r.items.length?r.items.map(drCard).join(""):`<div class="mute" style="margin-top:10px">No ${DS} cases.</div>`}
function drAct(id,act){const g=s=>[...document.querySelectorAll(`#${s}${id} .dr`)].filter(r=>r.querySelector("input[type=checkbox]").checked).map(r=>[...r.querySelectorAll("input[type=text]")].map(x=>x.value.trim()));
const doctor=$("#dn"+id).value.trim(),bmdc=$("#db"+id).value.trim();if(act=="approve"&&(!doctor||!bmdc)){alert("Doctor name and BMDC number are required.");return}
if(!confirm(act=="approve"?"Approve this prescription and advice?":"Reject this draft?"))return;SV("dname",doctor);SV("dbmdc",bmdc);const a=DC[id].advice;
const adv={urgency:a.urgency,summary:a.summary,see_doctor:$("#ds"+id).value,lifestyle:$("#dl"+id).value.split("\n").map(s=>s.trim()).filter(Boolean),
tests:g("dt").filter(r=>r[0]).map(r=>({name:r[0],why:r[1]})),medicines:g("dm").filter(r=>r[0]).map(r=>({generic:r[0],purpose:r[1],dose:r[2],frequency:r[3],duration:r[4],cautions:r[5]}))};
fetch("/api/v3/doctor/review",{method:"POST",headers:{"Content-Type":"application/json","X-Doctor-Key":DK},body:JSON.stringify({id,action:act,advice:adv,note:$("#dk"+id).value,doctor,bmdc})}).then(r=>r.json()).then(r=>{if(r.error)alert(r.error);else drLoad()}).catch(()=>alert("Cannot reach the server"))}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ds]");if(!b)return;DS=b.dataset.ds;document.querySelectorAll("[data-ds]").forEach(x=>x.classList.toggle("on",x==b));if(DK)drLoad()});

/* ---- hospital finder: exact location (GPS fix, accuracy circle, draggable pin, address) ---- */
document.querySelector("#hmap").insertAdjacentHTML("beforebegin",'<div id="hwhere" class="mute" style="margin:6px 0"></div>');
let HPIN=null;
async function hosLoad(lat,lon,acc){await HP;if(!LM)return;HLL=[lat,lon];
$("#hlist").innerHTML='<div class="mute">'+tt("Searching nearby facilities…","কাছের সেবাকেন্দ্র খোঁজা হচ্ছে…")+"</div>";
const d=await apiE(`/api/v3/hospitals?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&type=${HT}`);
HM={};LG.clearLayers();HPIN=L.marker([lat,lon],{icon:L.divIcon({className:"",html:'<div class="mepin"></div>',iconSize:[22,22],iconAnchor:[11,11]}),draggable:true,zIndexOffset:1000}).addTo(LG).bindPopup(tt("You are here. Wrong place? Drag me.","আপনি এখানে। ভুল হলে আমাকে টেনে সরান।"));
HPIN.on("dragend",()=>{const p=HPIN.getLatLng();hosLoad(p.lat,p.lng,0)});if(acc>0&&acc<5000)L.circle([lat,lon],{radius:acc,color:"#1a73e8",weight:1,fillOpacity:.1}).addTo(LG);
apiE(`/api/v3/reverse?lat=${lat}&lon=${lon}`).then(r=>{$("#hwhere").innerHTML=`📍 <b>${tt("Your spot","আপনার অবস্থান")}:</b> ${esc(r.name||lat.toFixed(5)+", "+lon.toFixed(5))}${acc>0?` · ±${Math.round(acc)} m`:""}${acc>1500?`<br><span class="warnx">⚠ ${tt("Your device gave only an approximate location. Drag the blue pin to your exact spot.","আপনার ডিভাইস আনুমানিক অবস্থান দিয়েছে। নীল পিনটি টেনে সঠিক জায়গায় রাখুন।")}</span>`:`<br><small>${tt("Wrong? Drag the blue pin.","ভুল হলে নীল পিন টেনে সরান।")}</small>`}`});
if(d.error){HS="";$("#hlist").innerHTML=`<div class="note">${esc(d.error)}</div><button class="btn o" style="margin-top:8px" onclick="hosRetry()">Try again</button><a class="btn o" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="https://www.google.com/maps/search/hospital/@${lat},${lon},14z" target="_blank" rel="noopener">Open Google Maps</a>`;LM.setView([lat,lon],15);return}
HD=d.items;HS=d;const P=[[lat,lon]];HD.forEach((h,i)=>{const m=L.marker([h.lat,h.lon],{title:h.name}).addTo(LG).bindPopup(`<b>${esc(h.name)}</b><br>${h.km} km`);m.on("click",()=>hosFocus(i,false));HM[i]=m;if(i<8)P.push([h.lat,h.lon])});
P.length>1?LM.fitBounds(P,{padding:[30,30],maxZoom:16}):LM.setView([lat,lon],15);setTimeout(()=>LM.invalidateSize(),100);hosCards()}
function hosLoc(){const o=$("#hlist");if(!navigator.geolocation){o.innerHTML='<div class="note">This browser cannot give location. Search an area below.</div>';return}
if(!isSecureContext){o.innerHTML='<div class="note">Location needs a secure (https) page. Search an area below instead.</div>';return}
let best=null,done=false,t0=Date.now(),wid=null;const fin=()=>{if(done)return;done=true;if(wid!=null)navigator.geolocation.clearWatch(wid);if(best)hosLoad(best.latitude,best.longitude,best.accuracy);else o.innerHTML=`<div class="note">${tt("Could not get your location. Search an area below, or tap the map.","অবস্থান পাওয়া যায়নি। নিচে এলাকা খুঁজুন।")}</div>`};
o.innerHTML='<div class="mute"><span class="spin"></span> '+tt("Getting your exact location (GPS)…","আপনার সঠিক অবস্থান (GPS) নেওয়া হচ্ছে…")+"</div>";
wid=navigator.geolocation.watchPosition(p=>{if(!best||p.coords.accuracy<best.accuracy)best=p.coords;$("#hwhere").textContent=tt("Improving accuracy… ±","সঠিকতা বাড়ানো হচ্ছে… ±")+Math.round(best.accuracy)+" m";if(best.accuracy<=60||Date.now()-t0>15000)fin()},er=>{if(er.code==1){done=true;navigator.geolocation.clearWatch(wid);o.innerHTML=`<div class="note">${tt("Location is blocked for this site. Allow location in your browser settings, or search an area below.","এই সাইটের জন্য লোকেশন বন্ধ। ব্রাউজার সেটিংসে অনুমতি দিন বা নিচে এলাকা খুঁজুন।")}</div>`}else fin()},{enableHighAccuracy:true,maximumAge:0,timeout:20000});
setTimeout(fin,20000)}

/* ---- 3D model: serve and load the user's own .glb ---- */
let MODEL_URL="";
async function modelProbe(){const d=await apiE("/api/model");MODEL_URL=d.url||""}
const CLS=n=>{n=String(n).toLowerCase();return/muscle|musculus|biceps|triceps|deltoid|gluteus|gastrocnemius|quadriceps|pectoralis|trapezius|latissimus|abdominis/.test(n)?"muscles":/bone|skeleton|vertebra|femur|tibia|fibula|rib|skull|mandible|humerus|radius|ulna|pelvis|scapula|clavicle|sternum|sacrum|cranium|patella|phalanx|metacarpal|metatarsal|tarsal|carpal/.test(n)?"skeleton":/heart|lung|liver|kidney|stomach|intestin|colon|brain|pancreas|spleen|bladder|esophagus|gallbladder|aorta|trachea/.test(n)?"organs":"other"};
function modelReady(){const on={skeleton:1,muscles:1,organs:1,other:1};T3.on=on;T3.cls=new Map();T3.model.forEach(m=>T3.cls.set(m,CLS(m.userData.label||m.name)));
$("#w3d .lay").innerHTML=Object.keys(on).map(k=>`<button class="chip on" data-ml="${k}">${{skeleton:tt("Bones","হাড়"),muscles:tt("Muscles","পেশি"),organs:tt("Organs","অঙ্গ"),other:tt("Other","অন্যান্য")}[k]}</button>`).join("");
T3.pick=()=>T3.model.filter(m=>m.visible);$("#w3d").insertAdjacentHTML("beforeend",`<div class="mute" style="position:absolute;left:8px;bottom:6px;font-size:11px;color:#9fd6cf">${tt("Your 3D model","আপনার 3D মডেল")} · ${T3.model.length} ${tt("parts","অংশ")}</div>`)}
function modelFail(){}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ml]");if(!b||!T3||!T3.model)return;const k=b.dataset.ml;T3.on[k]=!T3.on[k];b.classList.toggle("on",!!T3.on[k]);T3.model.forEach(m=>m.visible=!!T3.on[T3.cls.get(m)])});


function spark(t){const v=t.pts.map(p=>p.v),ex=v.concat(t.lo!=null?[t.lo]:[],t.hi!=null?[t.hi]:[]),mn=Math.min(...ex),mx=Math.max(...ex),sp=(mx-mn)||1,Y=y=>55-(y-mn)/sp*45,X=i=>20+i*260/(v.length-1);
const band=t.lo!=null&&t.hi!=null?`<rect x="0" y="${Y(t.hi)}" width="300" height="${Y(t.lo)-Y(t.hi)}" fill="#2bb67322"/>`:"";
return `<div class="ri"><b>${esc(t.test)}</b> <small class="mute">${esc(t.unit||"")}</small><svg viewBox="0 0 300 75" style="width:100%">${band}<polyline fill="none" stroke="#0f9d8a" stroke-width="2.5" points="${v.map((y,i)=>X(i)+","+Y(y)).join(" ")}"/>${t.pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.v)}" r="4" fill="#0f9d8a"/><text x="${X(i)}" y="${Y(p.v)-7}" font-size="9" text-anchor="middle" fill="currentColor">${p.v}</text><text x="${X(i)}" y="72" font-size="8" text-anchor="middle" fill="currentColor" opacity=".6">${esc(p.r)}</text>`).join("")}</svg></div>`}
$("#rhist").insertAdjacentHTML("beforebegin",`<div class="card" id="rcmb"><h2>Combined analysis of all my reports</h2><div class="mute" style="margin-bottom:8px">When you have 2 or more reports, the AI reads them together and lists the possible conditions they point to. Every point shows the exact report and value it comes from. A doctor must confirm.</div><button class="btn" onclick="combineGo()">Combine all my reports</button><div id="rcmbo" style="margin-top:10px"></div></div>`);
async function combineGo(){const o=$("#rcmbo"),all=RH().filter(r=>r.all).slice(0,6).reverse();o.className="";
if(all.length<2){o.innerHTML=`<div class="note">${tt("Upload at least 2 reports first. Reports saved before this update have no full data, so upload them again.","আগে অন্তত ২টি রিপোর্ট আপলোড করুন। এই আপডেটের আগে সেভ করা রিপোর্টে পূর্ণ তথ্য নেই, আবার আপলোড করুন।")}</div>`;return}
o.innerHTML=spin(tt("Reading all reports together…","সব রিপোর্ট একসাথে পড়া হচ্ছে…"));const me=LS("fam",[]).find(f=>f.r=="Self");
const d=await apiE("/api/v3/combine",{reports:all.map(r=>({type:r.type,date:r.date||new Date(r.ts).toLocaleDateString(),items:r.all,summary:r.sum})),profile:{age:(me&&me.a)||"",name:LS("name","")},lang:LANG});
if(d.error){o.innerHTML=`<div class="note">${esc(d.error)}</div>`;return}
addCase(d.case_id,"combined","Combined: "+all.length+" reports");o.className="cv";o.innerHTML="";caseView(d.case_id,"rcmbo")}
Object.assign(BN,{"Combined analysis of all my reports":"আমার সব রিপোর্টের সম্মিলিত বিশ্লেষণ","Combine all my reports":"সব রিপোর্ট একসাথে বিশ্লেষণ করুন"});
/* ---- Human Body: its own AI analysis (why it happens, sources, what to do) ---- */
$("#ms").insertAdjacentHTML("afterend",`<div class="card" id="bai" style="margin-top:12px"><h2>AI Body Analysis</h2><div class="mute" style="margin-bottom:8px">Pick body parts above (front, back, organs or 3D). The AI explains what each part does, why it may hurt, the common sources, and what to do. A doctor approves any tests and medicines.</div>
<div class="grid g2" style="margin-bottom:8px"><input type="text" id="baa" inputmode="numeric" placeholder="Age"><input type="text" id="bal" placeholder="Allergies (if any)"></div>
<button class="btn" onclick="bodyAI()">Analyse with AI</button><div id="baio" style="margin-top:10px"></div></div>`);
async function bodyAI(){const o=$("#baio"),areas=pts.map(p=>`${p.label} (pain ${p.pain}/10${Object.entries(p.ans).map(([k,v])=>", "+k+": "+v).join("")})`),sy=[...sym.filter(x=>x!="Pain"),...myS];
if(!areas.length&&!sy.length){o.className="";o.innerHTML=`<div class="note">${tt("Tap a body part or add a symptom first.","আগে শরীরের একটি অংশ ট্যাপ করুন বা উপসর্গ যোগ করুন।")}</div>`;return}
o.className="";o.innerHTML=spin(tt("AI is analysing…","এআই বিশ্লেষণ করছে…"));const me=LS("fam",[]).find(f=>f.r=="Self");
const d=await apiE("/api/v3/body",{areas,symptoms:sy,docs:docsCtx(),lang:LANG,profile:{age:$("#baa").value||(me&&me.a)||"",allergy:$("#bal").value,name:LS("name","")}});
if(d.error){o.innerHTML=`<div class="note">${esc(d.error)}</div>`;return}
if(d.emergency){o.innerHTML=`<div class="urg urgent">${tt("Emergency signs. Call 999 or go to the nearest emergency hospital now.","জরুরি লক্ষণ। এখনই ৯৯৯ এ কল করুন বা জরুরি হাসপাতালে যান।")}</div><a class="callbtn" href="tel:999">📞 999</a>`;return}
addCase(d.case_id,"body","Body: "+areas.map(x=>x.split(" (")[0]).join(", "));o.className="cv";o.innerHTML="";caseView(d.case_id,"baio")}
Object.assign(BN,{"AI Body Analysis":"এআই বডি বিশ্লেষণ","Analyse with AI":"এআই দিয়ে বিশ্লেষণ করুন"});

/* ---- wiring ---- */
Object.assign(KW,{sc:"symptom check symptoms fever cough",bmi:"bmi weight height obesity",ap:"approval approved doctor"});
const _go2=go;go=function(i){_go2(i);if(i=="sc")scPrep();if(i=="ap")apLoad();if(i=="bmi")bmiPrep()};
setLang(LANG);

