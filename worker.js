const MAX_HOPS = 8;
const TIMEOUT_MS = 7000;

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status, headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}
function isPrivateIPv4(host) {
  const p = host.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) || p[0] >= 224;
}
function validateUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error("Format URL tidak valid."); }
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Hanya protokol HTTP dan HTTPS yang diizinkan.");
  if (u.username || u.password) throw new Error("URL dengan username/password tidak diizinkan.");
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
      host === "metadata.google.internal" || host === "169.254.169.254") throw new Error("Host lokal atau metadata tidak diizinkan.");
  if (isPrivateIPv4(host) || host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:"))
    throw new Error("Alamat IP privat tidak diizinkan.");
  if (u.port && !["80", "443"].includes(u.port)) throw new Error("Port selain 80/443 tidak diizinkan.");
  u.hash = "";
  return u;
}
export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") return new Response(null, {headers:{
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods":"POST, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type",
      "Access-Control-Max-Age":"86400"
    }});
    const url = new URL(request.url);
    if (url.pathname !== "/api/resolve" || request.method !== "POST")
      return json({error:"Endpoint tidak ditemukan."}, 404, allowed);
    try {
      const body = await request.json();
      if (!body || typeof body.url !== "string" || body.url.length > 2048)
        return json({error:"URL tidak valid atau terlalu panjang."}, 400, allowed);
      let current = validateUrl(body.url);
      const hops = [];
      for (let i = 0; i < MAX_HOPS; i++) {
        const response = await fetch(current.toString(), {
          method: "GET", redirect: "manual",
          headers: {"User-Agent":"ShadowBypass-URL-Inspector/1.0", "Range":"bytes=0-0"},
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        const status = response.status;
        hops.push({url:current.toString(), status});
        const location = response.headers.get("Location");
        if (![301,302,303,307,308].includes(status) || !location) {
          try { response.body?.cancel(); } catch {}
          return json({hops, finalUrl:current.toString(), note:"Selesai. Tujuan ini adalah URL terakhir yang dapat diverifikasi secara publik."}, 200, allowed);
        }
        try { response.body?.cancel(); } catch {}
        current = validateUrl(new URL(location, current).toString());
      }
      return json({hops, finalUrl:current.toString(), note:"Batas 8 pengalihan tercapai; rantai mungkin berlanjut."}, 200, allowed);
    } catch (error) {
      return json({error:error?.name === "TimeoutError" ? "Server tujuan terlalu lama merespons." : (error.message || "Gagal memeriksa URL.")}, 400, allowed);
    }
  }
};
