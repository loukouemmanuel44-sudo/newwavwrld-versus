const $=(s,r=document)=>r.querySelector(s);let tm;
const esc=t=>{const d=document.createElement("div");d.textContent=t;return d.innerHTML};
function say(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tm);tm=setTimeout(()=>t.classList.remove("show"),3200)}
function reste(s){if(s==null)return"";if(s>=86400)return"Fin dans "+Math.floor(s/86400)+" j";if(s>=3600)return"Fin dans "+Math.floor(s/3600)+" h";return"Fin dans "+Math.max(1,Math.ceil(s/60))+" min"}
function side(a,s){return `<div class="side"><div class="ph" data-s="${s}"><img src="${esc(a.photo)}" alt="Portrait de ${esc(a.nom)}" decoding="async" loading="lazy"></div><div class="pl">${esc(a.nom)}</div><button class="inf" type="button" data-slug="${esc(a.slug)}">Plus d’infos</button><button class="vote" data-s="${s}" aria-label="Voter pour ${esc(a.nom)}">Voter</button></div>`}
function resultats(sec,v,choix,r){
  sec.querySelectorAll(".vote").forEach(b=>{b.disabled=true;b.classList.add(b.dataset.s===choix?"on":"off");b.textContent=b.dataset.s===choix?"Ton choix":"Voter"});
  const e=$(".res",sec);e.hidden=false;
  if(!r){e.innerHTML='<p class="ok">Vote enregistré. Les résultats seront publiés à la clôture.</p>';return}
  const t=r.a+r.b,a=t?Math.round(r.a/t*100):50,b=100-a,f=e.querySelectorAll(".fig div");
  f[0].innerHTML=`${a} %<small>${esc(v.a.nom)}</small>`;f[1].innerHTML=`${b} %<small>${esc(v.b.nom)}</small>`;
  const u=e.querySelectorAll(".bar i");requestAnimationFrame(()=>{u[0].style.width=a+"%";u[1].style.width=b+"%"});
}
function rendre(v){
  const s=document.createElement("section");s.className="v";s.setAttribute("aria-label",`${v.a.nom} contre ${v.b.nom}`);
  s.innerHTML=`<span class="ban">${esc(v.tour)}</span><div class="vsw" aria-hidden="true">VS</div><div class="t"><span></span><span>${reste(v.reste)}</span></div><div class="arena">${side(v.a,"a")}${side(v.b,"b")}<div class="res" hidden><div class="bar" aria-hidden="true"><i></i><i></i></div><div class="fig"><div></div><div></div></div><p class="ok">Ton vote est pris en compte.</p></div></div>`;
  $("#vs").appendChild(s);
  s.querySelectorAll(".ph img").forEach(i=>i.addEventListener("error",()=>i.remove()));
  s.addEventListener("click",e=>{
    const n=e.target.closest("[data-slug]");if(n)return say("Les fiches artistes arrivent à l’étape 5");
    const b=e.target.closest(".vote");if(b&&!b.disabled)voter(v,s,b.dataset.s);
  });
  if(v.mon_vote)resultats(s,v,v.mon_vote,v.resultats);
}
async function voter(v,s,cote){
  const bt=s.querySelectorAll(".vote");bt.forEach(b=>b.disabled=true);
  try{
    const r=await fetch("/api/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({versus_id:v.id,cote})});
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.ok){s.querySelector(`.ph[data-s="${cote}"]`).classList.add("burst");if(navigator.vibrate)navigator.vibrate(30);return resultats(s,v,d.mon_vote,d.resultats)}
    if(r.status===409){say(d.message);return resultats(s,v,d.mon_vote,d.resultats)}
    throw new Error(d.message||"Le vote n’a pas pu être enregistré.");
  }catch(e){bt.forEach(b=>b.disabled=false);say(e instanceof TypeError?"Connexion impossible. Réessaie.":e.message)}
}
async function charger(){
  $("#vs").innerHTML='<p class="sub">Chargement…</p>';
  try{
    const r=await fetch("/api/versus"),d=await r.json();if(!r.ok||!d.ok)throw 0;
    $("#vs").innerHTML="";
    if(!d.versus.length){$("#sub").textContent="Aucun versus ouvert pour le moment";return}
    $("#sub").textContent=`${d.versus.length} versus ouvert${d.versus.length>1?"s":""}`;
    d.versus.forEach(rendre);
  }catch{$("#vs").innerHTML='<p class="sub">Impossible de charger les versus.</p><button class="vote" style="width:100%" id="re">Réessayer</button>';$("#re").onclick=charger}
}
charger();
