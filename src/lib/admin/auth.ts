import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "techly_admin_session";

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "techly-dev-session"
  );
}

export function createSessionToken() {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  const signature = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  try {
    const actualBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function passwordsMatch(input: string, expected: string) {
  const actualBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}
