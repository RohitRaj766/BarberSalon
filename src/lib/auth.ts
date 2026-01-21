import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface TokenPayload {
  username: string;
  iat: number;
}

export async function createToken(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as unknown as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload?.username || null;
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400, // 24 hours
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}
