const APP_ORIGIN = "https://danatstores-wq.github.io";
const ADMIN_EMAIL = "notredamedusecours5@gmail.com";
const FIREBASE_PROJECT = "notre-dame-du-secours";
const IMAGEKIT_API = "https://api.imagekit.io/v1";

function cors(origin) {
  const allowed = origin === APP_ORIGIN ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...cors(origin) }
  });
}
function basicAuth(env) {
  return "Basic " + btoa(env.IMAGEKIT_PRIVATE_KEY + ":");
}
async function verifyPriest(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const response = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(env.FIREBASE_WEB_API_KEY), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: auth.slice(7) })
  });
  if (!response.ok) return false;
  const data = await response.json();
  const user = data.users && data.users[0];
  return !!user && user.emailVerified === true && user.disabled !== true &&
    String(user.email || "").toLowerCase() === ADMIN_EMAIL;
}
async function uploadAuth(env) {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 10;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.IMAGEKIT_PRIVATE_KEY), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(token + expire));
  const signature = Array.from(new Uint8Array(signatureBytes)).map(b => b.toString(16).padStart(2, "0")).join("");
  return { token, expire, signature, publicKey: env.IMAGEKIT_PUBLIC_KEY };
}
async function listSiteContent() {
  const docs = [];
  let pageToken = "";
  do {
    const url = new URL("https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT + "/databases/(default)/documents/siteContent");
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not verify published photo references in Firestore (" + response.status + ").");
    const data = await response.json();
    docs.push(...(data.documents || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return docs;
}
function firestoreToPlain(value) {
  if (!value || typeof value !== "object") return value;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return value.integerValue;
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreToPlain);
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k,v]) => [k, firestoreToPlain(v)]));
  return value;
}
function containsReference(value, fileId, imageUrl) {
  if (value == null) return false;
  if (typeof value === "string") {
    if (fileId && value === fileId) return true;
    if (imageUrl && value.split("?")[0] === imageUrl.split("?")[0]) return true;
    return false;
  }
  if (Array.isArray(value)) return value.some(v => containsReference(v, fileId, imageUrl));
  if (typeof value === "object") return Object.values(value).some(v => containsReference(v, fileId, imageUrl));
  return false;
}
async function isReferenced(fileId, imageUrl) {
  const docs = await listSiteContent();
  return docs.some(doc => containsReference(firestoreToPlain(doc.fields || {}), fileId, imageUrl));
}
async function deleteImageKitFile(fileId, env) {
  const response = await fetch(IMAGEKIT_API + "/files/" + encodeURIComponent(fileId), {
    method: "DELETE",
    headers: { "Authorization": basicAuth(env) }
  });
  if (response.status === 404) return { deleted: true, alreadyMissing: true };
  if (!response.ok) throw new Error("ImageKit delete failed (" + response.status + ").");
  return { deleted: true };
}
async function handleRequest(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (origin !== APP_ORIGIN) return json({ error: "Forbidden origin" }, 403, origin);
  const url = new URL(request.url);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (!await verifyPriest(request, env)) return json({ error: "Only the verified parish priest can perform this action." }, 403, origin);

  if (url.pathname === "/upload-auth") {
    return json(await uploadAuth(env), 200, origin);
  }
  if (url.pathname === "/delete-file") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON body." }, 400, origin); }
    const fileId = String(body.fileId || "").trim();
    const imageUrl = String(body.url || "").trim();
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(fileId)) return json({ error: "Invalid ImageKit file ID." }, 400, origin);
    if (await isReferenced(fileId, imageUrl)) return json({ deleted: false, kept: true, reason: "This photo is still referenced by published parish content." }, 200, origin);
    return json(await deleteImageKitFile(fileId, env), 200, origin);
  }
  return json({ error: "Not found" }, 404, origin);
}
async function cleanupExpiredFiles(env) {
  const now = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let next = 0, deleted = 0, kept = 0;
  do {
    const url = new URL(IMAGEKIT_API + "/files");
    url.searchParams.set("path", "/parish-media");
    url.searchParams.set("limit", "1000");
    url.searchParams.set("skip", String(next));
    const response = await fetch(url, { headers: { "Authorization": basicAuth(env) } });
    if (!response.ok) throw new Error("ImageKit file listing failed (" + response.status + ").");
    const files = await response.json();
    if (!Array.isArray(files) || !files.length) break;
    for (const file of files) {
      const tags = Array.isArray(file.tags) ? file.tags : [];
      const rule = tags.find(tag => /^parish_delete_after_\d{8}$/.test(tag));
      if (!rule || rule.slice(-8) > now || !file.fileId) continue;
      if (await isReferenced(file.fileId, file.url || "")) { kept++; continue; }
      await deleteImageKitFile(file.fileId, env);
      deleted++;
    }
    next += files.length;
    if (files.length < 1000) break;
  } while (next < 10000);
  return { deleted, kept };
}
export default {
  async fetch(request, env) {
    try { return await handleRequest(request, env); }
    catch (error) {
      const origin = request.headers.get("Origin") || "";
      return json({ error: error.message || "Worker error." }, 500, origin);
    }
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(cleanupExpiredFiles(env));
  }
};
