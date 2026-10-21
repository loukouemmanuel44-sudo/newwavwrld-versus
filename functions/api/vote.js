import{json,sha,lireId,cookie,comptes,ouvert}from"../_lib.js";
export async function onRequestPost({request,env}){
  try{
    let b;try{b=await request.json()}catch{return json({ok:false,message:"Requête invalide."},400)}
    const vid=Number(b.versus_id),cote=b.cote;
    if(!Number.isInteger(vid)||(cote!=="a"&&cote!=="b"))return json({ok:false,message:"Requête invalide."},400);
    const now=Math.floor(Date.now()/1000);
    const v=await env.DB.prepare(`SELECT id,show_results FROM versus v WHERE id=?2 AND ${ouvert}`).bind(now,vid).first();
    if(!v)return json({ok:false,message:"Ce vote n’est pas ouvert."},403);
    let id=lireId(request),neuf=false;if(!id){id=crypto.randomUUID();neuf=true}
    const h=neuf?{"Set-Cookie":cookie(id)}:{};
    const voter=await sha(id+env.SECRET),ip=await sha((request.headers.get("CF-Connecting-IP")||"")+env.SECRET);
    try{
      await env.DB.prepare("INSERT INTO votes(versus_id,side,voter_hash,ip_hash,created_at) VALUES(?,?,?,?,?)").bind(vid,cote,voter,ip,now).run();
    }catch(e){
      if(String(e).includes("UNIQUE")){
        const m=await env.DB.prepare("SELECT side FROM votes WHERE versus_id=? AND voter_hash=?").bind(vid,voter).first();
        return json({ok:false,message:"Tu as déjà voté pour ce versus.",mon_vote:m&&m.side,resultats:v.show_results==="live"?await comptes(env.DB,vid):null},409,h);
      }
      throw e;
    }
    return json({ok:true,mon_vote:cote,resultats:v.show_results==="live"?await comptes(env.DB,vid):null},200,h);
  }catch(e){return json({ok:false,message:"Erreur serveur."},500)}
}
