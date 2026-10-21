import{json,sha,lireId,comptes,ouvert}from"../_lib.js";
export async function onRequestGet({request,env}){
  try{
    const now=Math.floor(Date.now()/1000),id=lireId(request),voter=id?await sha(id+env.SECRET):null;
    const{results}=await env.DB.prepare(`SELECT v.id,v.round,v.ends_at,v.show_results,a.slug sa,a.name na,a.photo pa,b.slug sb,b.name nb,b.photo pb FROM versus v JOIN artists a ON a.id=v.artist_a JOIN artists b ON b.id=v.artist_b WHERE ${ouvert} ORDER BY v.id`).bind(now).all();
    const versus=[];
    for(const r of results){
      let mon=null;
      if(voter){const m=await env.DB.prepare("SELECT side FROM votes WHERE versus_id=? AND voter_hash=?").bind(r.id,voter).first();mon=m?m.side:null}
      versus.push({id:r.id,tour:r.round,reste:r.ends_at?Math.max(0,r.ends_at-now):null,
        a:{slug:r.sa,nom:r.na,photo:r.pa},b:{slug:r.sb,nom:r.nb,photo:r.pb},
        mon_vote:mon,resultats:mon&&r.show_results==="live"?await comptes(env.DB,r.id):null});
    }
    return json({ok:true,versus});
  }catch(e){return json({ok:false,message:"Erreur serveur."},500)}
}
