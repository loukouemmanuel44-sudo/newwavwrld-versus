import { onRequestGet as listeVersus } from "../functions/api/versus.js";
import { onRequestPost as voter } from "../functions/api/vote.js";

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    if (u.pathname === "/api/versus" && request.method === "GET") return listeVersus({ request, env });
    if (u.pathname === "/api/vote" && request.method === "POST") return voter({ request, env });
    if (u.pathname.startsWith("/api/")) return new Response("Introuvable", { status: 404 });
    return env.ASSETS.fetch(request);
  }
};
