import crypto from "crypto";

const USERS = {
  father: { name: "父", hashEnv: "FATHER_PASSWORD_HASH" },
  mother: { name: "母", hashEnv: "MOTHER_PASSWORD_HASH" },
  son1: { name: "長男", hashEnv: "SON1_PASSWORD_HASH" },
  son2: { name: "次男", hashEnv: "SON2_PASSWORD_HASH" }
};

export function getUser(userId) { return USERS[userId] || null; }

export function verifyPassword(userId, password) {
  const user = getUser(userId);
  if (!user || typeof password !== "string") return false;
  const expected = process.env[user.hashEnv];
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  const actual = crypto.createHash("sha256").update(password, "utf8").digest("hex");
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return s;
}

export function createSessionToken(userId) {
  const exp = Math.floor(Date.now() / 1000) + 604800;
  const payload = Buffer.from(JSON.stringify({ userId, exp }), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest();
  let provided;
  try { provided = Buffer.from(sig, "base64url"); } catch { return null; }
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const user = getUser(data.userId);
    if (!user || !data.exp || data.exp < Math.floor(Date.now()/1000)) return null;
    return { id: data.userId, name: user.name };
  } catch { return null; }
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim().slice(0,64) : "unknown";
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const a = new URL(origin), b = new URL(request.url);
    return a.host === b.host && a.protocol === b.protocol;
  } catch { return false; }
}
