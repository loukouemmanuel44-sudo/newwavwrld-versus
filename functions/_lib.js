export const json=(o,status=200,headers={})=>new Response(JSON.stringify(o),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...headers}});
export async function sha(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export function lireId(req){const m=(req.headers.get("Cookie")||"").match(/(?:^|; )nw_id=([a-f0-9-]{36})/);return m?m[1]:null}
export const cookie=id=>`nw_id=${id}; Max-Age=31536000; Path=/; HttpOnly; Secure; SameSite=Lax`;
export async function comptes(db,id){const{results}=await db.prepare("SELECT side,COUNT(*) c FROM votes WHERE versus_id=? GROUP BY side").bind(id).all();const r={a:0,b:0};for(const x of results)r[x.side]=x.c;return r}
export const ouvert="status='open' AND (starts_at IS NULL OR starts_at<=?1) AND (ends_at IS NULL OR ends_at>?1)";
